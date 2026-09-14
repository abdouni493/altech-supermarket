import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sale, Payment } from '@/types'
import { INITIAL_SALES } from '@/data/initialData'
import api from '@/utils/api'
import { uid, round2 } from '@/utils/helpers'

interface SalesState {
  sales: Sale[]
  loadFromServer?: () => Promise<void>
  addSale: (data: Omit<Sale, 'id' | 'reference' | 'createdAt'>) => Promise<Sale>
  updateSale: (id: string, data: Partial<Sale>) => Promise<void>
  deleteSale: (id: string) => Promise<void>
  addPayment: (saleId: string, amount: number, date: string, note?: string) => Promise<void>
}

const nextRef = (sales: Sale[]): string => {
  const year = new Date().getFullYear()
  const n = sales.length + 1
  return `VTE-${year}-${String(n).padStart(3, '0')}`
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      sales: INITIAL_SALES,
      loadFromServer: async () => {
        try {
          const sales = await api.getSales()
          set(() => ({ sales }))
        } catch (e) {
          console.error('Failed to load sales:', e)
        }
      },
      addSale: async (data) => {
        const sale: Sale = {
          ...data,
          id: uid('sa'),
          reference: nextRef(get().sales),
          createdAt: new Date().toISOString(),
        }
        try {
          await api.getSales()
          set((s) => ({ sales: [sale, ...s.sales] }))
        } catch (e) {
          console.error('Failed to create sale:', e)
          throw e
        }
        return sale
      },
      updateSale: async (id, data) => {
        try {
          await api.updateProduct(id, data)
          set((s) => ({ sales: s.sales.map((p) => (p.id === id ? { ...p, ...data } : p)) }))
        } catch (e) {
          console.error('Failed to update sale:', e)
          throw e
        }
      },
      deleteSale: async (id) => {
        try {
          await api.deleteProduct(id)
          set((s) => ({ sales: s.sales.filter((p) => p.id !== id) }))
        } catch (e) {
          console.error('Failed to delete sale:', e)
          throw e
        }
      },
      addPayment: async (saleId, amount, date, note) => {
        try {
          set((s) => ({
            sales: s.sales.map((sale) => {
              if (sale.id !== saleId) return sale
              const payment: Payment = { id: uid('pay'), amount, date, note }
              return { ...sale, paid: round2(sale.paid + amount), payments: [...sale.payments, payment] }
            }),
          }))
          const sale = get().sales.find((s) => s.id === saleId)
          if (sale) await api.updateProduct(saleId, sale)
        } catch (e) {
          console.error('Failed to add payment:', e)
          throw e
        }
      },
    }),
    { name: 'cosmetics-sales' },
  ),
)
