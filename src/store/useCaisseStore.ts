import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CaisseTransaction } from '@/types'
import { INITIAL_CAISSE } from '@/data/initialData'
import { uid } from '@/utils/helpers'
import api from '@/utils/api'

interface CaisseState {
  transactions: CaisseTransaction[]
  loadFromServer: () => Promise<void>
  addTransaction: (data: Omit<CaisseTransaction, 'id' | 'createdAt'>) => Promise<CaisseTransaction>
  updateTransaction: (id: string, data: Partial<CaisseTransaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

export const useCaisseStore = create<CaisseState>()(
  persist(
    (set) => ({
      transactions: INITIAL_CAISSE,
      loadFromServer: async () => {
        try {
          const data = await api.getCaisse()
          set({ transactions: data || [] })
        } catch (e) {
          console.error('Failed to load caisse:', e)
        }
      },
      addTransaction: async (data) => {
        const tx: CaisseTransaction = { ...data, id: uid('cx'), createdAt: new Date().toISOString() }
        try {
          await api.createEntity('caisse', tx)
          set((s) => ({ transactions: [tx, ...s.transactions] }))
        } catch (e) {
          console.error('Failed to add transaction:', e)
          throw e
        }
        return tx
      },
      updateTransaction: async (id, data) => {
        try {
          await api.updateEntity('caisse', id, data)
          set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...data } : t)) }))
        } catch (e) {
          console.error('Failed to update transaction:', e)
          throw e
        }
      },
      deleteTransaction: async (id) => {
        try {
          await api.deleteEntity('caisse', id)
          set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
        } catch (e) {
          console.error('Failed to delete transaction:', e)
          throw e
        }
      },
    }),
    { name: 'suppirette-caisse-v2' },
  ),
)
