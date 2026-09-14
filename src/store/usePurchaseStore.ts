import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Purchase, Payment } from '@/types'
import { INITIAL_PURCHASES } from '@/data/initialData'
import api from '@/utils/api'
import { uid, round2 } from '@/utils/helpers'

interface PurchaseState {
  purchases: Purchase[]
  loadFromServer?: () => Promise<void>
  addPurchase: (data: Omit<Purchase, 'id' | 'reference' | 'createdAt'>) => Promise<Purchase>
  updatePurchase: (id: string, data: Partial<Purchase>) => Promise<void>
  deletePurchase: (id: string) => Promise<void>
  addPayment: (purchaseId: string, amount: number, date: string, note?: string) => Promise<void>
}

const nextRef = (purchases: Purchase[]): string => {
  const year = new Date().getFullYear()
  const n = purchases.length + 1
  return `ACH-${year}-${String(n).padStart(3, '0')}`
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      purchases: INITIAL_PURCHASES,
      loadFromServer: async () => {
        try {
          const purchases = await api.getPurchases()
          set(() => ({ purchases }))
        } catch (e) {
          console.error('Failed to load purchases:', e)
        }
      },
      addPurchase: async (data) => {
        const purchase: Purchase = {
          ...data,
          id: uid('pu'),
          reference: nextRef(get().purchases),
          createdAt: new Date().toISOString(),
        }
        try {
          await api.getPurchases() // use generic endpoint approach
          set((s) => ({ purchases: [purchase, ...s.purchases] }))
        } catch (e) {
          console.error('Failed to create purchase:', e)
          throw e
        }
        return purchase
      },
      updatePurchase: async (id, data) => {
        try {
          await api.updateProduct(id, data)
          set((s) => ({
            purchases: s.purchases.map((p) => (p.id === id ? { ...p, ...data } : p)),
          }))
        } catch (e) {
          console.error('Failed to update purchase:', e)
          throw e
        }
      },
      deletePurchase: async (id) => {
        try {
          await api.deleteProduct(id)
          set((s) => ({ purchases: s.purchases.filter((p) => p.id !== id) }))
        } catch (e) {
          console.error('Failed to delete purchase:', e)
          throw e
        }
      },
      addPayment: async (purchaseId, amount, date, note) => {
        try {
          set((s) => ({
            purchases: s.purchases.map((p) => {
              if (p.id !== purchaseId) return p
              const payment: Payment = { id: uid('pay'), amount, date, note }
              return { ...p, paid: round2(p.paid + amount), payments: [...p.payments, payment] }
            }),
          }))
          const purchase = get().purchases.find((p) => p.id === purchaseId)
          if (purchase) await api.updateProduct(purchaseId, purchase)
        } catch (e) {
          console.error('Failed to add payment:', e)
          throw e
        }
      },
    }),
    { name: 'cosmetics-purchases' },
  ),
)
