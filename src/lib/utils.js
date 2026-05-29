import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount).replace('$US', '$')
}

export function formatDate(dateStr) {
  return format(new Date(dateStr), 'dd MMM yyyy à HH:mm', { locale: fr })
}

export function formatRelative(dateStr) {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr })
}
