import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Search, Plus, Minus, X, Trash2, ShoppingBag, UserPlus, Check, SprayCan } from 'lucide-react'
import { PageHeader } from '@/components/ui/Misc'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useProductStore } from '@/store/useProductStore'
import { useClientStore } from '@/store/useClientStore'
import { useSalesStore } from '@/store/useSalesStore'
import { useTranslation } from '@/i18n/useTranslation'
import { formatMoney, round2 } from '@/utils/helpers'
import type { Client, SaleLine } from '@/types'
import { format } from 'date-fns'

interface CartItem extends SaleLine {
  stock: number
}

export const POSPage = () => {
  const { t } = useTranslation()
  const products = useProductStore((s) => s.products)
  const reduceStock = useProductStore((s) => s.reduceStock)
  const { clients, addClient } = useClientStore()
  const addSale = useSalesStore((s) => s.addSale)

  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [client, setClient] = useState<Client | null>(null)
  const [clientQuery, setClientQuery] = useState('')
  const [walkIn, setWalkIn] = useState(true)
  const [showNewClient, setShowNewClient] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', phone: '' })
  const [discountOn, setDiscountOn] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [received, setReceived] = useState(0)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q))
  }, [products, search])

  const clientSuggestions = useMemo(() => {
    const q = clientQuery.trim().toLowerCase()
    if (!q || client) return []
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 5)
  }, [clientQuery, clients, client])

  const subtotal = useMemo(() => round2(cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0)), [cart])
  const total = round2(Math.max(0, subtotal - (discountOn ? discount : 0)))

  // keep "received" pre-filled with the current total (cashier can lower it for credit)
  useEffect(() => {
    setReceived(total)
  }, [total])
  const change = round2(Math.max(0, received - total))
  const rest = round2(Math.max(0, total - received))

  const addToCart = (productId: string) => {
    const p = products.find((x) => x.id === productId)
    if (!p) return
    if (p.quantity <= 0) {
      toast.error(t('outOfStock'))
      return
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId)
      if (existing) {
        if (existing.quantity >= p.quantity) {
          toast.error(t('outOfStock'))
          return prev
        }
        return prev.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l))
      }
      return [...prev, { productId: p.id, productName: p.name, barcode: p.barcode, quantity: 1, unitPrice: p.salePrice, stock: p.quantity }]
    })
  }

  const changeQty = (productId: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.productId !== productId) return l
          const next = l.quantity + delta
          if (next > l.stock) {
            toast.error(t('outOfStock'))
            return l
          }
          return { ...l, quantity: next }
        })
        .filter((l) => l.quantity > 0),
    )

  const removeItem = (productId: string) => setCart((prev) => prev.filter((l) => l.productId !== productId))

  const resetSale = () => {
    setCart([])
    setClient(null)
    setClientQuery('')
    setWalkIn(true)
    setDiscountOn(false)
    setDiscount(0)
    setReceived(0)
  }

  const handleNewClient = async () => {
    if (!newClient.name.trim()) {
      toast.error(t('required'))
      return
    }
    const created = await addClient({ name: newClient.name, phone: newClient.phone })
    setClient(created)
    setWalkIn(false)
    setShowNewClient(false)
    setNewClient({ name: '', phone: '' })
  }

  const creditBlocked = rest > 0 && !client

  const validate = () => {
    if (cart.length === 0) {
      toast.error(t('emptyCart'))
      return
    }
    if (creditBlocked) {
      toast.error(t('selectClientForCredit'))
      return
    }
    const lines: SaleLine[] = cart.map(({ stock, ...l }) => l) // eslint-disable-line @typescript-eslint/no-unused-vars
    const paid = round2(Math.min(received, total))
    const nowIso = new Date().toISOString()
    addSale({
      clientId: client?.id ?? null,
      clientName: client?.name ?? t('walkInClient'),
      lines,
      subtotal,
      discount: discountOn ? discount : 0,
      total,
      paid,
      payments: paid > 0 ? [{ id: `p-${Date.now()}`, amount: paid, date: nowIso, note: 'Encaissement' }] : [],
      date: nowIso,
    })
    lines.forEach((l) => reduceStock(l.productId, l.quantity))
    toast.success(t('saleValidated'))
    resetSale()
  }

  return (
    <div>
      <PageHeader title={t('pos')} subtitle={format(new Date(), 'dd/MM/yyyy HH:mm')} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Products */}
        <div className="lg:col-span-3">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-wood-medium/50" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`${t('search')} (${t('productName')} / ${t('barcode')})`} className="input-wood ps-10" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.02 } }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => addToCart(p.id)}
                disabled={p.quantity <= 0}
                className="card-wood flex flex-col overflow-hidden rounded-2xl p-3 text-start disabled:opacity-50"
              >
                <div className="mb-2 flex h-20 items-center justify-center rounded-xl bg-wood-cream/60 text-wood-light">
                  <SprayCan size={32} />
                </div>
                <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-wood-dark">{p.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-mono font-bold text-sage">{formatMoney(p.salePrice)}</span>
                  <span className={`text-xs ${p.quantity <= p.minQuantity ? 'text-terracotta' : 'text-wood-medium'}`}>{p.quantity}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <div className="card-wood sticky top-4 flex max-h-[calc(100vh-8rem)] flex-col rounded-2xl">
            <div className="flex items-center justify-between rounded-t-2xl bg-wood-header px-4 py-3 text-white">
              <h3 className="flex items-center gap-2 text-display text-lg font-bold"><ShoppingBag size={20} />{t('cart')}</h3>
              {cart.length > 0 && <button onClick={resetSale} className="rounded-lg p-1 hover:bg-white/15"><Trash2 size={18} /></button>}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {/* Client */}
              <div className="mb-3 rounded-xl border border-wood-light/25 p-2.5">
                <div className="mb-2 flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" checked={walkIn} onChange={(e) => { setWalkIn(e.target.checked); if (e.target.checked) { setClient(null); setClientQuery('') } }} className="accent-wood-warm" />
                    {t('walkInClient')}
                  </label>
                </div>
                {!walkIn && (
                  client ? (
                    <div className="flex items-center justify-between rounded-lg bg-sage/10 px-3 py-2">
                      <div><p className="text-sm font-medium text-wood-dark">{client.name}</p><p className="text-xs text-wood-medium">{client.phone}</p></div>
                      <button onClick={() => setClient(null)} className="text-terracotta"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder={`${t('client')} (${t('name')} / ${t('phone')})`} className="input-wood py-1.5" />
                      {clientSuggestions.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-wood-light/30 bg-white shadow-wood-lg">
                          {clientSuggestions.map((c) => (
                            <button key={c.id} onClick={() => { setClient(c); setClientQuery(c.name) }} className="block w-full px-3 py-2 text-start text-sm hover:bg-wood-cream">{c.name} · {c.phone}</button>
                          ))}
                        </div>
                      )}
                      <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => setShowNewClient((v) => !v)}><UserPlus size={14} />{t('newClient')}</Button>
                      {showNewClient && (
                        <div className="mt-2 space-y-2">
                          <input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} placeholder={t('name')} className="input-wood py-1.5" />
                          <input value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} placeholder={t('phone')} className="input-wood py-1.5" />
                          <Button type="button" variant="sage" size="sm" className="w-full" onClick={handleNewClient}><Plus size={14} />{t('add')}</Button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Items */}
              {cart.length === 0 ? (
                <p className="py-8 text-center text-sm text-wood-medium">{t('emptyCart')}</p>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {cart.map((l) => (
                      <motion.div key={l.productId} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-xl bg-wood-cream/30 p-2.5">
                        <div className="flex items-center justify-between">
                          <p className="flex-1 truncate text-sm font-medium text-wood-dark">{l.productName}</p>
                          <button onClick={() => removeItem(l.productId)} className="text-terracotta"><X size={15} /></button>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button onClick={() => changeQty(l.productId, -1)} className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-wood-warm shadow-wood"><Minus size={13} /></button>
                            <span className="text-mono w-6 text-center text-sm font-bold">{l.quantity}</span>
                            <button onClick={() => changeQty(l.productId, 1)} className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-wood-warm shadow-wood"><Plus size={13} /></button>
                          </div>
                          <span className="text-mono text-sm font-bold text-sage">{formatMoney(l.quantity * l.unitPrice)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-wood-light/20 px-4 py-3">
              <div className="flex justify-between text-sm"><span className="text-wood-medium">{t('subtotal')}</span><span className="text-mono font-semibold">{formatMoney(subtotal)}</span></div>
              <label className="flex items-center gap-1.5 text-sm text-wood-medium">
                <input type="checkbox" checked={discountOn} onChange={(e) => setDiscountOn(e.target.checked)} className="accent-wood-warm" />
                {t('enableDiscount')}
              </label>
              {discountOn && (
                <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} placeholder={t('discount')} className="input-wood py-1.5" />
              )}
              <div className="flex items-center justify-between rounded-xl bg-wood-btn px-3 py-2 text-white">
                <span className="font-medium">{t('toPay')}</span>
                <span className="text-mono text-lg font-bold">{formatMoney(total)}</span>
              </div>
              <Input label={t('received')} type="number" step="0.01" value={received} onChange={(e) => setReceived(Number(e.target.value))} />
              <div className="flex justify-between text-sm">
                <span className="text-wood-medium">{received >= total ? t('change') : t('remaining')}</span>
                <span className={`text-mono font-bold ${received >= total ? 'text-sage' : 'text-terracotta'}`}>{formatMoney(received >= total ? change : rest)}</span>
              </div>
              <Button
                variant={creditBlocked ? 'outline' : 'primary'}
                size="lg"
                className="w-full"
                disabled={creditBlocked || cart.length === 0}
                title={creditBlocked ? t('selectClientForCredit') : undefined}
                onClick={validate}
              >
                <Check size={18} />
                {t('validateSale')}
              </Button>
              {creditBlocked && <p className="text-center text-xs text-terracotta">{t('selectClientForCredit')}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
