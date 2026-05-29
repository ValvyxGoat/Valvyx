// Hachage SHA-256 du mot de passe via l'API Web Crypto native
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Clé de stockage de session
const SESSION_KEY = 'vault_session'

export function saveSession() {
  sessionStorage.setItem(SESSION_KEY, 'authenticated')
  localStorage.setItem(SESSION_KEY, 'authenticated')
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_KEY)
}

export function isAuthenticated() {
  return (
    sessionStorage.getItem(SESSION_KEY) === 'authenticated' ||
    localStorage.getItem(SESSION_KEY) === 'authenticated'
  )
}
