export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due'

export type PlanType =
  | 'founding_monthly'
  | 'founding_annual'
  | 'standard_monthly'
  | 'standard_annual'

export interface SubscriptionState {
  status: SubscriptionStatus
  trialEndsAt: string | null
  planType: PlanType | null
  subscriptionEndsAt: string | null
  isComplimentary: boolean
  isFoundingMember: boolean
}

export function hasAccess(sub: SubscriptionState): boolean {
  if (sub.isComplimentary) return true
  if (sub.status === 'active') return true
  if (sub.status === 'trial' && sub.trialEndsAt) {
    return new Date(sub.trialEndsAt) > new Date()
  }
  return false
}

export function trialDaysRemaining(sub: SubscriptionState): number {
  if (!sub.trialEndsAt) return 0
  const ms = new Date(sub.trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}
