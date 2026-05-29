import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Minus, Package, Vault, Search, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import AddItemModal from '../components/modals/AddItemModal'
import WithdrawItemModal from '../components/modals/WithdrawItemModal'
import ConfirmModal from '../components/modals/ConfirmModal'

const CATEGORY_COLORS = {
  'Armes':      'text-accent-red bg-accent-red/10',
  'Drogues':    'text-accent-orange bg-accent-orange/10',
  'Objets':     'text-accent-green bg-accent-green/10',
  'Munitions':  'text-accent-gold bg-accent-gold/10',
  'Équipement': 'text-blue-400 bg-blue-400/10',
}

export default function VaultDetail() {
  const { id } = useParams()
  const [vault, setVault] = useState(null)
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  // Modals
  const [addItem, setAddItem] = useState(false)       // false | true | item (pour ajouter à existant)
  const [withdrawItem, setWithdrawItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [editItem, setEditItem] = useState(null)

  const fetchAll = useCallback(async () => {
    const [{ data: v }, { data: its }, { data: cats }] = await Promise.all([
      supabase.from('vaults').select('*').eq('id', id).single(),
      supabase.from('items').select('*, categories(name, color)').eq('vault_id', id).order('name'),
      supabase.from('categories').select('*').order('name'),
    ])
    if (!v) { toast.error('Coffre introuvable'); return }
    setVault(v)
    setItems(its || [])
    setCategories(cats || [])
    setLoading(false)
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Supprimer un item
  async function handleDeleteItem(item) {
    const { error } = await supabase.from('items').delete().eq('id', item.id)
    if (error) { toast.error('Erreur suppression'); return }
    await supabase.from('item_logs').insert({
      vault_id: id, item_id: item.id, item_name: item.name,
      action: 'delete', quantity: item.quantity, reason: 'Suppression manuelle',
    })
    toast.success(`"${item.name}" supprimé`)
    setDeleteItem(null)
    fetchAll()
  }

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'all' || item.categories?.name === filterCat
    return matchSearch && matchCat
  })

  const catNames = [...new Set(items.map(i => i.categories?.name).filter(Boolean))]
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-panel rounded" />
        <div className="h-24 bg-panel rounded-xl" />
        <div className="h-64 bg-panel rounded-xl" />
      </div>
    )
  }

  if (!vault) return null

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
        <Link to="/vaults" className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-4xl tracking-widest">{vault.name.toUpperCase()}</h1>
            {vault.pinned && <span className="text-[10px] text-accent-gold uppercase tracking-widest border border-accent-gold/30 px-1.5 py-0.5 rounded">📌 Épinglé</span>}
          </div>
          {vault.location && <p className="text-xs text-text-muted">📍 {vault.location}</p>}
        </div>
      </motion.div>

      {/* Stat rapide */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card border-border/60 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-green/10 flex items-center justify-center">
            <Package className="w-4 h-4 text-accent-green" />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider">Objets stockés</p>
            <p className="font-display text-2xl text-text-primary">{totalItems}</p>
          </div>
        </div>
        <button onClick={() => setAddItem(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Ajouter objet
        </button>
      </motion.div>

      {/* Toolbar recherche/filtre */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input pl-8"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {catNames.length > 0 && (
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input w-auto">
            <option value="all">Toutes catégories</option>
            {catNames.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </motion.div>

      {/* Items grid */}
      {filteredItems.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-10 h-10 text-text-muted mx-auto mb-2" />
          <p className="text-text-secondary text-sm">Aucun objet trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <AnimatePresence>
            {filteredItems.map((item, i) => {
              const catColor = CATEGORY_COLORS[item.categories?.name] || 'text-text-secondary bg-muted'
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03 }}
                  className="card hover:border-border/80 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`badge ${catColor} text-[10px]`}>
                      {item.categories?.name || 'Sans catégorie'}
                    </span>
                    {/* Actions item */}
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="btn-ghost p-1 text-text-muted hover:text-accent-red"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-medium text-text-primary text-sm mb-1 truncate">{item.name}</h3>
                  <div className="font-display text-3xl text-text-primary tracking-wider mb-4">
                    {item.quantity}
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setWithdrawItem(item)}
                      disabled={item.quantity === 0}
                      className="flex-1 btn-secondary text-xs py-1.5 border-accent-red/20 text-accent-red hover:bg-accent-red/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" /> Retirer
                    </button>
                    <button
                      onClick={() => setAddItem(item)}
                      className="flex-1 btn-secondary text-xs py-1.5 border-accent-green/20 text-accent-green hover:bg-accent-green/10"
                    >
                      <Plus className="w-3 h-3" /> Ajouter
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <AddItemModal
        open={!!addItem}
        existingItem={typeof addItem === 'object' && addItem !== true ? addItem : null}
        vaultId={id}
        categories={categories}
        onClose={() => setAddItem(false)}
        onSaved={fetchAll}
      />
      <WithdrawItemModal
        open={!!withdrawItem}
        item={withdrawItem}
        vaultId={id}
        onClose={() => setWithdrawItem(null)}
        onSaved={fetchAll}
      />
      <ConfirmModal
        open={!!deleteItem}
        title="Supprimer l'objet"
        message={`Supprimer "${deleteItem?.name}" du coffre ? Cette action est irréversible.`}
        danger
        onConfirm={() => handleDeleteItem(deleteItem)}
        onClose={() => setDeleteItem(null)}
      />
    </div>
  )
}
