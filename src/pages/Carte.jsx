import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

// Icônes disponibles avec emoji + label
const MARKER_TYPES = [
  { id: 'planque',    label: 'Planque',        emoji: '🏠', color: '#e63946' },
  { id: 'deal',       label: 'Point de deal',  emoji: '💊', color: '#f4913d' },
  { id: 'armes',      label: 'Cache armes',    emoji: '🔫', color: '#f5c542' },
  { id: 'argent',     label: 'Cache argent',   emoji: '💰', color: '#39d353' },
  { id: 'danger',     label: 'Zone de danger', emoji: '⚠️', color: '#e63946' },
  { id: 'reunion',    label: 'Point de réunion','emoji': '👥', color: '#60a5fa' },
  { id: 'laboratoire',label: 'Laboratoire',    emoji: '🧪', color: '#a78bfa' },
  { id: 'vehicule',   label: 'Garage/Véhicule',emoji: '🚗', color: '#888' },
]

// Dimensions de la carte GTA 5 (image)
const MAP_W = 2048
const MAP_H = 2048

export default function Carte() {
  const [markers, setMarkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [addMode, setAddMode] = useState(false)
  const [pendingPos, setPendingPos] = useState(null) // {x, y} en % de l'image
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', type: 'planque' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const mapRef = useRef(null)

  // Charger les marqueurs depuis Supabase
  async function fetchMarkers() {
    const { data, error } = await supabase
      .from('map_markers')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) setMarkers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchMarkers() }, [])

  // Clic sur la carte en mode ajout
  function handleMapClick(e) {
    if (!addMode) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPendingPos({ x, y })
    setShowForm(true)
    setFormData({ name: '', type: 'planque' })
  }

  async function handleSaveMarker() {
    if (!formData.name.trim()) { toast.error('Nom requis'); return }
    const type = MARKER_TYPES.find(t => t.id === formData.type)
    const { error } = await supabase.from('map_markers').insert({
      name: formData.name.trim(),
      type: formData.type,
      emoji: type.emoji,
      color: type.color,
      x: pendingPos.x,
      y: pendingPos.y,
    })
    if (error) { toast.error('Erreur : ' + error.message); return }
    toast.success(`Marqueur "${formData.name}" ajouté`)
    setShowForm(false)
    setPendingPos(null)
    setAddMode(false)
    fetchMarkers()
  }

  async function handleDelete(marker) {
    const { error } = await supabase.from('map_markers').delete().eq('id', marker.id)
    if (error) { toast.error('Erreur suppression'); return }
    toast.success('Marqueur supprimé')
    setDeleteTarget(null)
    fetchMarkers()
  }

  function cancelAdd() {
    setAddMode(false)
    setPendingPos(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-widest">CARTE</h1>
          <p className="text-text-secondary text-sm mt-1">{markers.length} lieu{markers.length > 1 ? 'x' : ''} marqué{markers.length > 1 ? 's' : ''}</p>
        </div>
        {addMode ? (
          <button onClick={cancelAdd} className="btn-secondary border-accent-red/30 text-accent-red">
            <X className="w-4 h-4" /> Annuler
          </button>
        ) : (
          <button onClick={() => setAddMode(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Ajouter un lieu
          </button>
        )}
      </motion.div>

      {/* Légende */}
      <div className="flex flex-wrap gap-2">
        {MARKER_TYPES.map(t => (
          <span key={t.id} className="flex items-center gap-1.5 px-2 py-1 bg-panel border border-border rounded-lg text-xs text-text-secondary">
            <span>{t.emoji}</span> {t.label}
          </span>
        ))}
      </div>

      {/* Bandeau mode ajout */}
      <AnimatePresence>
        {addMode && !showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card border-accent-red/30 bg-accent-red/5 text-center py-3"
          >
            <p className="text-accent-red text-sm font-medium">
              🎯 Clique sur la carte pour placer un marqueur
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carte */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-2 overflow-hidden"
      >
        <div
          ref={mapRef}
          className={`relative w-full select-none ${addMode ? 'cursor-crosshair' : 'cursor-default'}`}
          style={{ paddingBottom: '100%' }}
          onClick={handleMapClick}
        >
          {/* Image carte GTA 5 */}
          <img
            src="https://www.gta5-mods.com/images/gtav-map.jpg"
            alt="Carte GTA 5"
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            draggable={false}
            onError={e => {
              // Fallback si l'image ne charge pas
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          {/* Fallback carte */}
          <div
            className="absolute inset-0 rounded-lg bg-[#1a2a1a] hidden items-center justify-center flex-col gap-2"
            style={{ display: 'none' }}
          >
            <MapPin className="w-12 h-12 text-text-muted" />
            <p className="text-text-muted text-sm">Carte non disponible</p>
            <p className="text-text-muted text-xs">Vérifiez votre connexion internet</p>
          </div>

          {/* Marqueur en cours de placement */}
          {pendingPos && !showForm && (
            <div
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 animate-bounce"
              style={{ left: `${pendingPos.x}%`, top: `${pendingPos.y}%` }}
            >
              <div className="w-8 h-8 bg-accent-red rounded-full flex items-center justify-center text-sm shadow-glow-red">
                📍
              </div>
            </div>
          )}

          {/* Marqueurs sauvegardés */}
          {markers.map(marker => (
            <motion.div
              key={marker.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onClick={e => e.stopPropagation()}
            >
              {/* Pin */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg cursor-pointer transition-transform hover:scale-125 border-2"
                style={{ backgroundColor: marker.color + '22', borderColor: marker.color }}
                title={marker.name}
              >
                {marker.emoji}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                <div className="bg-panel border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary whitespace-nowrap shadow-xl">
                  <p className="font-medium">{marker.name}</p>
                  <p className="text-text-muted">{MARKER_TYPES.find(t => t.id === marker.type)?.label}</p>
                </div>
                <div className="w-2 h-2 bg-panel border-r border-b border-border rotate-45 -mt-1" />
              </div>

              {/* Bouton supprimer */}
              <button
                onClick={e => { e.stopPropagation(); setDeleteTarget(marker) }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red rounded-full hidden group-hover:flex items-center justify-center text-white text-[10px] hover:bg-red-600 transition-colors pointer-events-auto"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal ajout marqueur */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-void/80 backdrop-blur-sm"
              onClick={cancelAdd}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-panel border border-border rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-display text-xl tracking-widest">NOUVEAU LIEU</h2>
                <button onClick={cancelAdd} className="btn-ghost p-1.5 text-text-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Nom du lieu *</label>
                  <input
                    className="input"
                    placeholder="Planque de Sandy, Point de deal..."
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-2 uppercase tracking-wider">Type de lieu</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MARKER_TYPES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setFormData(f => ({ ...f, type: t.id }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                          formData.type === t.id
                            ? 'border-accent-red bg-accent-red/10 text-text-primary'
                            : 'border-border text-text-secondary hover:border-border/80 hover:bg-muted'
                        }`}
                      >
                        <span>{t.emoji}</span> {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={cancelAdd} className="btn-secondary flex-1 justify-center">Annuler</button>
                  <button onClick={handleSaveMarker} className="btn-primary flex-1 justify-center">
                    <Plus className="w-4 h-4" /> Placer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal confirmation suppression */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-void/80 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-panel border border-border rounded-2xl w-full max-w-xs shadow-2xl p-5"
            >
              <h3 className="font-display text-lg tracking-widest mb-3">SUPPRIMER</h3>
              <p className="text-text-secondary text-sm mb-4">
                Supprimer le lieu <span className="text-text-primary font-medium">"{deleteTarget.name}"</span> ?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 justify-center">Annuler</button>
                <button onClick={() => handleDelete(deleteTarget)} className="btn-primary flex-1 justify-center">Supprimer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
