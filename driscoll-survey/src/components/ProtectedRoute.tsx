import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-natural-white flex items-center justify-center">
        <div className="animate-pulse text-dark-warm-grey text-lg font-medium">
          Loading...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={requireAdmin ? "/admin/login" : "/"} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}