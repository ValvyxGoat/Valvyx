import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Vault, Package, Trash2, Pencil, ArrowRight, Pin, PinOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import VaultModal from '../components/modals/VaultModal'
import ConfirmModal from '../components/modals/ConfirmModal'

const COLOR_MAP = {
  red:    'text-accent-red bg-accent-red/10 border-accent-red/20',
  orange: 'text-accent-orange bg-accent-orange/10 border-accent-orange/20',
  green:  'text-accent-green bg-accent-green/10 border-accent-green/20',
  gold:   'text-accent-gold bg-accent-gold/10 border-accent-gold/20',
}

export default function VaultList() {
  const [vaults, setVaults] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editVault, setEditVault] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function fetchVaults() {
    const { data, error } = await supabase
      .from('vaults')
      .select('*, items(quantity)')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) { toast.error('Erreur chargement coffres'); return }

    const enriched = (data || []).map(v => ({
      ...v,
      totalItems: (v.items || []).reduce((s, i) => s + i.quantity, 0),
    }))
    setVaults(enriched)
    setLoading(false)
  }

  useEffect(() => { fetchVaults() }, [])

  async function handleDelete(vault) {
    const { error } = await supabase.from('vaults').delete().eq('id', vault.id)
    if (error) { toast.error('Erreur suppression'); return }
    toast.success(`Coffre "${vault.name}" supprimé`)
    setDeleteTarget(null)
    fetchVaults()
  }

  // Épingler / désépingler un coffre (un seul à la fois)
  async function handlePin(vault, e) {
    e.preventDefault()
    e.stopPropagation()

    // Si déjà épinglé → on désépingle
    if (vault.pinned) {
      await supabase.from('vaults').update({ pinned: false }).eq('id', vault.id)
      toast.success(`"${vault.name}" désépinglé`)
    } else {
      // Désépingler tous les autres d'abord
      await supabase.from('vaults').update({ pinned: false }).neq('id', vault.id)
      await supabase.from('vaults').update({ pinned: true }).eq('id', vault.id)
      toast.success(`"${vault.name}" épinglé en premier`)
    }
    fetchVaults()
  }

  function openCreate() { setEditVault(null); setModalOpen(true) }
  function openEdit(vault, e) { e.preventDefault(); e.stopPropagation(); setEditVault(vault); setModalOpen(true) }
  function openDelete(vault, e) { e.preventDefault(); e.stopPropagation(); setDeleteTarget(vault) }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-widest">COFFRES</h1>
          <p className="text-text-secondary text-sm mt-1">{vaults.length} entrepôt{vaults.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Nouveau coffre
        </button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-panel border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : vaults.length === 0 ? (
        <div className="card text-center py-16">
          <Vault className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary mb-4">Aucun coffre créé</p>
          <button onClick={openCreate} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" /> Créer un coffre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {vaults.map((vault, i) => {
              const cls = COLOR_MAP[vault.color] || COLOR_MAP.red
              return (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={`/vaults/${vault.id}`}
                    className={`card block transition-all duration-200 group relative overflow-hidden ${
                      vault.pinned
                        ? 'border-accent-gold/40 bg-gradient-to-br from-panel to-[#1a1500]'
                        : 'hover:border-border/80'
                    }`}
                  >
                    {/* Badge épinglé */}
                    {vault.pinned && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-gold/0 via-accent-gold to-accent-gold/0" />
                    )}

                    {/* Actions */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Bouton épingler */}
                      <button
                        onClick={e => handlePin(vault, e)}
                        title={vault.pinned ? 'Désépingler' : 'Épingler en premier'}
                        className={`btn-ghost p-1.5 ${vault.pinned ? 'text-accent-gold' : 'text-text-muted hover:text-accent-gold'}`}
                      >
                        {vault.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={e => openEdit(vault, e)} className="btn-ghost p-1.5 text-text-muted">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => openDelete(vault, e)} className="btn-ghost p-1.5 text-text-muted hover:text-accent-red">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Vault icon */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border ${cls}`}>
                        <Vault className="w-5 h-5" />
                      </div>
                      {vault.pinned && (
                        <span className="flex items-center gap-1 text-[10px] text-accent-gold uppercase tracking-widest">
                          <Pin className="w-2.5 h-2.5" /> Épinglé
                        </span>
                      )}
                    </div>

                    <h3 className="font-medium text-text-primary mb-0.5 pr-20">{vault.name}</h3>
                    {vault.location && (
                      <p className="text-xs text-text-muted mb-3">📍 {vault.location}</p>
                    )}
                    {vault.description && (
                      <p className="text-xs text-text-secondary mb-3 line-clamp-2">{vault.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-text-secondary text-xs">
                        <Package className="w-3 h-3" />
                        {vault.totalItems} objet{vault.totalItems > 1 ? 's' : ''}
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-red group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <VaultModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        vault={editVault}
        onSaved={fetchVaults}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Supprimer le coffre"
        message={`Supprimer "${deleteTarget?.name}" ? Tous les objets et l'historique seront effacés.`}
        danger
        onConfirm={() => handleDelete(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
