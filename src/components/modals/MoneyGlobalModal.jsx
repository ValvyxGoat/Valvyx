import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import { supabase } from '../../lib/supabase'
import { formatMoney } from '../../lib/utils'

export default function MoneyGlobalModal({ open, mode, balance, onClose, onSaved }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { setAmount(''); setReason('') }
  }, [open])

  const isDeposit = mode === 'deposit'
  const numAmount = parseInt(amount) || 0

  async function handleConfirm() {
    if (numAmount <= 0) { toast.error('Montant invalide'); return }
    if (!isDeposit && numAmount > balance) {
      toast.error(`Fonds insuffisants (max : ${formatMoney(balance)})`); return
    }

    setSaving(true)
    const newBalance = isDeposit ? balance + numAmount : balance - numAmount

    // Mettre à jour le solde global
    const { error: updateErr } = await supabase
      .from('group_money')
      .update({ balance: newBalance })
      .gt('id', '00000000-0000-0000-0000-000000000000') // update all rows (il n'y en a qu'une)

    if (updateErr) { toast.error('Erreur : ' + updateErr.message); setSaving(false); return }

    // Log du mouvement
    await supabase.from('money_logs_global').insert({
      action: isDeposit ? 'deposit' : 'withdraw',
      amount: numAmount,
      reason: reason.trim() || null,
      balance_after: newBalance,
    })

    toast.success(`${isDeposit ? 'Dépôt' : 'Retrait'} de ${formatMoney(numAmount)} effectué`)
    setSaving(false)
    onSaved()
    onClose()
  }

  const PRESETS = isDeposit
    ? [1000, 5000, 10000, 50000]
    : [500, 1000, 5000, 10000]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isDeposit ? 'DÉPÔT ARGENT' : 'RETRAIT ARGENT'}
    >
      <div className="space-y-4">
        {/* Solde actuel */}
        <div className={`rounded-lg px-4 py-3 border flex items-center justify-between ${
          isDeposit ? 'bg-accent-green/5 border-accent-green/20' : 'bg-accent-red/5 border-accent-red/20'
        }`}>
          <span className="text-xs text-text-muted uppercase tracking-wider">Solde actuel</span>
          <span className="font-display text-2xl text-accent-gold">{formatMoney(balance)}</span>
        </div>

        {/* Montant */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">
            Montant ($) <span className="text-accent-red">*</span>
          </label>
          <input
            type="number"
            min={1}
            className="input font-mono text-lg"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  numAmount === p
                    ? 'border-accent-gold text-accent-gold'
                    : 'border-border text-text-muted hover:border-border/80'
                }`}
              >
                {formatMoney(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Raison */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">
            Raison (optionnel)
          </label>
          <input
            className="input"
            placeholder="Deal, vente, dépense..."
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>

        {/* Prévisualisation */}
        {numAmount > 0 && (
          <div className="bg-surface rounded-lg px-4 py-2.5 border border-border flex items-center justify-between text-sm">
            <span className="text-text-secondary">Nouveau solde :</span>
            <span className={`font-mono font-medium ${
              isDeposit
                ? 'text-accent-green'
                : numAmount > balance ? 'text-accent-red' : 'text-accent-gold'
            }`}>
              {formatMoney(isDeposit ? balance + numAmount : balance - numAmount)}
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
          <button
            onClick={handleConfirm}
            disabled={saving || numAmount <= 0}
            className={`btn-primary flex-1 justify-center disabled:opacity-50 ${
              isDeposit
                ? 'bg-accent-green hover:bg-green-500 text-white'
                : 'bg-accent-red hover:bg-red-600 text-white'
            }`}
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : isDeposit
                ? `Déposer ${numAmount > 0 ? formatMoney(numAmount) : ''}`
                : `Retirer ${numAmount > 0 ? formatMoney(numAmount) : ''}`
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}
