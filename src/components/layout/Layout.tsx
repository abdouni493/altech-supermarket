import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { pageVariants } from '@/utils/animations'
import { clsx } from '@/utils/clsx'

/** Below this width the sidebar becomes an off-canvas drawer. Matches Tailwind `lg`. */
const MOBILE_QUERY = '(max-width: 1023px)'

export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  // On phones and tablets the sidebar is hidden by default and opened from the
  // header. Growing back to desktop width must never leave the drawer stuck open.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
      if (!e.matches) setDrawerOpen(false)
    }
    onChange(mq)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Opening any page from the drawer closes it — the user asked for a page, not a menu.
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  // The page behind the drawer must not scroll while it is open.
  useEffect(() => {
    if (!drawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [drawerOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-wood-bg">
      {/* Desktop rail — collapsible, always present from `lg` up. */}
      {!isMobile && (
        <Sidebar variant="desktop" collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      )}

      {/* Mobile drawer + scrim — kept mounted and slid in and out, so the
          navigation is never half-removed mid-animation. */}
      {isMobile && (
        <>
          <motion.div
            initial={false}
            animate={{ opacity: drawerOpen ? 1 : 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setDrawerOpen(false)}
            aria-hidden={!drawerOpen}
            className={clsx(
              'fixed inset-0 z-40 bg-wood-dark/55 backdrop-blur-sm',
              drawerOpen ? 'pointer-events-auto' : 'pointer-events-none',
            )}
          />
          <Sidebar variant="mobile" open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
