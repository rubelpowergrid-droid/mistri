// Client Authentication & Session Helper

export interface UserSession {
  id: string
  name: string
  phone: string
  role: 'admin' | 'mistri' | 'customer'
  status?: string
}

const AUTH_STORAGE_KEY = 'mistri_user'
export const AUTH_EVENT_NAME = 'mistri_auth_state_change'

export function getStoredUser(): UserSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserSession
  } catch {
    return null
  }
}

export function setStoredUser(user: UserSession): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: user }))
  } catch (err) {
    console.error('Failed to save session:', err)
  }
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.clear()
    // Also remove any possible legacy keys
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: null }))
  } catch (err) {
    console.error('Failed to clear session:', err)
  }
}

