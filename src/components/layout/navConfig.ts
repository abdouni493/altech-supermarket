import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  Receipt,
  Users,
  Truck,
  UserCog,
  CreditCard,
  Coins,
  TrendingUp,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import type { ModuleKey } from '@/types'
import type { TranslationKey } from '@/i18n/translations'

export interface NavItem {
  key: ModuleKey
  path: string
  labelKey: TranslationKey
  icon: LucideIcon
  color: string
}

// Icons & accent colours tuned for a supermarket / grocery store.
export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', path: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, color: '#7DD3FC' },
  { key: 'stock', path: '/stock', labelKey: 'stock', icon: Package, color: '#6EE7B7' },
  { key: 'purchase', path: '/purchase', labelKey: 'purchase', icon: ClipboardList, color: '#FCD34D' },
  { key: 'pos', path: '/pos', labelKey: 'pos', icon: ShoppingCart, color: '#93C5FD' },
  { key: 'sales', path: '/sales', labelKey: 'sales', icon: Receipt, color: '#86EFAC' },
  { key: 'clients', path: '/clients', labelKey: 'clients', icon: Users, color: '#A5B4FC' },
  { key: 'suppliers', path: '/suppliers', labelKey: 'suppliers', icon: Truck, color: '#FDA4AF' },
  { key: 'workers', path: '/workers', labelKey: 'workers', icon: UserCog, color: '#C4B5FD' },
  { key: 'expenses', path: '/expenses', labelKey: 'expenses', icon: CreditCard, color: '#FDBA74' },
  { key: 'caisse', path: '/caisse', labelKey: 'caisse', icon: Coins, color: '#FDE047' },
  { key: 'reports', path: '/reports', labelKey: 'reports', icon: TrendingUp, color: '#5EEAD4' },
  { key: 'settings', path: '/settings', labelKey: 'settings', icon: Settings, color: '#CBD5E1' },
]
