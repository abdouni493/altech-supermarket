import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Client } from '@/types'
import { INITIAL_CLIENTS } from '@/data/initialData'
import api from '@/utils/api'
import { uid } from '@/utils/helpers'

interface ClientState {
  clients: Client[]
  loadFromServer?: () => Promise<void>
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      clients: INITIAL_CLIENTS,
      loadFromServer: async () => {
        try {
          const clients = await api.getClients()
          set(() => ({ clients }))
        } catch (e) {
          console.error('Failed to load clients:', e)
        }
      },
      addClient: async (data) => {
        const client: Client = { ...data, id: uid('c'), createdAt: new Date().toISOString() }
        try {
          await api.createClient(client)
          set((s) => ({ clients: [client, ...s.clients] }))
        } catch (e) {
          console.error('Failed to create client:', e)
          throw e
        }
        return client
      },
      updateClient: async (id, data) => {
        try {
          await api.updateProduct(id, data) // Note: backend uses generic /api/{entity}/:id endpoint
          set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)) }))
        } catch (e) {
          console.error('Failed to update client:', e)
          throw e
        }
      },
      deleteClient: async (id) => {
        try {
          await api.deleteProduct(id) // Note: backend uses generic /api/{entity}/:id endpoint
          set((s) => ({ clients: s.clients.filter((c) => c.id !== id) }))
        } catch (e) {
          console.error('Failed to delete client:', e)
          throw e
        }
      },
    }),
    { name: 'cosmetics-clients' },
  ),
)
