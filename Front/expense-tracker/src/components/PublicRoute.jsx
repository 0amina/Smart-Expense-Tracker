import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageSpinner } from './ui/Spinner'

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <PageSpinner />

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
