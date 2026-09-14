import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Camera, Check, Keyboard, RefreshCw, X, Zap, ZapOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/i18n/useTranslation'

// ---------------------------------------------------------------------------
// Minimal typing for the native Barcode Detection API. Chrome on Android ships
// it and decodes far faster than a JS fallback, so we use it when present and
// only fall back to ZXing elsewhere (iOS Safari, Firefox).
// ---------------------------------------------------------------------------
interface NativeDetectedBarcode {
  rawValue: string
}
interface NativeBarcodeDetector {
  detect: (source: CanvasImageSource) => Promise<NativeDetectedBarcode[]>
}
interface NativeBarcodeDetectorCtor {
  new (options?: { formats?: string[] }): NativeBarcodeDetector
  getSupportedFormats?: () => Promise<string[]>
}

const NATIVE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'codabar', 'qr_code']

/**
 * ZXing is ~300 kB and is only needed where the browser has no native detector
 * (iOS Safari, Firefox), so it is fetched the first time a scan actually needs
 * it rather than shipped in the main bundle.
 */
const loadZxingReader = async () => {
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
    import('@zxing/browser'),
    import('@zxing/library'),
  ])
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.ITF,
    BarcodeFormat.CODABAR,
    BarcodeFormat.QR_CODE,
  ])
  hints.set(DecodeHintType.TRY_HARDER, true)
  return new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 120 })
}

const getDetectorCtor = (): NativeBarcodeDetectorCtor | null => {
  const ctor = (window as unknown as { BarcodeDetector?: NativeBarcodeDetectorCtor }).BarcodeDetector
  return typeof ctor === 'function' ? ctor : null
}

/** Short confirmation blip — a scan must register without the cashier looking up. */
const beep = () => {
  try {
    const Ctx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 1720
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.13)
    osc.onended = () => {
      void ctx.close().catch(() => {})
    }
  } catch {
    /* audio is a nicety, never a requirement */
  }
  try {
    navigator.vibrate?.(40)
  } catch {
    /* ignore */
  }
}

export interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  /** Called with every accepted code — the caller decides what to do with it. */
  onDetected: (code: string) => void
  /**
   * Keep the camera running after a hit (a cashier scanning a whole basket).
   * When false the scanner closes itself on the first successful read.
   */
  continuous?: boolean
  title?: string
}

export const BarcodeScanner = ({ open, onClose, onDetected, continuous = false, title }: BarcodeScannerProps) => {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastHitRef = useRef<{ code: string; at: number }>({ code: '', at: 0 })
  const closedRef = useRef(false)
  // The decode loop is started once per camera session and keeps whatever
  // callbacks it captured, so they are read through refs to stay current.
  const onDetectedRef = useRef(onDetected)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onDetectedRef.current = onDetected
    onCloseRef.current = onClose
  })

  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(true)
  const [lastCode, setLastCode] = useState<string | null>(null)
  const [torchOn, setTorchOn] = useState(false)
  const [torchAvailable, setTorchAvailable] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [manual, setManual] = useState('')
  const [deviceIds, setDeviceIds] = useState<string[]>([])
  const [deviceIndex, setDeviceIndex] = useState(0)

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    controlsRef.current?.stop()
    controlsRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setTorchOn(false)
    setTorchAvailable(false)
  }, [])

  /** One code is accepted at most once every 1.2s, so a held barcode reads once. */
  const accept = useCallback(
    (code: string) => {
      const value = code.trim()
      if (!value) return
      const now = Date.now()
      if (lastHitRef.current.code === value && now - lastHitRef.current.at < 1200) return
      lastHitRef.current = { code: value, at: now }
      beep()
      setLastCode(value)
      onDetectedRef.current(value)
      if (!continuous && !closedRef.current) {
        closedRef.current = true
        stopCamera()
        onCloseRef.current()
      }
    },
    [continuous, stopCamera],
  )

  // --- camera lifecycle -----------------------------------------------------
  useEffect(() => {
    if (!open) return
    closedRef.current = false
    let cancelled = false
    setError(null)
    setStarting(true)
    setLastCode(null)

    const run = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(window.isSecureContext ? t('cameraUnsupported') : t('cameraNeedsHttps'))
        setStarting(false)
        return
      }
      try {
        const preferred = deviceIds[deviceIndex]
        const stream = await navigator.mediaDevices.getUserMedia({
          video: preferred
            ? { deviceId: { exact: preferred }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play().catch(() => {})

        const track = stream.getVideoTracks()[0]
        const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined
        setTorchAvailable(Boolean(caps?.torch))

        // Camera labels/ids only become listable once permission is granted.
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const cams = devices.filter((d) => d.kind === 'videoinput').map((d) => d.deviceId).filter(Boolean)
          if (!cancelled && cams.length) setDeviceIds(cams)
        } catch {
          /* listing cameras is optional */
        }

        setStarting(false)

        const Detector = getDetectorCtor()
        if (Detector) {
          let formats = NATIVE_FORMATS
          try {
            const supported = await Detector.getSupportedFormats?.()
            if (supported?.length) formats = NATIVE_FORMATS.filter((f) => supported.includes(f))
          } catch {
            /* fall through with the full list */
          }
          const detector = new Detector({ formats })
          const tick = async () => {
            if (cancelled || !videoRef.current) return
            try {
              if (videoRef.current.readyState >= 2) {
                const hits = await detector.detect(videoRef.current)
                if (hits.length) accept(hits[0].rawValue)
              }
            } catch {
              /* transient decode errors between frames are normal */
            }
            if (!cancelled) rafRef.current = requestAnimationFrame(() => void tick())
          }
          rafRef.current = requestAnimationFrame(() => void tick())
          return
        }

        const reader = await loadZxingReader()
        if (cancelled) return
        const controls = await reader.decodeFromVideoElement(video, (result) => {
          if (result) accept(result.getText())
        })
        if (cancelled) controls.stop()
        else controlsRef.current = controls
      } catch (e) {
        if (cancelled) return
        const name = (e as DOMException)?.name
        setError(
          name === 'NotAllowedError' || name === 'SecurityError'
            ? t('cameraDenied')
            : name === 'NotFoundError' || name === 'OverconstrainedError'
              ? t('cameraNotFound')
              : t('cameraError'),
        )
        setStarting(false)
      }
    }

    void run()
    return () => {
      cancelled = true
      stopCamera()
    }
  }, [open, deviceIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Escape closes the scanner only — swallowed so a parent Modal stays open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      e.preventDefault()
      onCloseRef.current()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open])

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const next = !torchOn
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] } as unknown as MediaTrackConstraints)
      setTorchOn(next)
    } catch {
      setTorchAvailable(false)
    }
  }

  const switchCamera = () => {
    if (deviceIds.length < 2) return
    stopCamera()
    setDeviceIndex((i) => (i + 1) % deviceIds.length)
  }

  const submitManual = () => {
    const value = manual.trim()
    if (!value) return
    setManual('')
    setManualOpen(false)
    accept(value)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[120] flex flex-col bg-wood-dark/95 backdrop-blur-sm"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white sm:px-6">
            <h3 className="flex items-center gap-2 text-display text-base font-bold sm:text-lg">
              <Camera size={20} />
              {title ?? t('scanBarcode')}
            </h3>
            <button
              onClick={onClose}
              aria-label={t('close')}
              className="rounded-lg p-2 text-white/90 transition hover:bg-white/15"
            >
              <X size={22} />
            </button>
          </div>

          {/* Viewfinder */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" />

            {!error && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-40 w-[82%] max-w-md overflow-hidden rounded-2xl border-2 border-white/70 shadow-[0_0_0_100vmax_rgba(15,23,42,0.45)]">
                  <motion.div
                    animate={{ y: ['-60%', '60%', '-60%'] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-x-2 top-1/2 h-0.5 rounded-full bg-sky-400 shadow-[0_0_12px_2px_rgba(56,189,248,0.9)]"
                  />
                </div>
              </div>
            )}

            {starting && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-wood-dark/70 text-sm text-white">
                <RefreshCw size={18} className="me-2 animate-spin" />
                {t('startingCamera')}
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <AlertTriangle size={38} className="text-gold-light" />
                <p className="max-w-sm text-sm font-medium text-white">{error}</p>
                <Button variant="outline" size="sm" onClick={() => setManualOpen(true)}>
                  <Keyboard size={15} />
                  {t('enterBarcodeManually')}
                </Button>
              </div>
            )}

            <AnimatePresence>
              {lastCode && (
                <motion.div
                  key={lastCode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="absolute bottom-4 rounded-full bg-sage px-4 py-2 text-sm font-bold text-white shadow-wood-lg"
                >
                  <span className="flex items-center gap-2">
                    <Check size={16} />
                    <span className="text-mono">{lastCode}</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="shrink-0 space-y-3 px-4 py-4 sm:px-6">
            <p className="text-center text-xs text-white/70">{continuous ? t('scanHintContinuous') : t('scanHint')}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {torchAvailable && (
                <Button variant="outline" size="sm" onClick={toggleTorch}>
                  {torchOn ? <ZapOff size={15} /> : <Zap size={15} />}
                  {t('torch')}
                </Button>
              )}
              {deviceIds.length > 1 && (
                <Button variant="outline" size="sm" onClick={switchCamera}>
                  <RefreshCw size={15} />
                  {t('switchCamera')}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setManualOpen((v) => !v)}>
                <Keyboard size={15} />
                {t('enterBarcodeManually')}
              </Button>
              {continuous && (
                <Button variant="sage" size="sm" onClick={onClose}>
                  <Check size={15} />
                  {t('done')}
                </Button>
              )}
            </div>
            {manualOpen && (
              <div className="mx-auto flex max-w-sm gap-2">
                <input
                  autoFocus
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitManual()}
                  placeholder={t('barcode')}
                  className="input-wood font-mono"
                />
                <Button size="sm" onClick={submitManual}>
                  <Check size={15} />
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** Compact "scan with the phone camera" trigger, sized to sit next to inputs. */
export const ScanButton = ({
  onClick,
  label,
  className,
  size = 'md',
}: {
  onClick: () => void
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'icon'
}) => {
  const { t } = useTranslation()
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onClick}
      className={className}
      title={t('scanWithCamera')}
      aria-label={t('scanWithCamera')}
    >
      <Camera size={size === 'sm' ? 14 : 16} />
      {size !== 'icon' && (label ?? t('scan'))}
    </Button>
  )
}
