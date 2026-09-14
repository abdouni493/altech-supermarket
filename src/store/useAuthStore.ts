import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppUser } from '@/types'
import { DEMO_ADMIN } from '@/data/initialData'
import { uid } from '@/utils/helpers'

interface AuthState {
  users: AppUser[]
  currentUser: AppUser | null
  loadFromServer?: () => Promise<void>
  login: (identifier: string, password: string) => AppUser | null
  loginDemo: () => AppUser
  createAdmin: (data: { fullName: string; username: string; email: string; password: string }) => AppUser
  logout: () => void
  updateAccount: (data: Partial<Pick<AppUser, 'fullName' | 'username' | 'email' | 'password'>>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [DEMO_ADMIN],
      currentUser: null,
      loadFromServer: async () => {
        try {
          // For now the server provides demo login endpoint which returns a user.
          // We don't fetch all users here; keep local users list empty unless server provides endpoint.
        } catch (e) {
          console.error('Failed to load auth data:', e)
        }
      },
      login: (identifier, password) => {
        const id = identifier.trim().toLowerCase()
        const user = get().users.find(
          (u) =>
            (u.email.toLowerCase() === id || u.username.toLowerCase() === id) &&
            u.password === password,
        )
        if (user) set({ currentUser: user })
        return user ?? null
      },
      loginDemo: () => {
        // Resolved locally so the demo works without a backend (static hosting).
        const existing = get().users.find((u) => u.isDemo)
        const user = existing ?? DEMO_ADMIN
        set((s) => ({
          currentUser: user,
          users: existing ? s.users : [...s.users, user],
        }))
        return user
      },
      createAdmin: ({ fullName, username, email, password }) => {
        const user: AppUser = {
          id: uid('user'),
          fullName,
          username,
          email,
          password,
          role: 'Administrateur',
          permissions: 'ALL',
        }
        set((s) => ({ users: [...s.users, user] }))
        return user
      },
      logout: () => set({ currentUser: null }),
      updateAccount: (data) =>
        set((s) => {
          if (!s.currentUser) return s
          const updated = { ...s.currentUser, ...data }
          return {
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          }
        }),
    }),
    { name: 'suppirette-auth-v2' },
  ),
)
