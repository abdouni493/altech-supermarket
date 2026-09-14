import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'
import { INITIAL_PRODUCTS, INITIAL_BRANDS, INITIAL_CATEGORIES } from '@/data/initialData'
import api from '@/utils/api'
import { uid } from '@/utils/helpers'

interface ProductState {
  products: Product[]
  brands: string[]
  categories: string[]
  loadFromServer?: () => Promise<void>
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  /** Increase stock + refresh prices/min (and optional expiration) after a purchase line. */
  receiveStock: (
    productId: string,
    qty: number,
    patch: {
      purchasePrice: number
      salePrice: number
      minQuantity: number
      hasExpiration?: boolean
      expirationDate?: string
    },
  ) => Promise<void>
  /** Decrease stock after a sale. */
  reduceStock: (productId: string, qty: number) => Promise<void>
  addBrand: (name: string) => void
  addCategory: (name: string) => void
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,
      brands: INITIAL_BRANDS,
      categories: INITIAL_CATEGORIES,
      loadFromServer: async () => {
        try {
          const [products, categories, brands] = await Promise.all([
            api.getProducts(),
            Promise.resolve([]),
            Promise.resolve([]),
          ])
          set(() => ({ products, categories, brands }))
        } catch (e) {
          console.error('Failed to load products:', e)
        }
      },
      addProduct: async (data) => {
        const product: Product = { ...data, id: uid('p'), createdAt: new Date().toISOString() }
        try {
          await api.createProduct(product)
          set((s) => ({ products: [product, ...s.products] }))
        } catch (e) {
          console.error('Failed to create product:', e)
          throw e
        }
        return product
      },
      updateProduct: async (id, data) => {
        try {
          await api.updateProduct(id, data)
          set((s) => ({
            products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
          }))
        } catch (e) {
          console.error('Failed to update product:', e)
          throw e
        }
      },
      deleteProduct: async (id) => {
        try {
          await api.deleteProduct(id)
          set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
        } catch (e) {
          console.error('Failed to delete product:', e)
          throw e
        }
      },
      receiveStock: async (productId, qty, patch) => {
        try {
          const updated = { quantity: undefined as any }
          set((s) => {
            const product = s.products.find((p) => p.id === productId)
            if (!product) return s
            const newQty = product.quantity + qty
            updated.quantity = newQty
            return {
              products: s.products.map((p) =>
                p.id === productId
                  ? {
                      ...p,
                      quantity: newQty,
                      purchasePrice: patch.purchasePrice,
                      salePrice: patch.salePrice,
                      minQuantity: patch.minQuantity,
                      ...(patch.hasExpiration !== undefined ? { hasExpiration: patch.hasExpiration } : {}),
                      ...(patch.hasExpiration
                        ? { expirationDate: patch.expirationDate }
                        : patch.hasExpiration === false
                          ? { expirationDate: undefined }
                          : {}),
                    }
                  : p,
              ),
            }
          })
          const product = useProductStore.getState().products.find((p) => p.id === productId)
          if (product) await api.updateProduct(productId, product)
        } catch (e) {
          console.error('Failed to receive stock:', e)
          throw e
        }
      },
      reduceStock: async (productId, qty) => {
        try {
          const product = useProductStore.getState().products.find((p) => p.id === productId)
          const newQty = Math.max(0, (product?.quantity ?? 0) - qty)
          set((s) => ({
            products: s.products.map((p) =>
              p.id === productId ? { ...p, quantity: newQty } : p,
            ),
          }))
          if (product) await api.updateProduct(productId, { quantity: newQty })
        } catch (e) {
          console.error('Failed to reduce stock:', e)
          throw e
        }
      },
      addBrand: (name) =>
        set((s) => (s.brands.includes(name) ? s : { brands: [...s.brands, name] })),
      addCategory: (name) =>
        set((s) => (s.categories.includes(name) ? s : { categories: [...s.categories, name] })),
    }),
    { name: 'cosmetics-products' },
  ),
)
