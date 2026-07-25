import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MarketsPage from './pages/MarketingPage'
import TradePage from './pages/TradePage'
import WalletPage from './pages/WalletPage'
import OrdersPage from './pages/OrdersPage'
import KycPage from './pages/KycPage'
import AdminKycPage from './pages/AdminKycPage'

function GuestOnly({ children }) {
  const { isAuthed } = useAuth()
  return isAuthed ? <Navigate to="/markets" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

      <Route path="/markets" element={<RequireAuth><MarketsPage /></RequireAuth>} />
      <Route path="/trade/:symbol" element={<RequireAuth><TradePage /></RequireAuth>} />
      <Route path="/wallet" element={<RequireAuth><WalletPage /></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
      <Route path="/kyc" element={<RequireAuth><KycPage /></RequireAuth>} />

      <Route path="/admin/kyc" element={<RequireAdmin><AdminKycPage /></RequireAdmin>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}