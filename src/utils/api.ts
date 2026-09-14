/**
 * Backend base URL. When VITE_API_URL is unset the app runs standalone on its
 * seeded local data (this is how the hosted demo works), so callers should check
 * `apiEnabled` before syncing rather than firing requests that can only fail.
 */
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export const apiEnabled = Boolean(import.meta.env.VITE_API_URL)

async function request(path: string, opts?: RequestInit) {
  // Standalone mode: resolve as a no-op so callers still apply their local state
  // update instead of treating an unreachable backend as a failed write.
  if (!apiEnabled) return null

  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

// Generic CRUD helpers
async function createEntity(table: string, data: any) {
  return request(`/${table}`, { method: 'POST', body: JSON.stringify(data) })
}
async function updateEntity(table: string, id: string, data: any) {
  return request(`/${table}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}
async function deleteEntity(table: string, id: string) {
  return request(`/${table}/${id}`, { method: 'DELETE' })
}

export const api = {
  request,
  createEntity,
  updateEntity,
  deleteEntity,
  // products
  getProducts: () => request('/products'),
  createProduct: (data: any) => createEntity('products', data),
  updateProduct: (id: string, data: any) => updateEntity('products', id, data),
  deleteProduct: (id: string) => deleteEntity('products', id),
  // clients
  getClients: () => request('/clients'),
  createClient: (data: any) => createEntity('clients', data),
  updateClient: (id: string, data: any) => updateEntity('clients', id, data),
  deleteClient: (id: string) => deleteEntity('clients', id),
  // suppliers
  getSuppliers: () => request('/suppliers'),
  createSupplier: (data: any) => createEntity('suppliers', data),
  updateSupplier: (id: string, data: any) => updateEntity('suppliers', id, data),
  deleteSupplier: (id: string) => deleteEntity('suppliers', id),
  // purchases, sales, workers, expenses
  getPurchases: () => request('/purchases'),
  createPurchase: (data: any) => createEntity('purchases', data),
  updatePurchase: (id: string, data: any) => updateEntity('purchases', id, data),
  deletePurchase: (id: string) => deleteEntity('purchases', id),
  getSales: () => request('/sales'),
  createSale: (data: any) => createEntity('sales', data),
  updateSale: (id: string, data: any) => updateEntity('sales', id, data),
  deleteSale: (id: string) => deleteEntity('sales', id),
  getWorkers: () => request('/workers'),
  createWorker: (data: any) => createEntity('workers', data),
  updateWorker: (id: string, data: any) => updateEntity('workers', id, data),
  deleteWorker: (id: string) => deleteEntity('workers', id),
  getExpenses: () => request('/expenses'),
  createExpense: (data: any) => createEntity('expenses', data),
  updateExpense: (id: string, data: any) => updateEntity('expenses', id, data),
  deleteExpense: (id: string) => deleteEntity('expenses', id),
  // caisse
  getCaisse: () => request('/caisse'),
  // settings
  getSettings: () => request('/settings'),
  updateSettings: (data: any) => request('/settings', { method: 'POST', body: JSON.stringify(data) }),
  // auth demo
  loginDemo: () => request('/auth/demo', { method: 'POST' }),
}

export default api

