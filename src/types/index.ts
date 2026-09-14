// ============================================================================
// Belle Cosmétiques — Core domain types
// ============================================================================

export type Lang = 'fr' | 'ar'

export type PaymentStatus = 'paid' | 'partial' | 'unpaid'

// ----------------------------------------------------------------------------
// Auth / Users
// ----------------------------------------------------------------------------

export interface AppUser {
  id: string
  fullName: string
  username: string
  email: string
  password: string
  role: string
  permissions: Permissions | 'ALL'
  isDemo?: boolean
}

/** A permission set: which modules are enabled and which actions inside them. */
export type ModuleKey =
  | 'dashboard'
  | 'stock'
  | 'purchase'
  | 'pos'
  | 'sales'
  | 'clients'
  | 'suppliers'
  | 'workers'
  | 'expenses'
  | 'caisse'
  | 'reports'
  | 'settings'

export type ActionKey = 'view' | 'create' | 'edit' | 'delete' | 'print' | 'pay'

export type Permissions = {
  [key in ModuleKey]?: {
    enabled: boolean
    actions: ActionKey[]
  }
}

// ----------------------------------------------------------------------------
// Products / Stock
// ----------------------------------------------------------------------------

export interface Product {
  id: string
  name: string
  description: string
  barcode: string
  brand: string
  category: string
  purchasePrice: number
  salePrice: number
  quantity: number // current quantity in stock
  minQuantity: number // alert threshold
  hasExpiration?: boolean // whether this product tracks an expiration date
  expirationDate?: string // ISO / YYYY-MM-DD date when the product expires
  createdAt: string
}

// ----------------------------------------------------------------------------
// Purchases
// ----------------------------------------------------------------------------

export interface PurchaseLine {
  productId: string
  productName: string
  barcode: string
  quantity: number
  purchasePrice: number
  salePrice: number
  minQuantity: number
  hasExpiration?: boolean
  expirationDate?: string
}

export interface Payment {
  id: string
  amount: number
  date: string
  note?: string
}

export interface Purchase {
  id: string
  reference: string
  supplierId: string | null
  supplierName: string
  lines: PurchaseLine[]
  total: number
  paid: number
  payments: Payment[]
  date: string
  createdAt: string
}

// ----------------------------------------------------------------------------
// Sales
// ----------------------------------------------------------------------------

export interface SaleLine {
  productId: string
  productName: string
  barcode: string
  quantity: number
  unitPrice: number
}

export interface Sale {
  id: string
  reference: string
  clientId: string | null
  clientName: string
  lines: SaleLine[]
  subtotal: number
  discount: number
  total: number
  paid: number
  payments: Payment[]
  date: string
  createdAt: string
}

// ----------------------------------------------------------------------------
// Clients
// ----------------------------------------------------------------------------

export interface Client {
  id: string
  name: string
  phone: string
  createdAt: string
}

// ----------------------------------------------------------------------------
// Suppliers
// ----------------------------------------------------------------------------

export interface Supplier {
  id: string
  name: string
  phone: string
  address: string
  createdAt: string
}

// ----------------------------------------------------------------------------
// Workers
// ----------------------------------------------------------------------------

export type SalaryType = 'monthly' | 'daily'

export interface WorkerAdvance {
  id: string
  date: string
  description: string
  amount: number
  deducted: boolean
}

export interface WorkerAbsence {
  id: string
  date: string
  description: string
  cost: number
}

export interface WorkerPayment {
  id: string
  period: string // e.g. "2026-06"
  baseSalary: number
  absencesDeducted: number
  advancesDeducted: number
  amount: number
  date: string
  note?: string
}

export interface Worker {
  id: string
  fullName: string
  birthDate: string
  idCard: string
  phone: string
  role: string
  hasSalary: boolean
  salaryType: SalaryType
  salaryAmount: number
  hasAccount: boolean
  email: string
  username: string
  password: string
  permissions: Permissions
  startDate: string
  active: boolean
  advances: WorkerAdvance[]
  absences: WorkerAbsence[]
  payments: WorkerPayment[]
  createdAt: string
}

// ----------------------------------------------------------------------------
// Expenses
// ----------------------------------------------------------------------------

export interface Expense {
  id: string
  name: string
  description: string
  amount: number
  date: string
  createdAt: string
}

// ----------------------------------------------------------------------------
// Caisse (Treasury / Cash register)
// ----------------------------------------------------------------------------

export type CaisseType = 'deposit' | 'withdrawal'

/** A manual cash movement registered directly in the Caisse. */
export interface CaisseTransaction {
  id: string
  type: CaisseType
  amount: number
  description: string
  date: string
  createdAt: string
}

// ----------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------

export interface StoreSettings {
  logo: string // base64 or empty
  name: string
  description: string
  email: string
  phone: string
  address: string
  nif: string
  nis: string
  article: string
  rc: string
  currency: string
}
