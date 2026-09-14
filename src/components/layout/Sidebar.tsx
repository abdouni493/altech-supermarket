import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, ShoppingCart, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { NAV_ITEMS } from './navConfig'
import { useTranslation } from '@/i18n/useTranslation'
import { useAuthStore } from '@/store/useAuthStore'
import { moduleEnabled } from '@/utils/helpers'
import { clsx } from '@/utils/clsx'

type SidebarVariant = 'desktop' | 'mobile'

interface SidebarProps {
  /** `desktop` is the collapsible rail; `mobile` is the off-canvas drawer. */
  variant?: SidebarVariant
  collapsed?: boolean
  onToggle?: () => void
  /** Mobile only — whether the drawer is slid in. */
  open?: boolean
  /** Mobile only — dismisses the drawer. */
  onClose?: () => void
}

export const Sidebar = ({
  variant = 'desktop',
  collapsed = false,
  open = false,
  onToggle,
  onClose,
}: SidebarProps) => {
  const { t, isRTL } = useTranslation()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)

  const isMobile = variant === 'mobile'
  // The drawer is never collapsed — on a phone there is no room for an icon rail.
  const isCollapsed = isMobile ? false : collapsed

  const items = NAV_ITEMS.filter((item) => moduleEnabled(currentUser?.permissions, item.key))

  const handleLogout = () => {
    onClose?.()
    logout()
    navigate('/login')
  }

  const CollapseIcon = collapsed ? (isRTL ? ChevronLeft : ChevronRight) : isRTL ? ChevronRight : ChevronLeft

  // Off-canvas start edge flips with the writing direction.
  const hiddenX = isRTL ? 288 : -288

  return (
    <motion.aside
      initial={false}
      animate={isMobile ? { x: open ? 0 : hiddenX } : { width: isCollapsed ? 76 : 256 }}
      transition={{ type: 'spring', damping: 26, stiffness: 240 }}
      aria-hidden={isMobile && !open}
      className={clsx(
        'wood-grain flex h-screen flex-col bg-wood-sidebar shadow-wood-lg',
        isMobile ? 'fixed inset-y-0 start-0 z-50 w-72 max-w-[85vw]' : 'relative z-30',
        isMobile && !open && 'pointer-events-none',
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-shine text-white shadow-rose">
          <ShoppingCart size={24} />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="min-w-0 flex-1 overflow-hidden"
            >
              <h1 className="text-display text-xl font-bold leading-none text-white">{t('appName')}</h1>
              <p className="mt-0.5 truncate text-[10px] text-wood-blonde/80">{t('appTagline')}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {isMobile && (
          <button
            onClick={onClose}
            aria-label={t('closeMenu')}
            className="ms-auto rounded-lg p-2 text-white/90 transition hover:bg-white/15"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Collapse toggle — desktop only; the drawer closes instead of collapsing. */}
      {!isMobile && (
        <button
          onClick={onToggle}
          aria-label="toggle sidebar"
          className="absolute -end-3 top-16 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-wood-light/40 bg-wood-cream text-wood-dark shadow-wood transition hover:bg-white"
        >
          <CollapseIcon size={14} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            title={isCollapsed ? t(item.labelKey) : undefined}
            onClick={onClose}
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: isRTL ? -3 : 3 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className={clsx(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-white/15 shadow-wood-inset ring-1 ring-white/20 backdrop-blur-sm'
                    : 'hover:bg-white/10',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={`activeBar-${variant}`}
                    className="absolute inset-y-1.5 start-0 w-1 rounded-full bg-sky-400"
                  />
                )}
                <item.icon size={20} style={{ color: item.color }} className="shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className={clsx(
                        'truncate text-sm font-medium',
                        isActive ? 'text-white' : 'text-wood-cream/90',
                      )}
                    >
                      {t(item.labelKey)}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !isCollapsed && (
                  <motion.div layoutId={`activeDot-${variant}`} className="ms-auto h-2 w-2 rounded-full bg-sky-400" />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-3">
        <motion.button
          whileHover={{ x: isRTL ? -3 : 3 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleLogout}
          title={isCollapsed ? t('logout') : undefined}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-wood-cream/90 transition hover:bg-terracotta/30"
        >
          <LogOut size={20} className="shrink-0 text-terracotta" />
          {!isCollapsed && <span className="text-sm font-medium">{t('logout')}</span>}
        </motion.button>
      </div>
    </motion.aside>
  )
}
