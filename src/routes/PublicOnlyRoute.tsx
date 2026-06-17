import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface PublicOnlyRouteProps {
  children: ReactNode
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const session = useAuthStore((state) => state.session)
  const profile = useAuthStore((state) => state.profile)
  const isInitialised = useAuthStore((state) => state.isInitialised)

  if (!isInitialised) {
    return null
  }

  if (session) {
    if (profile?.onboarding_completed) {
      return <Navigate to="/dashboard" replace />
    }
    return <Navigate to="/get-started" replace />
  }

  return <>{children}</>
}
