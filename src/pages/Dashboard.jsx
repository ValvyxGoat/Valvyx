import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DollarSign, Package, Vault, ArrowRight, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatMoney, formatRelative } from '../lib/utils'

function StatCard({ label, value, icon: Icon, color, sub, delay = 0 }) {
  const colorMap = {
    gold:   { bg: 'bg-accent-gold/10',   text: 'text-accent-gold',   border: 'border-accent-gold/20',   glow: 'glow-border-gold' },
    green:  { bg: 'bg-accent-green/10',  text: 'text-accent-green',  border: 'border-accent-green/20',  glow: 'glow-border-green' },
    red:    { bg: 'bg-accent-red/10',    text: 'text-accent-red',    border: 'border-accent-red/20',    glow: 'glow-border-red' },
    orange: { bg: 'bg-accent-orange/10', text: 'text-accent-orange', border: 'border-accent-orange/20', glow: '' },
  }
  const c = colorMap[color] || colorMap.red

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`stat-card border ${c.border} ${c.glow}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
        <span className="text-[10px] text-text-muted uppercase tracking-widest">{label}</span>
      </div>
      <div className={`font-display text-3xl tracking-wider ${c.text} mb-0.5`}>{value}</div>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </motion.div>
  )
}

function LogBadge({ action }) {
  const map = {
    add:      <span className="badge bg-accent-green/10 text-accent-green">＋ Ajout</span>,
    remove:   <span className="badge bg-accent-red/10 text-accent-red">— Retrait</span>,
    deposit:  <span className="badge bg-accent-gold/10 text-accent-gold">💰 Dépôt</span>,
    withdraw: <span className="badge bg-accent-orange/10 text-accent-orange">💸 Retrait $</span>,
    create:   <span className="badge bg-blue-400/10 text-blue-400">✦ Création</span>,
  }
  return map[action] || <span className="badge bg-muted text-text-secondary">{action}</span>
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalMoney: 0, totalItems: 0, vaultCount: 0 })
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { data: gm },
        { data: vaults },
        { data: items },
        { data: iLogs },
        { data: mLogs },
      ] = await Promise.all([
        supabase.from('group_money').select('balance').single(),
        supabase.from('vaults').select('id'),
        supabase.from('items').select('quantity'),
        supabase.from('item_logs').select('*, vaults(name)').order('created_at', { ascending: false }).limit(6),
        supabase.from('money_logs_global').select('*').order('created_at', { ascending: false }).limit(4),
      ])

      const totalMoney = gm?.balance || 0
      const totalItems = (items || []).reduce((s, i) => s + (i.quantity || 0), 0)

      const combined = [
        ...(iLogs || []).map(l => ({ ...l, logType: 'item' })),
        ...(mLogs || []).map(l => ({
          ...l, logType: 'money',
          item_name: l.action === 'deposit' ? 'Dépôt trésorerie' : 'Retrait trésorerie',
          quantity: l.amount,
        })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8)

      setStats({ totalMoney, totalItems, vaultCount: (vaults || []).length })
      setRecentLogs(combined)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-4xl tracking-widest text-text-primary">TABLEAU DE BORD</h1>
        <p className="text-text-secondary text-sm mt-1">Vue globale des opérations</p>
      </motion.div>

      {/* Trésorerie hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card glow-border-gold border-accent-gold/30 bg-gradient-to-br from-panel to-[#141206]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Trésorerie du groupe</p>
            <div className="font-display text-6xl text-accent-gold tracking-wider">
              {loading ? '—' : formatMoney(stats.totalMoney)}
            </div>
          </div>
          <Link to="/finances" className="btn-secondary border-accent-gold/30 text-accent-gold hover:bg-accent-gold/10">
            Gérer <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          label="Objets Stockés"
          value={loading ? '—' : stats.totalItems.toLocaleString()}
          icon={Package}
          color="green"
          sub="Quantité totale"
          delay={0.1}
        />
        <StatCard
          label="Coffres"
          value={loading ? '—' : stats.vaultCount}
          icon={Vault}
          color="red"
          sub="Actifs"
          delay={0.15}
        />
        <StatCard
          label="Activité récente"
          value={loading ? '—' : recentLogs.length}
          icon={Clock}
          color="orange"
          sub="Dernières actions"
          delay={0.2}
        />
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-text-primary uppercase tracking-widest">Dernières actions</h2>
          <Link to="/logs" className="text-xs text-accent-red hover:text-red-400 flex items-center gap-1 transition-colors">
            Tout voir <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentLogs.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">Aucune action enregistrée</p>
        ) : (
          <div className="space-y-1">
            {recentLogs.map((log, i) => (
              <motion.div
                key={log.id + log.logType}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
              >
                <LogBadge action={log.action} />
                <span className="text-sm text-text-primary flex-1 truncate">{log.item_name}</span>
                <span className="text-xs text-text-secondary font-mono">
                  {log.logType === 'money' ? formatMoney(log.quantity) : `×${log.quantity}`}
                </span>
                <span className="text-xs text-text-muted hidden sm:block">{formatRelative(log.created_at)}</span>
                {log.vaults && (
                  <span className="text-[10px] text-text-muted bg-muted px-1.5 py-0.5 rounded hidden md:block">
                    {log.vaults.name}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
