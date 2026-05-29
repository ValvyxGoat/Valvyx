import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import { supabase } from '../../lib/supabase'

export default function AddItemModal({ open, existingItem, vaultId, categories, onClose, onSaved }) {
  const [mode, setMode] = useState('add') // 'add' | 'new'
  const [qty, setQty] = useState(1)
  const [form, setForm] = useState({ name: '', category_id: '', unit: 'unité' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setQty(1)
      setMode(existingItem ? 'add' : 'new')
      setForm({ name: '', category_id: categories[0]?.id || '', unit: 'unité' })
    }
  }, [open, existingItem, categories])

  async function handleSave() {
    if (qty <= 0) { toast.error('Quantité invalide'); return }
    setSaving(true)

    if (existingItem) {
      // Ajouter à un item existant
      const newQty = existingItem.quantity + qty
      const { error: updateErr } = await supabase
        .from('items')
        .update({ quantity: newQty })
        .eq('id', existingItem.id)

      if (updateErr) { toast.error('Erreur mise à jour'); setSaving(false); return }

      // Log
      await supabase.from('item_logs').insert({
        vault_id: vaultId,
        item_id: existingItem.id,
        item_name: existingItem.name,
        action: 'add',
        quantity: qty,
        reason: null,
      })
      toast.success(`+${qty} ${existingItem.name}`)
    } else {
      // Créer un nouvel item
      if (!form.name.trim()) { toast.error('Nom requis'); setSaving(false); return }
      const { data: newItem, error: insertErr } = await supabase
        .from('items')
        .insert({
          vault_id: vaultId,
          category_id: form.category_id || null,
          name: form.name.trim(),
          quantity: qty,
          unit: form.unit,
        })
        .select()
        .single()

      if (insertErr) { toast.error('Erreur création'); setSaving(false); return }

      // Log
      await supabase.from('item_logs').insert({
        vault_id: vaultId,
        item_id: newItem.id,
        item_name: newItem.name,
        action: 'create',
        quantity: qty,
        reason: 'Création initiale',
      })
      toast.success(`"${newItem.name}" ajouté au coffre`)
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  const title = existingItem ? `AJOUTER — ${existingItem.name}` : 'NOUVEL OBJET'

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {!existingItem && (
          <>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Nom de l'objet *</label>
              <input className="input" placeholder="Pistolet, Cocaïne..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Catégorie</label>
                <select className="input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">Sans catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Unité</label>
                <input className="input" placeholder="unité, g, kg..." value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">
            Quantité à ajouter
            {existingItem && <span className="ml-2 text-text-muted normal-case">(actuellement : {existingItem.quantity})</span>}
          </label>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="btn-secondary px-3 py-2 text-lg"
            >—</button>
            <input
              type="number"
              min={1}
              className="input text-center font-mono text-lg"
              value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <button
              onClick={() => setQty(q => q + 1)}
              className="btn-secondary px-3 py-2 text-lg"
            >＋</button>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50 border-accent-green/30 bg-accent-green/20 hover:bg-accent-green text-accent-green hover:text-white">
            {saving
              ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : existingItem ? `＋${qty} ajouter` : 'Créer l\'objet'
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}
