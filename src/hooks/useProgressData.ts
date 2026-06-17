import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { fetchActivePlan, fetchRecentCheckins } from '@/lib/dashboard/queries'
import { athleticProfile, consistencyHeatmap, readinessTrend, trainingLoadByWeek } from '@/lib/progress/analytics'
import { computeBadges } from '@/lib/progress/badges'
import { loadSeenBadges, saveSeenBadges } from '@/lib/progress/badgeStorage'
import { buildSessionHistory } from '@/lib/progress/history'
import { fetchAllPlans, fetchAllProgressLogs, fetchAllWorkouts, fetchCompletedSessions } from '@/lib/progress/queries'
import type { BadgeStatus } from '@/types/progress.types'

const CHECKIN_HISTORY_LIMIT = 120

export function useProgressData() {
  const session = useAuthStore((state) => state.session)
  const profile = useAuthStore((state) => state.profile)
  const userId = session?.user.id ?? null

  const planQuery = useQuery({
    queryKey: ['plan', userId],
    queryFn: () => fetchActivePlan(userId!),
    enabled: !!userId,
  })
  const plan = planQuery.data ?? null

  const plansQuery = useQuery({
    queryKey: ['progress-plans', userId],
    queryFn: () => fetchAllPlans(userId!),
    enabled: !!userId,
  })

  const workoutsQuery = useQuery({
    queryKey: ['progress-workouts', userId],
    queryFn: () => fetchAllWorkouts(userId!),
    enabled: !!userId,
  })

  const progressLogsQuery = useQuery({
    queryKey: ['progress-logs', userId],
    queryFn: () => fetchAllProgressLogs(userId!),
    enabled: !!userId,
  })

  const checkinsQuery = useQuery({
    queryKey: ['readiness-checkins', userId, CHECKIN_HISTORY_LIMIT],
    queryFn: () => fetchRecentCheckins(userId!, CHECKIN_HISTORY_LIMIT),
    enabled: !!userId,
  })

  const completedSessionsQuery = useQuery({
    queryKey: ['completed-sessions', userId],
    queryFn: () => fetchCompletedSessions(userId!),
    enabled: !!userId,
  })

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data])
  const workouts = useMemo(() => workoutsQuery.data ?? [], [workoutsQuery.data])
  const progressLogs = useMemo(() => progressLogsQuery.data ?? [], [progressLogsQuery.data])
  const checkins = useMemo(() => checkinsQuery.data ?? [], [checkinsQuery.data])
  const completedSessions = useMemo(() => completedSessionsQuery.data ?? [], [completedSessionsQuery.data])

  const sessionHistory = useMemo(
    () => buildSessionHistory(progressLogs, workouts, plans),
    [progressLogs, workouts, plans],
  )

  const activePlanWorkouts = useMemo(
    () => (plan ? workouts.filter((w) => w.plan_id === plan.id) : []),
    [workouts, plan],
  )

  const badges = useMemo(
    () =>
      computeBadges({
        progressLogs,
        checkinDates: checkins.map((c) => c.date),
        completedSessions,
        workouts: activePlanWorkouts,
      }),
    [progressLogs, checkins, completedSessions, activePlanWorkouts],
  )

  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<BadgeStatus[]>([])

  useEffect(() => {
    if (!userId || badges.length === 0) return

    void (async () => {
      const seen = loadSeenBadges(userId)
      const newlyEarned = badges.filter((b) => b.earned && !seen.has(b.id))

      if (newlyEarned.length > 0) {
        setNewlyEarnedBadges(newlyEarned)
        const updated = new Set(seen)
        for (const badge of newlyEarned) updated.add(badge.id)
        saveSeenBadges(userId, updated)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, badges.map((b) => `${b.id}:${b.earned}`).join(',')])

  function dismissNewBadge() {
    setNewlyEarnedBadges((current) => current.slice(1))
  }

  const recentCheckins14 = useMemo(
    () => [...checkins].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-14),
    [checkins],
  )

  const readinessAvg = useMemo(() => {
    if (recentCheckins14.length === 0) return 0
    const sum = recentCheckins14.reduce((acc, c) => acc + c.score, 0)
    return sum / recentCheckins14.length
  }, [recentCheckins14])

  const analytics = useMemo(() => {
    const activeDates = new Set(completedSessions.map((s) => s.date))
    return {
      readiness: readinessTrend(checkins),
      trainingLoad: trainingLoadByWeek(progressLogs, activePlanWorkouts),
      heatmap: consistencyHeatmap(activeDates),
      profile: athleticProfile(progressLogs, readinessAvg),
    }
  }, [checkins, progressLogs, activePlanWorkouts, completedSessions, readinessAvg])

  return {
    isLoading:
      planQuery.isLoading ||
      plansQuery.isLoading ||
      workoutsQuery.isLoading ||
      progressLogsQuery.isLoading ||
      checkinsQuery.isLoading,
    profile,
    plan,
    sessionHistory,
    badges,
    newlyEarnedBadges,
    dismissNewBadge,
    analytics,
  }
}
