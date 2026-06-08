import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../lib/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {

  // ── Hydrate from localStorage on first render ─────────────
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token,   setToken]   = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Keep axios Authorization header in sync ───────────────
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  // ── Internal helpers ──────────────────────────────────────
  function persist(data) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }

  function clear() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  // ── Public actions ────────────────────────────────────────

  /**
   * Login with email + password.
   * Returns full API response on success, throws on failure.
   */
  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      persist(data)
      return data
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Login failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Register a new account.
   * User is immediately logged in on success.
   */
  const register = useCallback(async (name, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      persist(data)
      return data
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Registration failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Logout — clears token, user, and axios header.
   */
  const logout = useCallback(() => {
    clear()
    setError(null)
  }, [])

  /** Call this when user starts editing a field to dismiss errors. */
  const clearError = useCallback(() => setError(null), [])

  // ── Context value ─────────────────────────────────────────
  return (
    <AuthCtx.Provider value={{
      user,
      token,
      loading,
      error,
      isAuthed: !!token,
      login,
      register,
      logout,
      clearError,
    }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
