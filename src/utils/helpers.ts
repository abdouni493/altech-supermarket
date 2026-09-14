import type { Permissions, ActionKey, ModuleKey } from '@/types'

/** Generate a reasonably-unique id. */
export const uid = (prefix = 'id'): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

/** Format a number as currency (DA by default). */
export const formatMoney = (value: number, currency = 'DA'): string => {
  const v = Number.isFinite(value) ? value : 0
  return `${v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

export const formatNumber = (value: number): string =>
  (Number.isFinite(value) ? value : 0).toLocaleString('fr-FR')

/** Round to 2 decimals to avoid float drift. */
export const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

/** Generate a valid EAN-13 barcode string (12 digits + check digit). */
export const generateEAN13 = (): string => {
  let base = ''
  for (let i = 0; i < 12; i++) base += Math.floor(Math.random() * 10).toString()
  const digits = base.split('').map(Number)
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0)
  const check = (10 - (sum % 10)) % 10
  return base + check.toString()
}

export const paymentStatus = (total: number, paid: number): 'paid' | 'partial' | 'unpaid' => {
  if (paid >= total - 0.001) return 'paid'
  if (paid <= 0.001) return 'unpaid'
  return 'partial'
}

// ----------------------------------------------------------------------------
// Expiration dates
// ----------------------------------------------------------------------------

export type ExpiryStatus = 'expired' | 'soon' | 'ok'

export interface ExpiryInfo {
  /** 'expired' (past), 'soon' (within `soonDays`), or 'ok'. */
  status: ExpiryStatus
  /** Whole days until expiry — negative when already expired, 0 when today. */
  days: number
}

/** Number of days before expiry under which a product is flagged "expiring soon". */
export const EXPIRY_SOON_DAYS = 30

const MS_PER_DAY = 86_400_000

/** Classify a product's expiration date relative to today. Returns null if no/invalid date. */
export const expiryInfo = (dateStr?: string, soonDays = EXPIRY_SOON_DAYS): ExpiryInfo | null => {
  if (!dateStr) return null
  const exp = new Date(dateStr)
  if (Number.isNaN(exp.getTime())) return null
  const now = new Date()
  const expUTC = Date.UTC(exp.getFullYear(), exp.getMonth(), exp.getDate())
  const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((expUTC - nowUTC) / MS_PER_DAY)
  const status: ExpiryStatus = days < 0 ? 'expired' : days <= soonDays ? 'soon' : 'ok'
  return { status, days }
}

/** Build a default (empty) permission set with every module disabled. */
export const emptyPermissions = (): Permissions => ({})

const ALL_ACTIONS: ActionKey[] = ['view', 'create', 'edit', 'delete', 'print', 'pay']

export const fullPermissions = (): Permissions => {
  const mods: ModuleKey[] = [
    'dashboard',
    'stock',
    'purchase',
    'pos',
    'sales',
    'clients',
    'suppliers',
    'workers',
    'expenses',
    'caisse',
    'reports',
    'settings',
  ]
  const out: Permissions = {}
  mods.forEach((m) => {
    out[m] = { enabled: true, actions: [...ALL_ACTIONS] }
  })
  return out
}

export const can = (
  permissions: Permissions | 'ALL' | undefined,
  module: ModuleKey,
  action: ActionKey,
): boolean => {
  if (permissions === 'ALL') return true
  if (!permissions) return false
  const mod = permissions[module]
  if (!mod || !mod.enabled) return false
  return mod.actions.includes(action)
}

export const moduleEnabled = (
  permissions: Permissions | 'ALL' | undefined,
  module: ModuleKey,
): boolean => {
  if (permissions === 'ALL') return true
  if (!permissions) return false
  return !!permissions[module]?.enabled
}

/** Get initials from a name for avatars. */
export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

export const monthKey = (d: Date | string): string => {
  const date = typeof d === 'string' ? new Date(d) : d
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
