import { motion, type HTMLMotionProps } from 'framer-motion'
import { clsx } from '@/utils/clsx'

type Variant = 'primary' | 'gold' | 'ghost' | 'danger' | 'outline' | 'sage'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-wood-btn text-white shadow-wood hover:shadow-wood-lg',
  gold: 'bg-gold-shine text-white font-semibold shadow-gold hover:shadow-wood-lg',
  ghost: 'bg-transparent text-wood-medium hover:bg-wood-cream',
  danger: 'bg-terracotta text-white shadow-wood hover:bg-red-700',
  outline: 'bg-white text-wood-medium border border-wood-light/45 hover:bg-wood-cream hover:border-wood-light/70',
  sage: 'bg-sage text-white shadow-wood hover:bg-green-800',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
  icon: 'p-2',
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) => (
  <motion.button
    whileHover={disabled ? undefined : { scale: 1.015 }}
    whileTap={disabled ? undefined : { scale: 0.985 }}
    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
    disabled={disabled}
    className={clsx(
      'inline-flex cursor-pointer items-center justify-center rounded-xl font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-wood-warm/45 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      variants[variant],
      sizes[size],
      className,
    )}
    {...props}
  >
    {children}
  </motion.button>
)
