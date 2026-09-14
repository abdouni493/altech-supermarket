import type { ReactNode } from 'react'
import { clsx } from '@/utils/clsx'

type Tone = 'paid' | 'partial' | 'unpaid' | 'neutral' | 'gold' | 'info' | 'sage'

const tones: Record<Tone, string> = {
  paid: 'bg-sage/10 text-sage border-sage/25',
  partial: 'bg-gold/10 text-gold border-gold/25',
  unpaid: 'bg-terracotta/10 text-terracotta border-terracotta/25',
  neutral: 'bg-wood-cream text-wood-medium border-wood-light/35',
  gold: 'bg-gold/10 text-gold border-gold/25',
  info: 'bg-wood-warm/10 text-wood-warm border-wood-warm/25',
  sage: 'bg-sage/10 text-sage border-sage/25',
}

export const Badge = ({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
      tones[tone],
      className,
    )}
  >
    {children}
  </span>
)

export const statusTone = (status: 'paid' | 'partial' | 'unpaid'): Tone => status
