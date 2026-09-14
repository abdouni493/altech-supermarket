import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '@/types'
import { translations, type TranslationKey } from './translations'

interface LangState {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const applyDir = (lang: Lang) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
  }
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'fr',
      setLang: (lang) => {
        applyDir(lang)
        set({ lang })
      },
      toggleLang: () => {
        const next: Lang = get().lang === 'fr' ? 'ar' : 'fr'
        applyDir(next)
        set({ lang: next })
      },
    }),
    {
      name: 'cosmetics-lang',
      onRehydrateStorage: () => (state) => {
        if (state) applyDir(state.lang)
      },
    },
  ),
)

export const useTranslation = () => {
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)
  const toggleLang = useLangStore((s) => s.toggleLang)
  const t = (key: TranslationKey): string => translations[lang][key] ?? translations.fr[key] ?? key
  const isRTL = lang === 'ar'
  return { t, lang, setLang, toggleLang, isRTL }
}
