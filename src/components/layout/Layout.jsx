import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Vault, ScrollText, LogOut, Shield,
  Menu, X, ChevronRight, Map, DollarSign
} from 'lucide-react'
import { clearSession } from '../../lib/auth'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/',         icon: LayoutDashboard, label: 'Tableau de bord', end: true },
  { to: '/vaults',   icon: Vault,           label: 'Coffres' },
  { to: '/finances', icon: DollarSign,      label: 'Finances' },
  { to: '/logs',     icon: ScrollText,      label: 'Historique' },
  { to: '/carte',    icon: Map,             label: 'Carte' },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  function logout() {
    clearSession()
    toast.success('Déconnecté')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-void">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-surface border-r border-border fixed inset-y-0 left-0 z-40">
        <div className="px-4 py-5 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-panel border border-border flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-accent-red" />
          </div>
          <span className="font-display text-xl tracking-widest text-text-primary">BMB</span>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5">
          <p className="text-[10px] text-text-muted uppercase tracking-widest px-2 mb-2">Navigation</p>
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-accent-red/10 text-accent-red border border-accent-red/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-accent-red hover:bg-accent-red/5 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent-red" />
          <span className="font-display text-2xl tracking-widest">BMB</span>
        </div>
        <button onClick={() => setMobileOpen(v => !v)} className="btn-ghost p-2">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-void/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: -200 }}
              animate={{ x: 0 }}
              exit={{ x: -200 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute inset-y-0 left-0 w-56 bg-surface border-r border-border pt-14"
              onClick={e => e.stopPropagation()}
            >
              <nav className="px-2 py-4 space-y-0.5">
                {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive
                          ? 'bg-accent-red/10 text-accent-red border border-accent-red/20'
                          : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="p-2 border-t border-border">
                <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-accent-red">
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 md:ml-56 min-h-screen">
        <div className="pt-14 md:pt-0 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
