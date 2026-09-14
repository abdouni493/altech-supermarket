import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Search, Plus, Trash2, Check, PackagePlus, UserPlus, ShoppingCart, CalendarClock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProductModal } from '@/pages/Stock/ProductModal'
import { useProductStore } from '@/store/useProductStore'
import { useSupplierStore } from '@/store/useSupplierStore'
import { usePurchaseStore } from '@/store/usePurchaseStore'
import { useTranslation } from '@/i18n/useTranslation'
import { formatMoney, round2 } from '@/utils/helpers'
import type { Product, Purchase, PurchaseLine, Supplier } from '@/types'

interface EditableLine extends PurchaseLine {
  _key: string
}

interface NewPurchaseModalProps {
  open: boolean
  onClose: () => void
  editing?: Purchase | null
}

export const NewPurchaseModal = ({ open, onClose, editing }: NewPurchaseModalProps) => {
  const { t } = useTranslation()
  const products = useProductStore((s) => s.products)
  const receiveStock = useProductStore((s) => s.receiveStock)
  const { suppliers, addSupplier } = useSupplierStore()
  const { addPurchase, updatePurchase } = usePurchaseStore()

  const [lines, setLines] = useState<EditableLine[]>([])
  const [productQuery, setProductQuery] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)

  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [supplierQuery, setSupplierQuery] = useState('')
  const [showNewSupplier, setShowNewSupplier] = useState(false)
  const [newSup, setNewSup] = useState({ name: '', phone: '', address: '' })

  const [paid, setPaid] = useState(0)
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    if (!open) return
    if (editing) {
      setLines(editing.lines.map((l, i) => ({ ...l, _key: `${l.productId}-${i}` })))
      setSupplier(suppliers.find((s) => s.id === editing.supplierId) ?? null)
      setSupplierQuery(editing.supplierName)
      setPaid(editing.paid)
      setDate(format(new Date(editing.date), 'yyyy-MM-dd'))
    } else {
      setLines([])
      setSupplier(null)
      setSupplierQuery('')
      setPaid(0)
      setDate(format(new Date(), 'yyyy-MM-dd'))
    }
    setProductQuery('')
  }, [open, editing]) // eslint-disable-line react-hooks/exhaustive-deps

  const total = useMemo(
    () => round2(lines.reduce((s, l) => s + l.quantity * l.purchasePrice, 0)),
    [lines],
  )

  // keep "paid" synced to total for new purchases until user edits manually
  useEffect(() => {
    if (!editing) setPaid(total)
  }, [total, editing])

  const productSuggestions = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    if (!q) return []
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q))
      .filter((p) => !lines.some((l) => l.productId === p.id))
      .slice(0, 6)
  }, [productQuery, products, lines])

  const supplierSuggestions = useMemo(() => {
    const q = supplierQuery.trim().toLowerCase()
    if (!q || supplier) return []
    return suppliers.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 5)
  }, [supplierQuery, suppliers, supplier])

  const addLine = (p: Product) => {
    setLines((prev) => [
      ...prev,
      {
        _key: `${p.id}-${Date.now()}`,
        productId: p.id,
        productName: p.name,
        barcode: p.barcode,
        quantity: 1,
        purchasePrice: p.purchasePrice,
        salePrice: p.salePrice,
        minQuantity: p.minQuantity,
        hasExpiration: p.hasExpiration ?? false,
        expirationDate: (p.expirationDate ?? '').slice(0, 10),
      },
    ])
    setProductQuery('')
  }

  const updateLine = (key: string, patch: Partial<EditableLine>) =>
    setLines((prev) => prev.map((l) => (l._key === key ? { ...l, ...patch } : l)))

  const removeLine = (key: string) => setLines((prev) => prev.filter((l) => l._key !== key))

  const rest = round2(Math.max(0, total - paid))

  const handleNewSupplier = () => {
    if (!newSup.name.trim()) {
      toast.error(t('required'))
      return
    }
    const created = addSupplier({ name: newSup.name, phone: newSup.phone, address: newSup.address })
    setSupplier(created)
    setSupplierQuery(created.name)
    setShowNewSupplier(false)
    setNewSup({ name: '', phone: '', address: '' })
  }

  const submit = () => {
    if (lines.length === 0) {
      toast.error(t('emptyCart'))
      return
    }
    const cleanLines: PurchaseLine[] = lines.map(({ _key, ...l }) => l) // eslint-disable-line @typescript-eslint/no-unused-vars

    if (editing) {
      updatePurchase(editing.id, {
        lines: cleanLines,
        total,
        paid,
        supplierId: supplier?.id ?? null,
        supplierName: supplier?.name ?? (supplierQuery || 'Fournisseur'),
        date: new Date(date).toISOString(),
      })
      toast.success(t('saved'))
    } else {
      addPurchase({
        supplierId: supplier?.id ?? null,
        supplierName: supplier?.name ?? (supplierQuery || 'Fournisseur'),
        lines: cleanLines,
        total,
        paid,
        payments: paid > 0 ? [{ id: `p-${Date.now()}`, amount: paid, date: new Date(date).toISOString(), note: 'Versement initial' }] : [],
        date: new Date(date).toISOString(),
      })
      // update stock
      cleanLines.forEach((l) =>
        receiveStock(l.productId, l.quantity, {
          purchasePrice: l.purchasePrice,
          salePrice: l.salePrice,
          minQuantity: l.minQuantity,
          hasExpiration: l.hasExpiration,
          expirationDate: l.hasExpiration ? l.expirationDate : undefined,
        }),
      )
      toast.success(t('saved'))
    }
    onClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={editing ? t('editPurchase') : t('newPurchase')}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button onClick={submit}>
              <Check size={16} />
              {t('save')}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 font-bold text-wood-dark"><ShoppingCart size={18} />{t('products')}</h4>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowProductModal(true)}>
                <PackagePlus size={15} />
                {t('newProduct')}
              </Button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-wood-medium/50" size={18} />
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder={`${t('search')} (${t('productName')} / ${t('barcode')})`}
                className="input-wood ps-10"
              />
              {productQuery && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-wood-light/30 bg-white shadow-wood-lg">
                  {productSuggestions.length > 0 ? (
                    productSuggestions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addLine(p)}
                        className="flex w-full items-center justify-between px-3 py-2 text-start text-sm transition hover:bg-wood-cream"
                      >
                        <span className="font-medium text-wood-dark">{p.name}</span>
                        <span className="text-mono text-xs text-wood-medium">{p.quantity} en stock</span>
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={() => setShowProductModal(true)}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm font-medium text-sage transition hover:bg-sage/10"
                    >
                      <PackagePlus size={16} />
                      {t('createThisProduct')} « {productQuery} »
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Lines */}
            <div className="mt-3 space-y-2">
              {lines.length === 0 ? (
                <p className="rounded-xl border border-dashed border-wood-light/40 py-6 text-center text-sm text-wood-medium">{t('addProduct')}</p>
              ) : (
                lines.map((l) => (
                  <div key={l._key} className="rounded-xl border border-wood-light/25 bg-wood-cream/20 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-wood-dark">{l.productName}</p>
                      <button onClick={() => removeLine(l._key)} className="rounded-lg p-1 text-terracotta hover:bg-terracotta/10"><Trash2 size={16} /></button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <label className="text-xs text-wood-medium">{t('qtyBought')}
                        <input type="number" min={1} value={l.quantity} onChange={(e) => updateLine(l._key, { quantity: Math.max(1, Number(e.target.value)) })} className="input-wood mt-0.5 py-1.5" />
                      </label>
                      <label className="text-xs text-wood-medium">{t('purchasePrice')}
                        <input type="number" step="0.01" value={l.purchasePrice} onChange={(e) => updateLine(l._key, { purchasePrice: Number(e.target.value) })} className="input-wood mt-0.5 py-1.5" />
                      </label>
                      <label className="text-xs text-wood-medium">{t('salePrice')}
                        <input type="number" step="0.01" value={l.salePrice} onChange={(e) => updateLine(l._key, { salePrice: Number(e.target.value) })} className="input-wood mt-0.5 py-1.5" />
                      </label>
                      <label className="text-xs text-wood-medium">{t('minQuantity')}
                        <input type="number" value={l.minQuantity} onChange={(e) => updateLine(l._key, { minQuantity: Number(e.target.value) })} className="input-wood mt-0.5 py-1.5" />
                      </label>
                    </div>

                    {/* Expiration date — activate / deactivate per line */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-wood-light/20 pt-2">
                      <label className="flex cursor-pointer items-center gap-2">
                        <span className="relative inline-flex">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={!!l.hasExpiration}
                            onChange={(e) => updateLine(l._key, { hasExpiration: e.target.checked })}
                          />
                          <span className="h-5 w-9 rounded-full bg-wood-light/40 transition peer-checked:bg-wood-warm" />
                          <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4" />
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-wood-dark">
                          <CalendarClock size={14} className="text-wood-warm" />
                          {t('enableExpiration')}
                        </span>
                      </label>
                      {l.hasExpiration && (
                        <label className="flex items-center gap-1.5 text-xs text-wood-medium">
                          {t('expirationDate')}
                          <input
                            type="date"
                            value={(l.expirationDate ?? '').slice(0, 10)}
                            onChange={(e) => updateLine(l._key, { expirationDate: e.target.value })}
                            className="input-wood py-1.5"
                          />
                        </label>
                      )}
                    </div>

                    <p className="mt-1 text-end text-xs text-wood-medium">{t('subtotal')}: <span className="text-mono font-bold text-wood-dark">{formatMoney(l.quantity * l.purchasePrice)}</span></p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Supplier + payment */}
          <div className="space-y-4">
            {/* Supplier */}
            <div className="rounded-xl border border-wood-light/25 p-3">
              <h4 className="mb-2 font-bold text-wood-dark">{t('supplier')}</h4>
              {supplier ? (
                <div className="flex items-center justify-between rounded-lg bg-sage/10 px-3 py-2">
                  <div>
                    <p className="font-medium text-wood-dark">{supplier.name}</p>
                    <p className="text-xs text-wood-medium">{supplier.phone}</p>
                  </div>
                  <button onClick={() => { setSupplier(null); setSupplierQuery('') }} className="text-xs text-terracotta">×</button>
                </div>
              ) : (
                <div className="relative">
                  <input value={supplierQuery} onChange={(e) => setSupplierQuery(e.target.value)} placeholder={t('supplier')} className="input-wood" />
                  {supplierSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-wood-light/30 bg-white shadow-wood-lg">
                      {supplierSuggestions.map((s) => (
                        <button key={s.id} onClick={() => { setSupplier(s); setSupplierQuery(s.name) }} className="block w-full px-3 py-2 text-start text-sm hover:bg-wood-cream">{s.name}</button>
                      ))}
                    </div>
                  )}
                  <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => setShowNewSupplier((v) => !v)}>
                    <UserPlus size={15} />{t('newSupplier')}
                  </Button>
                  {showNewSupplier && (
                    <div className="mt-2 space-y-2">
                      <input value={newSup.name} onChange={(e) => setNewSup({ ...newSup, name: e.target.value })} placeholder={t('name')} className="input-wood py-1.5" />
                      <input value={newSup.phone} onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })} placeholder={t('phone')} className="input-wood py-1.5" />
                      <input value={newSup.address} onChange={(e) => setNewSup({ ...newSup, address: e.target.value })} placeholder={t('address')} className="input-wood py-1.5" />
                      <Button type="button" variant="sage" size="sm" className="w-full" onClick={handleNewSupplier}><Plus size={15} />{t('add')}</Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="rounded-xl border border-wood-light/25 p-3">
              <h4 className="mb-2 font-bold text-wood-dark">{t('payment')}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-wood-cream/40 px-3 py-2">
                  <span className="text-sm text-wood-medium">{t('total')}</span>
                  <span className="text-mono font-bold text-wood-dark">{formatMoney(total)}</span>
                </div>
                <Input label={t('amountPaid')} type="number" step="0.01" value={paid} onChange={(e) => setPaid(Number(e.target.value))} />
                <Input label={t('date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <div className="flex items-center justify-between rounded-lg bg-terracotta/10 px-3 py-2">
                  <span className="text-sm text-wood-medium">{t('remaining')}</span>
                  <span className="text-mono font-bold text-terracotta">{formatMoney(rest)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <ProductModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        presetName={productQuery}
        onSaved={(p) => addLine(p)}
      />
    </>
  )
}
