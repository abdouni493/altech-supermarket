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
  { key: 'dashboard', path: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, color: '#67E8F9' },
  { key: 'stock', path: '/stock', labelKey: 'stock', icon: Package, color: '#4ADE80' },
  { key: 'purchase', path: '/purchase', labelKey: 'purchase', icon: ClipboardList, color: '#FB923C' },
  { key: 'pos', path: '/pos', labelKey: 'pos', icon: ShoppingCart, color: '#38BDF8' },
  { key: 'sales', path: '/sales', labelKey: 'sales', icon: Receipt, color: '#A3E635' },
  { key: 'clients', path: '/clients', labelKey: 'clients', icon: Users, color: '#818CF8' },
  { key: 'suppliers', path: '/suppliers', labelKey: 'suppliers', icon: Truck, color: '#F87171' },
  { key: 'workers', path: '/workers', labelKey: 'workers', icon: UserCog, color: '#C084FC' },
  { key: 'expenses', path: '/expenses', labelKey: 'expenses', icon: CreditCard, color: '#FB7185' },
  { key: 'caisse', path: '/caisse', labelKey: 'caisse', icon: Coins, color: '#FACC15' },
  { key: 'reports', path: '/reports', labelKey: 'reports', icon: TrendingUp, color: '#2DD4BF' },
  { key: 'settings', path: '/settings', labelKey: 'settings', icon: Settings, color: '#94A3B8' },
]
