import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAdmin({ children }) {
  const { isAuthed, user } = useAuth()

  if (!isAuthed) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/markets" replace />
  return children
}