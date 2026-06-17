import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const session = useAuthStore((state) => state.session)
  const isInitialised = useAuthStore((state) => state.isInitialised)

  if (!isInitialised) {
    return null
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
