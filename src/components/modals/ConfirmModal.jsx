import Modal from '../ui/Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {danger && (
            <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-accent-red" />
            </div>
          )}
          <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
          <button
            onClick={onConfirm}
            className={`flex-1 justify-center ${danger ? 'btn-primary' : 'btn-primary'}`}
          >
            Confirmer
          </button>
        </div>
      </div>
    </Modal>
  )
}
