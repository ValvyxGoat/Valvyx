import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import { supabase } from '../../lib/supabase'

const COLORS = ['red', 'orange', 'green', 'gold']
const COLOR_LABELS = { red: 'Rouge', orange: 'Orange', green: 'Vert', gold: 'Or' }
const COLOR_CLASS = {
  red: 'bg-accent-red',
  orange: 'bg-accent-orange',
  green: 'bg-accent-green',
  gold: 'bg-accent-gold',
}

export default function VaultModal({ open, onClose, vault, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '', location: '', color: 'red' })
  const [saving, setSaving] = useState(false)
  const isEdit = !!vault

  useEffect(() => {
    if (vault) {
      setForm({ name: vault.name, description: vault.description || '', location: vault.location || '', color: vault.color || 'red' })
    } else {
      setForm({ name: '', description: '', location: '', color: 'red' })
    }
  }, [vault, open])

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Nom requis'); return }
    setSaving(true)
    const payload = { name: form.name.trim(), description: form.description, location: form.location, color: form.color }

    const { error } = isEdit
      ? await supabase.from('vaults').update(payload).eq('id', vault.id)
      : await supabase.from('vaults').insert(payload)

    setSaving(false)
    if (error) { toast.error('Erreur : ' + error.message); return }
    toast.success(isEdit ? 'Coffre mis à jour' : 'Coffre créé')
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'MODIFIER LE COFFRE' : 'NOUVEAU COFFRE'}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Nom *</label>
          <input className="input" placeholder="Planque principale" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Localisation</label>
          <input className="input" placeholder="Sandy Shores" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Description</label>
          <textarea className="input resize-none h-20" placeholder="Description du coffre..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-2 uppercase tracking-wider">Couleur</label>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setForm(f => ({ ...f, color: c }))}
                title={COLOR_LABELS[c]}
                className={`w-7 h-7 rounded-full ${COLOR_CLASS[c]} transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-panel scale-110' : 'opacity-50 hover:opacity-80'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
