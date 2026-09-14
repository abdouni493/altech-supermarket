import type { Variants } from 'framer-motion'

// ============================================================================
// Motion tokens
// ----------------------------------------------------------------------------
// One rhythm for the whole app. This is an interface people work in all day, so
// the motion is deliberately restrained: short, transform/opacity only, and
// always in service of a cause-effect relationship rather than decoration.
//
//   · micro-interactions land in 150–300ms
//   · entrances ease out, exits run at ~65% of the entrance duration
//   · lists stagger 30–40ms per item, capped so long tables never crawl
//
// `prefers-reduced-motion` is honoured globally via <MotionConfig reducedMotion
// ="user"> in App.tsx, plus the CSS guard in index.css.
// ============================================================================

/** Standard "decelerate" curve — everything entering the screen uses this. */
export const EASE_ENTRANCE = [0.22, 1, 0.36, 1] as const
/** Accelerate curve for things leaving. */
export const EASE_EXIT = [0.4, 0, 1, 1] as const

export const DUR = {
  fast: 0.15,
  base: 0.22,
  slow: 0.3,
} as const

/** Per-item stagger, capped so a 200-row table doesn't animate for 8 seconds. */
const stagger = (i: number, step = 0.035, cap = 8) => Math.min(i ?? 0, cap) * step

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_ENTRANCE } },
  exit: { opacity: 0, y: -6, transition: { duration: DUR.fast, ease: EASE_EXIT } },
}

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.97, y: 12 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 30, stiffness: 380, mass: 0.7 },
  },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: DUR.fast, ease: EASE_EXIT } },
}

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DUR.base } },
  exit: { opacity: 0, transition: { duration: DUR.fast } },
}

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: stagger(i, 0.04), duration: DUR.slow, ease: EASE_ENTRANCE },
  }),
}

export const sidebarItemVariants: Variants = {
  rest: { x: 0 },
  hover: { x: 3, transition: { duration: DUR.fast, ease: EASE_ENTRANCE } },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04 } },
}

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_ENTRANCE } },
}

export const rowVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: stagger(i, 0.025, 12), duration: DUR.base, ease: EASE_ENTRANCE },
  }),
}

/** Shared press/hover feedback for cards and buttons (subtle, never layout-shifting). */
export const pressable = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.985 },
  transition: { duration: DUR.fast, ease: EASE_ENTRANCE },
} as const
