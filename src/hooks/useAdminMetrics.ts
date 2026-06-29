import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

export interface AdminMetrics {
  subscribers: {
    total: number
    paying: number
    trial: number
    expired: number
    complimentary: number
    newToday: number
    newThisWeek: number
    foundingMembers: number
    planBreakdown: Record<string, number>
  }
  activity: {
    workoutsToday: number
    workoutsThisWeek: number
    checkInsToday: number
    checkInsThisWeek: number
  }
  kwazi: {
    totalMessagesThisWeek: number
    activeUsersThisWeek: number
  }
  regenerations: {
    totalThisMonth: number
  }
  activityFeed: Array<{
    type: string
    timestamp: string
    label: string
  }>
  users: Array<{
    id: string
    name: string
    email: string
    subscriptionStatus: string
    planType: string | null
    isComplimentary: boolean
    archetype: string | null
    kwaziThisWeek: number
    joinedAt: string
  }>
  kwaziPerUser: Record<string, { total: number; days: Array<{ date: string; count: number }> }>
  regenHistory: Array<{
    user_id: string
    from_archetype: string | null
    to_archetype: string | null
    regenerated_at: string | null
    month: string
    count: number
  }>
  trends: {
    signupsByDay: Record<string, number>
    workoutsByDay: Record<string, number>
  }
  archetypeCounts: Record<string, number>
  generatedAt: string
}

async function fetchAdminMetrics(accessToken: string): Promise<AdminMetrics> {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-metrics`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  if (!res.ok) throw new Error('Failed to load admin metrics')
  return res.json()
}

export function useAdminMetrics() {
  const accessToken = useAuthStore((state) => state.session?.access_token ?? null)

  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => fetchAdminMetrics(accessToken!),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  })
}
