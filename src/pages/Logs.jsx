import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ScrollText, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, formatMoney } from '../lib/utils'

function ActionBadge({ action }) {
  const map = {
    add: { label: '＋ Ajout', cls: 'bg-accent-green/10 text-accent-green' },
    remove: { label: '— Retrait', cls: 'bg-accent-red/10 text-accent-red' },
    create: { label: '✦ Création', cls: 'bg-blue-400/10 text-blue-400' },
    delete: { label: '✕ Suppression', cls: 'bg-accent-red/10 text-accent-red' },
    deposit: { label: '↑ Dépôt $', cls: 'bg-accent-gold/10 text-accent-gold' },
    withdraw: { label: '↓ Retrait $', cls: 'bg-accent-orange/10 text-accent-orange' },
  }
  const a = map[action] || { label: action, cls: 'bg-muted text-text-secondary' }
  return <span className={`badge ${a.cls} text-[10px] whitespace-nowrap`}>{a.label}</span>
}

export default function Logs() {
  const [itemLogs, setItemLogs] = useState([])
  const [moneyLogs, setMoneyLogs] = useState([])
  const [vaults, setVaults] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterVault, setFilterVault] = useState('all')
  const [filterType, setFilterType] = useState('all') // 'all' | 'item' | 'money'
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    async function load() {
      const [
        { data: il },
        { data: ml },
        { data: vs },
      ] = await Promise.all([
        supabase.from('item_logs').select('*, vaults(id, name)').order('created_at', { ascending: false }).limit(200),
        supabase.from('money_logs').select('*, vaults(id, name)').order('created_at', { ascending: false }).limit(200),
        supabase.from('vaults').select('id, name').order('name'),
      ])
      setItemLogs((il || []).map(l => ({ ...l, logType: 'item' })))
      setMoneyLogs((ml || []).map(l => ({ ...l, logType: 'money', item_name: l.action === 'deposit' ? 'Dépôt' : 'Retrait argent', quantity: l.amount })))
      setVaults(vs || [])
      setLoading(false)
    }
    load()
  }, [])

  // Fusion + filtres
  const allLogs = [
    ...(filterType === 'money' ? [] : itemLogs),
    ...(filterType === 'item' ? [] : moneyLogs),
  ]
    .filter(l => {
      const matchSearch = (l.item_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.reason || '').toLowerCase().includes(search.toLowerCase())
      const matchVault = filterVault === 'all' || l.vaults?.id === filterVault
      return matchSearch && matchVault
    })
    .sort((a, b) => {
      const d = new Date(a.created_at) - new Date(b.created_at)
      return sortOrder === 'desc' ? -d : d
    })

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-4xl tracking-widest">HISTORIQUE</h1>
        <p className="text-text-secondary text-sm mt-1">{allLogs.length} entrée{allLogs.length > 1 ? 's' : ''}</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input pl-8"
            placeholder="Rechercher objet, raison..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select value={filterVault} onChange={e => setFilterVault(e.target.value)} className="input sm:w-44">
          <option value="all">Tous les coffres</option>
          {vaults.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>

        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input sm:w-40">
          <option value="all">Tous les types</option>
          <option value="item">Objets</option>
          <option value="money">Argent</option>
        </select>

        <button
          onClick={() => setSortOrder(v => v === 'desc' ? 'asc' : 'desc')}
          className="btn-secondary whitespace-nowrap"
        >
          <Calendar className="w-4 h-4" />
          {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
        </button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card overflow-hidden p-0"
      >
        {loading ? (
          <div className="p-6 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />
            ))}
          </div>
        ) : allLogs.length === 0 ? (
          <div className="text-center py-16">
            <ScrollText className="w-10 h-10 text-text-muted mx-auto mb-2" />
            <p className="text-text-secondary text-sm">Aucun log trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] text-text-muted uppercase tracking-widest">
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Objet / Transaction</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Quantité</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Coffre</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Raison</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {allLogs.map((log, i) => (
                  <motion.tr
                    key={log.id + log.logType}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3 text-text-primary font-medium">{log.item_name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-mono text-text-secondary">
                        {log.logType === 'money' ? formatMoney(log.quantity) : `×${log.quantity}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded text-text-secondary">
                        {log.vaults?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-text-secondary max-w-[200px] truncate">
                      {log.reason || <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
