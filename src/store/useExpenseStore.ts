import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Expense } from '@/types'
import { INITIAL_EXPENSES } from '@/data/initialData'
import api from '@/utils/api'
import { uid } from '@/utils/helpers'

interface ExpenseState {
  expenses: Expense[]
  loadFromServer?: () => Promise<void>
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense>
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      expenses: INITIAL_EXPENSES,
      loadFromServer: async () => {
        try {
          const expenses = await api.getExpenses()
          set(() => ({ expenses }))
        } catch (e) {
          console.error('Failed to load expenses:', e)
        }
      },
      addExpense: async (data) => {
        const expense: Expense = { ...data, id: uid('e'), createdAt: new Date().toISOString() }
        try {
          await api.getExpenses()
          set((s) => ({ expenses: [expense, ...s.expenses] }))
        } catch (e) {
          console.error('Failed to create expense:', e)
          throw e
        }
        return expense
      },
      updateExpense: async (id, data) => {
        try {
          await api.updateProduct(id, data)
          set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)) }))
        } catch (e) {
          console.error('Failed to update expense:', e)
          throw e
        }
      },
      deleteExpense: async (id) => {
        try {
          await api.deleteProduct(id)
          set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
        } catch (e) {
          console.error('Failed to delete expense:', e)
          throw e
        }
      },
    }),
    { name: 'suppirette-expenses-v2' },
  ),
)
