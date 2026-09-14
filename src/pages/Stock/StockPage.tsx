import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, SprayCan, Barcode as BarcodeIcon, CalendarClock, CalendarX } from 'lucide-react'
import { format } from 'date-fns'
import { PageHeader, SearchInput, EmptyState, ViewToggle, ProgressBar } from '@/components/ui/Misc'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ProductModal } from './ProductModal'
import { Barcode } from '@/components/shared/BarcodeGenerator'
import { useProductStore } from '@/store/useProductStore'
import { useTranslation } from '@/i18n/useTranslation'
import { formatMoney, expiryInfo } from '@/utils/helpers'
import { cardVariants, staggerContainer } from '@/utils/animations'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

/** Compact pill showing a product's expiration date, coloured by urgency. */
const ExpiryPill = ({ product, full = false }: { product: Product; full?: boolean }) => {
  const { t } = useTranslation()
  if (!product.hasExpiration || !product.expirationDate) return null
  const info = expiryInfo(product.expirationDate)
  if (!info) return null
  const dateLabel = format(new Date(product.expirationDate), 'dd/MM/yyyy')
  const tone =
    info.status === 'expired'
      ? 'bg-terracotta/15 text-terracotta border-terracotta/30'
      : info.status === 'soon'
        ? 'bg-gold/15 text-[#B45309] border-gold/40'
        : 'bg-sage/12 text-sage border-sage/25'
  const Icon = info.status === 'expired' ? CalendarX : CalendarClock
  const note =
    info.status === 'expired'
      ? info.days === 0
        ? t('expiresToday')
        : t('expiredSinceDays').replace('{n}', String(Math.abs(info.days)))
      : info.days === 0
        ? t('expiresToday')
        : t('expiresInDays').replace('{n}', String(info.days))
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tone} ${
        info.status === 'expired' ? 'animate-pulse-glow' : ''
      }`}
      title={`${t('expiresOn')} ${dateLabel}`}
    >
      <Icon size={13} />
      {full ? `${dateLabel} · ${note}` : dateLabel}
    </span>
  )
}

export const StockPage = () => {
  const { t } = useTranslation()
  const { products, brands, categories, deleteProduct } = useProductStore()
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [viewing, setViewing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const q = search.toLowerCase()
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q)
        const matchBrand = !brandFilter || p.brand === brandFilter
        const matchCat = !catFilter || p.category === catFilter
        return matchSearch && matchBrand && matchCat
      }),
    [products, search, brandFilter, catFilter],
  )

  const stockBadge = (p: Product) => {
    if (p.quantity === 0) return <Badge tone="unpaid">{t('outOfStock')}</Badge>
    if (p.quantity <= p.minQuantity) return <Badge tone="partial">{t('lowStock')}</Badge>
    return <Badge tone="paid">{t('inStock')}</Badge>
  }

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (p: Product) => {
    setEditing(p)
    setModalOpen(true)
  }

  return (
    <div>
      <PageHeader
        title={t('stock')}
        subtitle={`${products.length} ${t('products').toLowerCase()}`}
        actions={
          <Button onClick={openNew}>
            <Plus size={18} />
            {t('newProduct')}
          </Button>
        }
      />

      {/* Filters */}
      <div className="card-wood mb-5 flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <SearchInput value={search} onChange={setSearch} placeholder={`${t('search')}…`} className="min-w-[220px] flex-1" />
        <Select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="max-w-[200px]">
          <option value="">{t('all')} — {t('brand')}</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </Select>
        <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="max-w-[200px]">
          <option value="">{t('all')} — {t('category')}</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <ViewToggle view={view} onChange={setView} labels={{ cards: t('cardView'), table: t('tableView') }} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t('noData')} hint={t('noDataHint')} icon={<SprayCan size={40} />} action={<Button onClick={openNew}><Plus size={18} />{t('newProduct')}</Button>} />
      ) : view === 'cards' ? (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                variants={cardVariants}
                custom={i}
                layout
                whileHover={{ y: -5 }}
                className="card-wood flex flex-col rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-wood-dark">{p.name}</h3>
                    <p className="text-xs text-wood-medium">{p.brand} · {p.category}</p>
                  </div>
                  {stockBadge(p)}
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-wood-medium/70">
                  <BarcodeIcon size={13} />
                  <span className="text-mono">{p.barcode}</span>
                </div>

                {p.hasExpiration && p.expirationDate && (
                  <div className="mt-2">
                    <ExpiryPill product={p} full />
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-wood-cream/40 px-2 py-1.5">
                    <p className="text-[10px] text-wood-medium">{t('purchasePrice')}</p>
                    <p className="text-mono font-semibold text-wood-dark">{formatMoney(p.purchasePrice)}</p>
                  </div>
                  <div className="rounded-lg bg-sage/10 px-2 py-1.5">
                    <p className="text-[10px] text-wood-medium">{t('salePrice')}</p>
                    <p className="text-mono font-semibold text-sage">{formatMoney(p.salePrice)}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-wood-medium">{t('quantity')}</span>
                    <span className="text-mono font-bold text-wood-dark">{p.quantity} <span className="text-wood-medium/60">/ min {p.minQuantity}</span></span>
                  </div>
                  <ProgressBar value={p.quantity} max={Math.max(p.minQuantity * 3, p.quantity)} danger={p.quantity <= p.minQuantity} />
                </div>

                <div className="mt-4 flex gap-2 border-t border-wood-light/20 pt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewing(p)}>
                    <Eye size={15} />
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}>
                    <Pencil size={15} />
                  </Button>
                  <Button size="sm" variant="danger" className="flex-1" onClick={() => setDeleting(p)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="card-wood overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-wood-header text-white">
                <tr>
                  <th className="px-4 py-3 text-start">{t('productName')}</th>
                  <th className="px-4 py-3 text-start">{t('brand')}</th>
                  <th className="px-4 py-3 text-start">{t('category')}</th>
                  <th className="px-4 py-3 text-end">{t('purchasePrice')}</th>
                  <th className="px-4 py-3 text-end">{t('salePrice')}</th>
                  <th className="px-4 py-3 text-center">{t('quantity')}</th>
                  <th className="px-4 py-3 text-center">{t('status')}</th>
                  <th className="px-4 py-3 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: i * 0.03 } }}
                    className="border-b border-wood-light/15 hover:bg-wood-cream/30"
                  >
                    <td className="px-4 py-2.5 font-medium text-wood-dark">{p.name}</td>
                    <td className="px-4 py-2.5 text-wood-medium">{p.brand}</td>
                    <td className="px-4 py-2.5 text-wood-medium">{p.category}</td>
                    <td className="text-mono px-4 py-2.5 text-end">{formatMoney(p.purchasePrice)}</td>
                    <td className="text-mono px-4 py-2.5 text-end text-sage">{formatMoney(p.salePrice)}</td>
                    <td className="text-mono px-4 py-2.5 text-center font-bold">{p.quantity}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col items-center gap-1">
                        {stockBadge(p)}
                        <ExpiryPill product={p} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => setViewing(p)} className="rounded-lg p-1.5 text-wood-medium hover:bg-wood-cream"><Eye size={16} /></button>
                        <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-wood-warm hover:bg-wood-cream"><Pencil size={16} /></button>
                        <button onClick={() => setDeleting(p)} className="rounded-lg p-1.5 text-terracotta hover:bg-terracotta/10"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProductModal open={modalOpen} onClose={() => setModalOpen(false)} product={editing} />

      {/* View modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name} subtitle={`${viewing?.brand} · ${viewing?.category}`} size="md">
        {viewing && (
          <div className="space-y-4">
            <p className="text-sm text-wood-medium">{viewing.description || '—'}</p>
            <div className="flex justify-center rounded-xl bg-white p-3">
              <Barcode value={viewing.barcode} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-wood-cream/40 p-3"><p className="text-xs text-wood-medium">{t('purchasePrice')}</p><p className="text-mono font-bold text-wood-dark">{formatMoney(viewing.purchasePrice)}</p></div>
              <div className="rounded-xl bg-sage/10 p-3"><p className="text-xs text-wood-medium">{t('salePrice')}</p><p className="text-mono font-bold text-sage">{formatMoney(viewing.salePrice)}</p></div>
              <div className="rounded-xl bg-wood-cream/40 p-3"><p className="text-xs text-wood-medium">{t('mainQuantity')}</p><p className="text-mono font-bold">{viewing.quantity}</p></div>
              <div className="rounded-xl bg-wood-cream/40 p-3"><p className="text-xs text-wood-medium">{t('minQuantity')}</p><p className="text-mono font-bold">{viewing.minQuantity}</p></div>
            </div>
            {viewing.hasExpiration && viewing.expirationDate && (
              <div className="flex items-center justify-between rounded-xl bg-wood-cream/40 p-3">
                <span className="flex items-center gap-1.5 text-xs text-wood-medium"><CalendarClock size={14} />{t('expirationDate')}</span>
                <ExpiryPill product={viewing} full />
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteProduct(deleting.id)
            toast.success(t('deleted'))
          }
        }}
      />
    </div>
  )
}
