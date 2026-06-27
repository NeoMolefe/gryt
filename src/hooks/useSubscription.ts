import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SubscriptionState } from '@/types/subscription.types'

export function useSubscription(userId: string | null) {
  return useQuery<SubscriptionState | null>({
    queryKey: ['subscription', userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      if (!userId) return null

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          subscription_status,
          trial_ends_at,
          plan_type,
          subscription_ends_at,
          is_complimentary
        `)
        .eq('id', userId)
        .single()

      if (error || !data) return null

      // Check if user is a founding member
      const { count } = await supabase
        .from('founding_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      return {
        status: data.subscription_status as SubscriptionState['status'],
        trialEndsAt: data.trial_ends_at,
        planType: data.plan_type,
        subscriptionEndsAt: data.subscription_ends_at,
        isComplimentary: data.is_complimentary ?? false,
        isFoundingMember: (count ?? 0) > 0,
      }
    },
  })
}
