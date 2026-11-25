import { useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Customers from './pages/Customers.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CreateInvoice from './pages/CreateInvoice.jsx'
import InvoiceHistory from './pages/InvoiceHistory.jsx'
import Expenses from './pages/Expenses.jsx'
import Login from './pages/Login.jsx'
import Products from './pages/Products.jsx'
import Settings from './pages/Settings.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <Login onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/invoices" element={<CreateInvoice />} />
          <Route path="/invoice-history" element={<InvoiceHistory />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
