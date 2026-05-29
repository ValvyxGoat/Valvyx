import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import { supabase } from '../../lib/supabase'

export default function WithdrawItemModal({ open, item, vaultId, onClose, onSaved }) {
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { setQty(1); setReason('') }
  }, [open])

  async function handleWithdraw() {
    if (!item) return
    if (qty <= 0) { toast.error('Quantité invalide'); return }
    if (qty > item.quantity) { toast.error(`Stock insuffisant (max : ${item.quantity})`); return }
    if (!reason.trim()) { toast.error('Raison requise'); return }

    setSaving(true)
    const newQty = item.quantity - qty

    const { error } = await supabase
      .from('items')
      .update({ quantity: newQty })
      .eq('id', item.id)

    if (error) { toast.error('Erreur mise à jour'); setSaving(false); return }

    await supabase.from('item_logs').insert({
      vault_id: vaultId,
      item_id: item.id,
      item_name: item.name,
      action: 'remove',
      quantity: qty,
      reason: reason.trim(),
    })

    toast.success(`—${qty} ${item.name} retiré(s)`)
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={item ? `RETIRER — ${item.name}` : 'RETIRER'}>
      {item && (
        <div className="space-y-4">
          {/* Stock info */}
          <div className="bg-surface rounded-lg px-4 py-3 border border-border flex items-center justify-between">
            <span className="text-xs text-text-muted uppercase tracking-wider">Stock actuel</span>
            <span className="font-display text-2xl text-text-primary">
              {item.quantity} <span className="text-sm font-body text-text-muted">{item.unit || 'u.'}</span>
            </span>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Quantité à retirer</label>
            <div className="flex gap-2 items-center">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="btn-secondary px-3 py-2 text-lg">—</button>
              <input
                type="number"
                min={1}
                max={item.quantity}
                className="input text-center font-mono text-lg"
                value={qty}
                onChange={e => setQty(Math.min(item.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
              />
              <button onClick={() => setQty(q => Math.min(item.quantity, q + 1))} className="btn-secondary px-3 py-2 text-lg">＋</button>
            </div>
            <div className="flex gap-2 mt-2">
              {[1, 5, 10, 25].filter(n => n <= item.quantity).map(n => (
                <button key={n} onClick={() => setQty(n)} className={`text-xs px-2 py-1 rounded border transition-colors ${qty === n ? 'border-accent-red text-accent-red' : 'border-border text-text-muted hover:border-border/80'}`}>
                  {n}
                </button>
              ))}
              {item.quantity > 0 && (
                <button onClick={() => setQty(item.quantity)} className={`text-xs px-2 py-1 rounded border transition-colors ${qty === item.quantity ? 'border-accent-red text-accent-red' : 'border-border text-text-muted hover:border-border/80'}`}>
                  Tout ({item.quantity})
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">
              Raison du retrait <span className="text-accent-red">*</span>
            </label>
            <textarea
              className="input resize-none h-20"
              placeholder="Mission, deal, usage personnel..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          {/* Preview */}
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-lg px-4 py-2.5 flex items-center justify-between text-sm">
            <span className="text-text-secondary">Après retrait :</span>
            <span className="font-mono text-text-primary">{item.quantity - qty} {item.unit || 'u.'}</span>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button onClick={handleWithdraw} disabled={saving || !reason.trim()} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : `Retirer ${qty}`
              }
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
