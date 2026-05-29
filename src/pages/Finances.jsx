import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, Clock
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { formatMoney, formatDate, formatRelative } from '../lib/utils'
import MoneyGlobalModal from '../components/modals/MoneyGlobalModal'

const PERIODS = [
  { label: '7 jours', days: 7 },
  { label: '30 jours', days: 30 },
]

// Tooltip custom du graphique
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-panel border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="text-accent-gold font-mono font-medium">{formatMoney(payload[0].value)}</p>
    </div>
  )
}

export default function Finances() {
  const [balance, setBalance] = useState(0)
  const [logs, setLogs] = useState([])
  const [chartData, setChartData] = useState([])
  const [period, setPeriod] = useState(7)
  const [loading, setLoading] = useState(true)
  const [moneyModal, setMoneyModal] = useState(null) // 'deposit' | 'withdraw'

  async function fetchAll() {
    const [{ data: gm }, { data: ml }] = await Promise.all([
      supabase.from('group_money').select('balance').single(),
      supabase.from('money_logs_global').select('*').order('created_at', { ascending: false }).limit(100),
    ])
    setBalance(gm?.balance || 0)
    setLogs(ml || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  // Construire les données du graphique selon la période
  useEffect(() => {
    if (!logs.length) { setChartData([]); return }

    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - period)

    // Trouver le solde de départ (avant la période)
    const logsInPeriod = logs
      .filter(l => new Date(l.created_at) >= start)
      .reverse() // chronologique

    // Construire points jour par jour
    const points = []
    for (let d = 0; d <= period; d++) {
      const date = new Date(start)
      date.setDate(date.getDate() + d)
      const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })

      // Trouver le dernier log de ce jour ou avant
      const logsUpToDay = logs.filter(l => new Date(l.created_at) <= date)
      const lastLog = logsUpToDay[0] // logs sont en desc

      points.push({
        date: dateStr,
        balance: lastLog ? lastLog.balance_after : (logsUpToDay.length === 0 ? 0 : null),
      })
    }

    // Filtrer les nulls et ajouter le solde actuel en dernier point
    const filtered = points.filter(p => p.balance !== null)
    if (filtered.length === 0) {
      setChartData([{ date: 'Aujourd\'hui', balance }])
    } else {
      // S'assurer que le dernier point est le solde actuel
      filtered[filtered.length - 1].balance = balance
      setChartData(filtered)
    }
  }, [logs, period, balance])

  // Stats rapides
  const deposits = logs.filter(l => l.action === 'deposit').reduce((s, l) => s + l.amount, 0)
  const withdrawals = logs.filter(l => l.action === 'withdraw').reduce((s, l) => s + l.amount, 0)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-widest">FINANCES</h1>
          <p className="text-text-secondary text-sm mt-1">Trésorerie du groupe</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMoneyModal('deposit')}
            className="btn-secondary border-accent-green/30 text-accent-green hover:bg-accent-green/10"
          >
            <TrendingUp className="w-4 h-4" /> Dépôt
          </button>
          <button
            onClick={() => setMoneyModal('withdraw')}
            className="btn-secondary border-accent-red/30 text-accent-red hover:bg-accent-red/10"
          >
            <TrendingDown className="w-4 h-4" /> Retrait
          </button>
        </div>
      </motion.div>

      {/* Solde principal */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card glow-border-gold border-accent-gold/30 bg-gradient-to-br from-panel to-[#141206]"
      >
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Solde du groupe</p>
        <div className="font-display text-6xl text-accent-gold tracking-wider">
          {loading ? '—' : formatMoney(balance)}
        </div>
        <p className="text-text-muted text-xs mt-2">Trésorerie commune</p>
      </motion.div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card border-accent-green/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-accent-green/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
            </div>
            <span className="text-xs text-text-muted uppercase tracking-wider">Total dépôts</span>
          </div>
          <p className="font-display text-2xl text-accent-green">{formatMoney(deposits)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card border-accent-red/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-accent-red/10 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-accent-red" />
            </div>
            <span className="text-xs text-text-muted uppercase tracking-wider">Total retraits</span>
          </div>
          <p className="font-display text-2xl text-accent-red">{formatMoney(withdrawals)}</p>
        </motion.div>
      </div>

      {/* Graphique */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-text-primary uppercase tracking-widest">Évolution du solde</h2>
          <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
            {PERIODS.map(p => (
              <button
                key={p.days}
                onClick={() => setPeriod(p.days)}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  period === p.days
                    ? 'bg-accent-red text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-48 bg-muted/20 rounded-lg animate-pulse" />
        ) : chartData.length < 2 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-text-muted text-sm">Pas assez de données pour afficher le graphique</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#444', fontSize: 11 }}
                axisLine={{ stroke: '#1f1f1f' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#444', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#2a2a2a" />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#f5c542"
                strokeWidth={2}
                dot={{ fill: '#f5c542', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#f5c542', stroke: '#141414', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Historique */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card overflow-hidden p-0"
      >
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-medium text-text-primary uppercase tracking-widest">Historique des mouvements</h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-10 h-10 text-text-muted mx-auto mb-2" />
            <p className="text-text-secondary text-sm">Aucun mouvement enregistré</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  log.action === 'deposit' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
                }`}>
                  {log.action === 'deposit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    {log.reason || (log.action === 'deposit' ? 'Dépôt' : 'Retrait')}
                  </p>
                  <p className="text-xs text-text-muted">{formatRelative(log.created_at)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-mono font-medium ${
                    log.action === 'deposit' ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    {log.action === 'deposit' ? '+' : '-'}{formatMoney(log.amount)}
                  </p>
                  <p className="text-xs text-text-muted font-mono">→ {formatMoney(log.balance_after)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <MoneyGlobalModal
        open={!!moneyModal}
        mode={moneyModal}
        balance={balance}
        onClose={() => setMoneyModal(null)}
        onSaved={fetchAll}
      />
    </div>
  )
}
