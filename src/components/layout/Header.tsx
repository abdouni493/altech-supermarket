import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Bell, ChevronRight, Globe, LogOut, AlertTriangle, CalendarClock, CalendarX, Menu } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'
import { useAuthStore } from '@/store/useAuthStore'
import { useProductStore } from '@/store/useProductStore'
import { NAV_ITEMS } from './navConfig'
import { initials, expiryInfo, type ExpiryInfo } from '@/utils/helpers'
import type { Product } from '@/types'

interface HeaderProps {
  /** Opens the off-canvas sidebar. Only rendered below `lg`. */
  onMenuClick?: () => void
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { t, toggleLang, lang } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)
  const products = useProductStore((s) => s.products)
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const lowStock = useMemo(() => products.filter((p) => p.quantity <= p.minQuantity), [products])

  const expiring = useMemo(() => {
    const rows: { product: Product; info: ExpiryInfo }[] = []
    for (const p of products) {
      if (!p.hasExpiration || !p.expirationDate) continue
      const info = expiryInfo(p.expirationDate)
      if (info && info.status !== 'ok') rows.push({ product: p, info })
    }
    return rows.sort((a, b) => a.info.days - b.info.days)
  }, [products])

  const alertCount = lowStock.length + expiring.length

  const current = NAV_ITEMS.find((i) => location.pathname.startsWith(i.path))
  const crumb = current ? t(current.labelKey) : ''

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-wood-light/20 bg-wood-white/80 px-3 py-3 backdrop-blur-md sm:gap-4 sm:px-6">
      {/* Menu + breadcrumb */}
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onMenuClick}
          aria-label={t('openMenu')}
          className="rounded-xl border border-wood-light/40 bg-white/70 p-2 text-wood-medium transition hover:bg-wood-cream lg:hidden"
        >
          <Menu size={20} />
        </motion.button>
        <Link to="/dashboard" className="hidden text-wood-medium/70 hover:text-wood-warm sm:inline">
          {t('appName')}
        </Link>
        {crumb && (
          <>
            <ChevronRight size={14} className="hidden text-wood-medium/40 rtl:rotate-180 sm:inline" />
            <span className="truncate font-semibold text-wood-dark">{crumb}</span>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Language */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLang}
          className="flex items-center gap-1.5 rounded-xl border border-wood-light/40 bg-white/70 px-2.5 py-2 text-xs font-semibold text-wood-medium transition hover:bg-wood-cream sm:px-3"
        >
          <Globe size={16} />
          {lang === 'fr' ? 'FR' : 'ع'}
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setNotifOpen((v) => !v)
              setMenuOpen(false)
            }}
            className="relative rounded-xl border border-wood-light/40 bg-white/70 p-2 text-wood-medium transition hover:bg-wood-cream"
          >
            <Bell size={18} />
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
                {alertCount}
              </span>
            )}
          </motion.button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="card-wood absolute end-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl p-3 shadow-wood-lg"
              >
                {alertCount === 0 ? (
                  <p className="px-1 py-3 text-center text-xs text-wood-medium">{t('noData')}</p>
                ) : (
                  <div className="max-h-80 space-y-3 overflow-y-auto">
                    {lowStock.length > 0 && (
                      <div>
                        <p className="mb-1 px-1 text-xs font-bold uppercase tracking-wide text-wood-medium">{t('stockAlerts')}</p>
                        <div className="space-y-1">
                          {lowStock.map((p) => (
                            <Link
                              key={p.id}
                              to="/stock"
                              onClick={() => setNotifOpen(false)}
                              className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-wood-cream"
                            >
                              <AlertTriangle size={16} className="shrink-0 text-terracotta" />
                              <span className="flex-1 truncate text-xs font-medium text-wood-dark">{p.name}</span>
                              <span className="text-xs font-bold text-terracotta">{p.quantity}/{p.minQuantity}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {expiring.length > 0 && (
                      <div>
                        <p className="mb-1 px-1 text-xs font-bold uppercase tracking-wide text-wood-medium">{t('expirationAlerts')}</p>
                        <div className="space-y-1">
                          {expiring.map(({ product, info }) => {
                            const isExpired = info.status === 'expired'
                            return (
                              <Link
                                key={product.id}
                                to="/stock"
                                onClick={() => setNotifOpen(false)}
                                className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-wood-cream"
                              >
                                {isExpired ? (
                                  <CalendarX size={16} className="shrink-0 text-terracotta" />
                                ) : (
                                  <CalendarClock size={16} className="shrink-0 text-[#B45309]" />
                                )}
                                <span className="flex-1 truncate text-xs font-medium text-wood-dark">{product.name}</span>
                                <span className={`text-xs font-bold ${isExpired ? 'text-terracotta' : 'text-[#B45309]'}`}>
                                  {info.days === 0
                                    ? t('expiresToday')
                                    : isExpired
                                      ? t('expiredSinceDays').replace('{n}', String(Math.abs(info.days)))
                                      : t('expiresInDays').replace('{n}', String(info.days))}
                                </span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setMenuOpen((v) => !v)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2 rounded-xl border border-wood-light/40 bg-white/70 p-1.5 transition hover:bg-wood-cream sm:pe-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wood-btn text-xs font-bold text-white">
              {initials(currentUser?.fullName ?? 'U')}
            </div>
            <div className="hidden text-start sm:block">
              <p className="text-xs font-bold leading-none text-wood-dark">{currentUser?.fullName}</p>
              <p className="mt-0.5 text-[10px] text-wood-medium">{currentUser?.role}</p>
            </div>
          </motion.button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="card-wood absolute end-0 mt-2 w-48 rounded-2xl p-2 shadow-wood-lg"
              >
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-wood-dark transition hover:bg-wood-cream"
                >
                  {t('myAccount')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-terracotta transition hover:bg-terracotta/10"
                >
                  <LogOut size={15} />
                  {t('logout')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
