import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Neo's user ID — only this account can access /admin
const ADMIN_USER_ID = 'e99714c7-763c-4179-9b5c-a4e259e19abb'

interface AdminGuardProps {
  children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const session = useAuthStore((state) => state.session)
  const isInitialised = useAuthStore((state) => state.isInitialised)

  if (!isInitialised) return null
  if (!session || session.user.id !== ADMIN_USER_ID) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
