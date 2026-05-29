import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './lib/auth'
import Login from './pages/Login'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import VaultList from './pages/VaultList'
import VaultDetail from './pages/VaultDetail'
import Logs from './pages/Logs'
import Carte from './pages/Carte'
import Finances from './pages/Finances'

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="vaults" element={<VaultList />} />
          <Route path="vaults/:id" element={<VaultDetail />} />
          <Route path="logs" element={<Logs />} />
          <Route path="carte" element={<Carte />} />
          <Route path="finances" element={<Finances />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
