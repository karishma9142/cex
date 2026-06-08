import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../lib/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {

  // ── State ──────────────────────────────────────────────────
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token,   setToken]   = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Keep axios header in sync whenever token changes ───────
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  // ── Helpers ────────────────────────────────────────────────
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

  // ── Auth actions ───────────────────────────────────────────

  /**
   * Login with email + password
   * Returns the full API response data on success.
   * Throws the axios error on failure so the calling component
   * can show its own error message.
   */
  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/signin', { email, password })
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
   * On success the user is immediately logged in (token saved).
   */
  const register = useCallback(async (fullName, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/signup', { fullName, email, password })
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

  /**
   * Clear any stored auth error
   * (call this when the user starts typing again)
   */
  const clearError = useCallback(() => setError(null), [])

  // ── Expose ─────────────────────────────────────────────────
  const value = {
    // state
    user,
    token,
    loading,
    error,
    isAuthed: !!token,

    // actions
    login,
    register,
    logout,
    clearError,
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}