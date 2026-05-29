import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { hashPassword, saveSession } from '../lib/auth'

export default function Login() {
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    if (!password) return

    setLoading(true)
    try {
      const hashed = await hashPassword(password)
      const expected = import.meta.env.VITE_APP_PASSWORD_HASH

      if (hashed === expected) {
        saveSession()
        toast.success('Accès autorisé')
        navigate('/')
      } else {
        toast.error('Mot de passe incorrect')
      }
    } catch {
      toast.error('Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(230,57,70,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(230,57,70,0.8) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-red/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-panel border border-border mb-4 relative">
            <Shield className="w-7 h-7 text-accent-red" />
            <div className="absolute inset-0 rounded-2xl shadow-glow-red opacity-50" />
          </div>
          <h1 className="font-display text-5xl text-text-primary tracking-widest">BMB</h1>
          <p className="text-text-secondary text-xs tracking-[0.3em] uppercase mt-1">Gestion des coffres</p>
        </div>

        {/* Card */}
        <div className="card border-border/60 glow-border-red">
          <div className="flex items-center gap-2 mb-6 text-text-muted text-xs tracking-widest uppercase">
            <div className="w-4 h-[1px] bg-accent-red" />
            <span>Authentification</span>
            <div className="flex-1 h-[1px] bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 tracking-wider uppercase">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-9 pr-9 font-mono tracking-widest"
                  placeholder="••••••••••••"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full btn-primary justify-center py-3 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Accéder au Vault
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          Accès réservé aux membres autorisés
        </p>
      </motion.div>
    </div>
  )
}
