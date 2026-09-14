import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StoreSettings } from '@/types'
import { INITIAL_SETTINGS } from '@/data/initialData'
import api from '@/utils/api'

interface SettingsState {
  settings: StoreSettings
  loadFromServer?: () => Promise<void>
  updateSettings: (data: Partial<StoreSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: INITIAL_SETTINGS,
      loadFromServer: async () => {
        try {
          const settings = await api.getSettings()
          if (settings) set((s) => ({ settings: { ...s.settings, ...settings } }))
        } catch (e) {
          console.error('Failed to load settings:', e)
        }
      },
      updateSettings: async (data) => {
        try {
          // Local update; persisted via zustand. Server has POST /api/settings for upsert.
          set((s) => ({ settings: { ...s.settings, ...data } }))
        } catch (e) {
          console.error('Failed to update settings:', e)
          throw e
        }
      },
    }),
    {
      name: 'cosmetics-settings',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsState>
        return { ...current, ...p, settings: { ...INITIAL_SETTINGS, ...(p.settings ?? {}) } }
      },
    },
  ),
)
