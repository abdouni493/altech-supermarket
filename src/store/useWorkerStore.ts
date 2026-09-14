import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Worker,
  WorkerAdvance,
  WorkerAbsence,
  WorkerPayment,
  Permissions,
} from '@/types'
import { INITIAL_WORKERS, INITIAL_ROLES } from '@/data/initialData'
import api from '@/utils/api'
import { uid } from '@/utils/helpers'

interface WorkerState {
  workers: Worker[]
  roles: string[]
  loadFromServer?: () => Promise<void>
  addWorker: (data: Omit<Worker, 'id' | 'createdAt' | 'advances' | 'absences' | 'payments'>) => Promise<Worker>
  updateWorker: (id: string, data: Partial<Worker>) => Promise<void>
  deleteWorker: (id: string) => Promise<void>
  setPermissions: (id: string, permissions: Permissions) => Promise<void>
  addRole: (name: string) => void
  addAdvance: (workerId: string, advance: Omit<WorkerAdvance, 'id' | 'deducted'>) => Promise<void>
  addAbsence: (workerId: string, absence: Omit<WorkerAbsence, 'id'>) => Promise<void>
  addPayment: (workerId: string, payment: Omit<WorkerPayment, 'id'>) => Promise<void>
}

export const useWorkerStore = create<WorkerState>()(
  persist(
    (set, get) => ({
      workers: INITIAL_WORKERS,
      roles: INITIAL_ROLES,
      loadFromServer: async () => {
        try {
          const [workers, roles] = await Promise.all([api.getWorkers(), Promise.resolve(INITIAL_ROLES)])
          set(() => ({ workers, roles }))
        } catch (e) {
          console.error('Failed to load workers:', e)
        }
      },
      addWorker: async (data) => {
        const worker: Worker = {
          ...data,
          id: uid('w'),
          advances: [],
          absences: [],
          payments: [],
          createdAt: new Date().toISOString(),
        }
        try {
          await api.getWorkers()
          set((s) => ({ workers: [worker, ...s.workers] }))
        } catch (e) {
          console.error('Failed to create worker:', e)
          throw e
        }
        return worker
      },
      updateWorker: async (id, data) => {
        try {
          await api.updateProduct(id, data)
          set((s) => ({ workers: s.workers.map((w) => (w.id === id ? { ...w, ...data } : w)) }))
        } catch (e) {
          console.error('Failed to update worker:', e)
          throw e
        }
      },
      deleteWorker: async (id) => {
        try {
          await api.deleteProduct(id)
          set((s) => ({ workers: s.workers.filter((w) => w.id !== id) }))
        } catch (e) {
          console.error('Failed to delete worker:', e)
          throw e
        }
      },
      setPermissions: async (id, permissions) => {
        try {
          await api.updateProduct(id, { permissions })
          set((s) => ({ workers: s.workers.map((w) => (w.id === id ? { ...w, permissions } : w)) }))
        } catch (e) {
          console.error('Failed to set permissions:', e)
          throw e
        }
      },
      addRole: (name) => set((s) => (s.roles.includes(name) ? s : { roles: [...s.roles, name] })),
      addAdvance: async (workerId, advance) => {
        try {
          set((s) => ({
            workers: s.workers.map((w) =>
              w.id === workerId
                ? { ...w, advances: [{ ...advance, id: uid('adv'), deducted: false }, ...w.advances] }
                : w,
            ),
          }))
          const worker = get().workers.find((w) => w.id === workerId)
          if (worker) await api.updateProduct(workerId, worker)
        } catch (e) {
          console.error('Failed to add advance:', e)
          throw e
        }
      },
      addAbsence: async (workerId, absence) => {
        try {
          set((s) => ({
            workers: s.workers.map((w) =>
              w.id === workerId
                ? { ...w, absences: [{ ...absence, id: uid('abs') }, ...w.absences] }
                : w,
            ),
          }))
          const worker = get().workers.find((w) => w.id === workerId)
          if (worker) await api.updateProduct(workerId, worker)
        } catch (e) {
          console.error('Failed to add absence:', e)
          throw e
        }
      },
      addPayment: async (workerId, payment) => {
        try {
          set((s) => ({
            workers: s.workers.map((w) => {
              if (w.id !== workerId) return w
              return {
                ...w,
                payments: [{ ...payment, id: uid('wp') }, ...w.payments],
                advances: w.advances.map((a) => ({ ...a, deducted: true })),
              }
            }),
          }))
          const worker = get().workers.find((w) => w.id === workerId)
          if (worker) await api.updateProduct(workerId, worker)
        } catch (e) {
          console.error('Failed to add payment:', e)
          throw e
        }
      },
    }),
    { name: 'cosmetics-workers' },
  ),
)
