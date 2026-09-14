import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { useAuthStore } from '@/store/useAuthStore'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { StockPage } from '@/pages/Stock/StockPage'
import { PurchasePage } from '@/pages/Purchase/PurchasePage'
import { POSPage } from '@/pages/POS/POSPage'
import { SalesPage } from '@/pages/Sales/SalesPage'
import { ClientsPage } from '@/pages/Clients/ClientsPage'
import { SuppliersPage } from '@/pages/Suppliers/SuppliersPage'
import { WorkersPage } from '@/pages/Workers/WorkersPage'
import { ExpensesPage } from '@/pages/Expenses/ExpensesPage'
import { CaissePage } from '@/pages/Caisse/CaissePage'
import { ReportsPage } from '@/pages/Reports/ReportsPage'
import { SettingsPage } from '@/pages/Settings/SettingsPage'
import { useProductStore } from '@/store/useProductStore'
import { useClientStore } from '@/store/useClientStore'
import { useSupplierStore } from '@/store/useSupplierStore'
import { usePurchaseStore } from '@/store/usePurchaseStore'
import { useSalesStore } from '@/store/useSalesStore'
import { useWorkerStore } from '@/store/useWorkerStore'
import { useExpenseStore } from '@/store/useExpenseStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useCaisseStore } from '@/store/useCaisseStore'

const RequireAuth = () => {
  const currentUser = useAuthStore((s) => s.currentUser)
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  // load initial data from local API when app mounts
  useEffect(() => {
    ;(async () => {
      try {
        await Promise.all([
          useProductStore.getState().loadFromServer?.(),
          useClientStore.getState().loadFromServer?.(),
          useSupplierStore.getState().loadFromServer?.(),
          usePurchaseStore.getState().loadFromServer?.(),
          useSalesStore.getState().loadFromServer?.(),
          useWorkerStore.getState().loadFromServer?.(),
          useExpenseStore.getState().loadFromServer?.(),
          useSettingsStore.getState().loadFromServer?.(),
          useCaisseStore.getState().loadFromServer?.(),
          useAuthStore.getState().loadFromServer?.(),
        ])
      } catch (e) {
        console.error('Failed loading initial data', e)
      }
    })()
  }, [])
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FDF6FE 100%)',
            color: '#2A1140',
            border: '1px solid rgba(192, 38, 211, 0.22)',
            boxShadow: '0 8px 30px rgba(59, 7, 100, 0.18)',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#3F9E84', secondary: '#fff' } },
          error: { iconTheme: { primary: '#E24A6A', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/purchase" element={<PurchasePage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/caisse" element={<CaissePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
