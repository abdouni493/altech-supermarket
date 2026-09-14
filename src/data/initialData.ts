// initialData.ts
// The application previously shipped demo content here. For a local deployment
// that uses a real local database we remove bundled demo data and export
// empty defaults. The stores and UI will load real data from the backend API.

export const INITIAL_CATEGORIES: string[] = []
export const INITIAL_BRANDS: string[] = []
export const INITIAL_PRODUCTS: any[] = []
export const INITIAL_SUPPLIERS: any[] = []
export const INITIAL_CLIENTS: any[] = []
export const INITIAL_PURCHASES: any[] = []
export const INITIAL_SALES: any[] = []
export const INITIAL_ROLES: string[] = []
export const INITIAL_WORKERS: any[] = []
export const INITIAL_EXPENSES: any[] = []
export const INITIAL_SETTINGS = {
  logo: '',
  name: '',
  description: '',
  email: '',
  phone: '',
  address: '',
  nif: '',
  nis: '',
  article: '',
  rc: '',
  currency: 'DA',
}

export const DEMO_ADMIN = undefined

export const __statusOf = () => ({})
