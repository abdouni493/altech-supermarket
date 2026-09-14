import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Supplier } from '@/types'
import { INITIAL_SUPPLIERS } from '@/data/initialData'
import api from '@/utils/api'
import { uid } from '@/utils/helpers'

interface SupplierState {
  suppliers: Supplier[]
  loadFromServer?: () => Promise<void>
  addSupplier: (data: Omit<Supplier, 'id' | 'createdAt'>) => Promise<Supplier>
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
}

export const useSupplierStore = create<SupplierState>()(
  persist(
    (set) => ({
      suppliers: INITIAL_SUPPLIERS,
      loadFromServer: async () => {
        try {
          const suppliers = await api.getSuppliers()
          set(() => ({ suppliers }))
        } catch (e) {
          console.error('Failed to load suppliers:', e)
        }
      },
      addSupplier: async (data) => {
        const supplier: Supplier = { ...data, id: uid('s'), createdAt: new Date().toISOString() }
        try {
          await api.createSupplier(supplier)
          set((s) => ({ suppliers: [supplier, ...s.suppliers] }))
        } catch (e) {
          console.error('Failed to create supplier:', e)
          throw e
        }
        return supplier
      },
      updateSupplier: async (id, data) => {
        try {
          await api.updateProduct(id, data)
          set((s) => ({ suppliers: s.suppliers.map((c) => (c.id === id ? { ...c, ...data } : c)) }))
        } catch (e) {
          console.error('Failed to update supplier:', e)
          throw e
        }
      },
      deleteSupplier: async (id) => {
        try {
          await api.deleteProduct(id)
          set((s) => ({ suppliers: s.suppliers.filter((c) => c.id !== id) }))
        } catch (e) {
          console.error('Failed to delete supplier:', e)
          throw e
        }
      },
    }),
    { name: 'cosmetics-suppliers' },
  ),
)
