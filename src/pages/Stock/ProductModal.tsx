import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import toast from 'react-hot-toast'
import { Plus, RefreshCw, Printer, Check, Boxes, Info } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Barcode } from '@/components/shared/BarcodeGenerator'
import { useProductStore } from '@/store/useProductStore'
import { useTranslation } from '@/i18n/useTranslation'
import { generateEAN13 } from '@/utils/helpers'
import type { Product } from '@/types'

// Product creation captures only the identity of the article. Pricing, alert
// thresholds and expiration are set later — when the first purchase is recorded.
const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  barcode: z.string().optional(),
  brand: z.string().min(1),
  category: z.string().min(1),
  quantity: z.coerce.number().min(0),
})
type FormData = z.infer<typeof schema>

interface ProductModalProps {
  open: boolean
  onClose: () => void
  product?: Product | null
  onSaved?: (product: Product) => void
  presetName?: string
}

export const ProductModal = ({ open, onClose, product, onSaved, presetName }: ProductModalProps) => {
  const { t } = useTranslation()
  const { brands, categories, addProduct, updateProduct, addBrand, addCategory } = useProductStore()
  const printRef = useRef<HTMLDivElement>(null)

  const [showAddBrand, setShowAddBrand] = useState(false)
  const [showAddCat, setShowAddCat] = useState(false)
  const [newBrand, setNewBrand] = useState('')
  const [newCat, setNewCat] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      barcode: '',
      brand: brands[0] ?? '',
      category: categories[0] ?? '',
      quantity: 0,
    },
  })

  useEffect(() => {
    if (!open) return
    if (product) {
      reset({
        name: product.name,
        description: product.description ?? '',
        barcode: product.barcode ?? '',
        brand: product.brand,
        category: product.category,
        quantity: product.quantity,
      })
    } else {
      reset({
        name: presetName ?? '',
        description: '',
        barcode: '', // empty by default — generate on demand
        brand: brands[0] ?? '',
        category: categories[0] ?? '',
        quantity: 0,
      })
    }
  }, [open, product, presetName]) // eslint-disable-line react-hooks/exhaustive-deps

  const barcode = watch('barcode')

  const handlePrint = useReactToPrint({ content: () => printRef.current })

  const onSubmit = (data: FormData) => {
    if (product) {
      // Edit: only touch the identity fields, keep pricing/alerts/expiry intact.
      const patch = {
        name: data.name,
        description: data.description ?? '',
        barcode: data.barcode ?? '',
        brand: data.brand,
        category: data.category,
        quantity: data.quantity,
      }
      updateProduct(product.id, patch)
      toast.success(t('saved'))
      onSaved?.({ ...product, ...patch })
    } else {
      // New product: pricing, alert threshold and expiration start empty and are
      // filled in automatically when the first purchase of this product is saved.
      const created = addProduct({
        name: data.name,
        description: data.description ?? '',
        barcode: data.barcode ?? '',
        brand: data.brand,
        category: data.category,
        quantity: data.quantity,
        purchasePrice: 0,
        salePrice: 0,
        minQuantity: 0,
        hasExpiration: false,
        expirationDate: undefined,
      })
      toast.success(t('saved'))
      onSaved?.(created)
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? t('editProduct') : t('newProduct')}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>
            <Check size={16} />
            {t('save')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label={t('productName')} {...register('name')} error={errors.name && t('required')} />
        <Textarea label={t('description')} {...register('description')} />

        {/* Brand + Category */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-end gap-2">
              <Select label={t('brand')} {...register('brand')} error={errors.brand && t('required')}>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
              <Button type="button" variant="outline" size="icon" onClick={() => setShowAddBrand((v) => !v)}>
                <Plus size={18} />
              </Button>
            </div>
            {showAddBrand && (
              <div className="mt-2 flex gap-2">
                <input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder={t('newBrand')} className="input-wood" />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (newBrand.trim()) {
                      addBrand(newBrand.trim())
                      setValue('brand', newBrand.trim())
                      setNewBrand('')
                      setShowAddBrand(false)
                    }
                  }}
                >
                  <Check size={15} />
                </Button>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-end gap-2">
              <Select label={t('category')} {...register('category')} error={errors.category && t('required')}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Button type="button" variant="outline" size="icon" onClick={() => setShowAddCat((v) => !v)}>
                <Plus size={18} />
              </Button>
            </div>
            {showAddCat && (
              <div className="mt-2 flex gap-2">
                <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder={t('newCategory')} className="input-wood" />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (newCat.trim()) {
                      addCategory(newCat.trim())
                      setValue('category', newCat.trim())
                      setNewCat('')
                      setShowAddCat(false)
                    }
                  }}
                >
                  <Check size={15} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Current stock */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-wood flex items-center gap-1.5">
              <Boxes size={15} className="text-wood-warm" />
              {t('currentStock')}
            </label>
            <input type="number" min={0} className="input-wood" {...register('quantity')} />
          </div>
        </div>

        {/* Barcode (optional) */}
        <div className="rounded-xl border border-wood-light/30 bg-wood-cream/40 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input label={`${t('barcode')} (${t('optional')})`} className="font-mono" {...register('barcode')} />
            <Button type="button" variant="outline" onClick={() => setValue('barcode', generateEAN13())}>
              <RefreshCw size={15} />
              {t('generateBarcode')}
            </Button>
            <Button type="button" variant="gold" onClick={handlePrint} disabled={!barcode}>
              <Printer size={15} />
              {t('printBarcode')}
            </Button>
          </div>
          {barcode ? (
            <div className="mt-3 flex justify-center rounded-lg bg-white p-2">
              <Barcode value={barcode} />
            </div>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-wood-medium/80">
              <Info size={13} /> {t('barcodeOptionalHint')}
            </p>
          )}
          {/* print template */}
          <div className="hidden">
            <div ref={printRef} className="print-area flex flex-col items-center p-6">
              <p className="mb-2 text-center text-lg font-bold">{watch('name')}</p>
              {barcode && <Barcode value={barcode} height={80} />}
            </div>
          </div>
        </div>

        {/* Pricing notice — set later during the first purchase */}
        <div className="flex items-start gap-2 rounded-xl border border-wood-light/30 bg-gradient-to-br from-wood-cream/60 to-white px-4 py-3 text-xs text-wood-medium">
          <Info size={15} className="mt-0.5 shrink-0 text-wood-warm" />
          <span>{t('pricingLaterHint')}</span>
        </div>
      </form>
    </Modal>
  )
}
