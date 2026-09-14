import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Search, PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { fadeUp } from '@/utils/animations'
import { clsx } from '@/utils/clsx'

export const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) => (
  <motion.div
    variants={fadeUp}
    initial="initial"
    animate="animate"
    className="mb-6 flex flex-wrap items-end justify-between gap-4"
  >
    <div className="min-w-0">
      <h1 className="text-display text-2xl font-bold text-wood-dark sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-wood-medium">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </motion.div>
)

export const SearchInput = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) => (
  <div className={clsx('relative', className)}>
    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-wood-medium/50" size={18} />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-wood ps-10"
    />
  </div>
)

export const EmptyState = ({
  title,
  hint,
  action,
  icon,
}: {
  title: string
  hint?: string
  action?: ReactNode
  icon?: ReactNode
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="card-wood flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-16 text-center"
  >
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wood-cream text-wood-light">
      {icon ?? <PackageOpen size={40} />}
    </div>
    <h3 className="text-display text-xl font-bold text-wood-dark">{title}</h3>
    {hint && <p className="max-w-sm text-sm text-wood-medium">{hint}</p>}
    {action && <div className="mt-2">{action}</div>}
  </motion.div>
)

export const ViewToggle = ({
  view,
  onChange,
  labels,
}: {
  view: 'cards' | 'table'
  onChange: (v: 'cards' | 'table') => void
  labels: { cards: string; table: string }
}) => (
  <div className="inline-flex rounded-xl border border-wood-light/40 bg-white/70 p-1">
    {(['cards', 'table'] as const).map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={clsx(
          'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
          view === v ? 'bg-wood-btn text-white shadow-wood' : 'text-wood-medium hover:bg-wood-cream',
        )}
      >
        {labels[v]}
      </button>
    ))}
  </div>
)

export const ProgressBar = ({ value, max, danger }: { value: number; max: number; danger?: boolean }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-wood-cream">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={clsx(
          'h-full rounded-full',
          danger ? 'bg-gradient-to-r from-terracotta to-red-600' : 'bg-gradient-to-r from-sage to-green-600',
        )}
      />
    </div>
  )
}

/**
 * Page control for long record lists. A year of trading is thousands of rows —
 * rendering them all costs seconds and tens of thousands of DOM nodes, so every
 * list backed by transaction history pages through this.
 */
export const Pagination = ({
  page,
  pageCount,
  total,
  onPage,
  labels,
}: {
  page: number
  pageCount: number
  total: number
  onPage: (p: number) => void
  labels: { results: string }
}) => {
  if (pageCount <= 1) return null

  // A compact window around the current page: 1 … 4 5 [6] 7 8 … 24
  const window: (number | '…')[] = []
  const push = (n: number | '…') => window.push(n)
  const from = Math.max(2, page - 1)
  const to = Math.min(pageCount - 1, page + 1)
  push(1)
  if (from > 2) push('…')
  for (let i = from; i <= to; i++) push(i)
  if (to < pageCount - 1) push('…')
  if (pageCount > 1) push(pageCount)

  const btn =
    'flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav
      className="mt-4 flex flex-wrap items-center justify-between gap-3"
      aria-label={labels.results}
    >
      <p className="text-xs text-wood-medium">
        {total} {labels.results}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Précédent"
          className={clsx(btn, 'text-wood-medium hover:bg-wood-cream')}
        >
          <ChevronLeft size={16} />
        </button>
        {window.map((n, i) =>
          n === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-wood-medium/60">
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onPage(n)}
              aria-current={n === page ? 'page' : undefined}
              className={clsx(
                btn,
                n === page
                  ? 'bg-wood-btn text-white shadow-wood'
                  : 'text-wood-medium hover:bg-wood-cream',
              )}
            >
              {n}
            </button>
          ),
        )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          aria-label="Suivant"
          className={clsx(btn, 'text-wood-medium hover:bg-wood-cream')}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  )
}
