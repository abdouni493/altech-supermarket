import { type ReactNode, useEffect, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { cardVariants } from '@/utils/animations'
import { clsx } from '@/utils/clsx'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: number
  index?: number
  suffix?: string
  decimals?: boolean
  accent?: string
  hint?: ReactNode
}

const AnimatedNumber = ({ value, decimals }: { value: number; decimals?: boolean }) => {
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        setDisplay(
          decimals
            ? v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : Math.round(v).toLocaleString('fr-FR'),
        )
      },
    })
    return controls.stop
  }, [value, decimals, mv])

  return <span>{display}</span>
}

export const StatCard = ({
  icon,
  label,
  value,
  index = 0,
  suffix,
  decimals,
  accent = 'from-wood-warm to-sky-500',
  hint,
}: StatCardProps) => (
  <motion.div
    variants={cardVariants}
    initial="initial"
    animate="animate"
    custom={index}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
    className="card-wood relative overflow-hidden rounded-2xl p-5"
  >
    <div className={clsx('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10', accent)} />
    <div className="flex items-start justify-between">
      <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-wood', accent)}>
        {icon}
      </div>
    </div>
    <p className="mt-4 text-sm font-medium leading-snug text-wood-medium">{label}</p>
    <p className="text-mono mt-1 break-words text-xl font-bold leading-tight text-wood-dark">
      <AnimatedNumber value={value} decimals={decimals} />
      {suffix && <span className="ml-1 text-sm font-medium text-wood-medium">{suffix}</span>}
    </p>
    {hint && <div className="mt-1 text-xs text-wood-medium/70">{hint}</div>}
  </motion.div>
)
