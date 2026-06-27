import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useSubscription } from '@/hooks/useSubscription'
import { hasAccess } from '@/types/subscription.types'
import { Paywall } from '@/components/payment/Paywall'

interface SubscriptionGuardProps {
  children: ReactNode
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const session = useAuthStore((state) => state.session)
  const userId = session?.user.id ?? null
  const { data: subscription, isLoading } = useSubscription(userId)

  // Still loading — don't flash paywall
  if (isLoading || !subscription) return <>{children}</>

  // Has access — trial active, subscribed, or complimentary
  if (hasAccess(subscription)) return <>{children}</>

  // No access — show full-screen paywall
  return (
    <Paywall
      userId={userId!}
      userEmail={session!.user.email ?? ''}
      subscription={subscription}
    />
  )
}
