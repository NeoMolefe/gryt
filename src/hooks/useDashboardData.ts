import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getCurrentBadge } from '@/lib/dashboard/badges'
import {
  abandonSessionLog,
  fetchActivePlan,
  fetchActiveSessionLog,
  fetchRecentCheckins,
  fetchTodayCompletedSessionLog,
  fetchWorkouts,
  submitCheckin,
} from '@/lib/dashboard/queries'
import { calculateReadinessScore } from '@/lib/dashboard/readiness'
import {
  addDays,
  countConsecutiveTrainingDays,
  findPreviousTrainingWorkout,
  findTodaysWorkout,
  formatDateISO,
  getCurrentWeekNumber,
  getDayOffsetInWeek,
  getWeekSchedule,
} from '@/lib/dashboard/schedule'
import { selectMobilityRoutine } from '@/lib/dashboard/selectMobilityRoutine'
import { calculateStreak } from '@/lib/dashboard/streak'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badgeDefinitions'
import { applyXpDelta, awardBadge, recordXpEvents } from '@/lib/gamification/queries'
import { consumePendingXp } from '@/lib/gamification/pendingXp'
import { evaluateAppOpenNotifications } from '@/lib/notifications/triggers'
import type { UnlockedBadge } from '@/types/gamification.types'

const LAST_ROUTINE_KEY_PREFIX = 'gryt_last_mobility_routine_'

function getLastRoutineId(userId: string): { routineId: string | null; date: string | null } {
  try {
    const raw = localStorage.getItem(`${LAST_ROUTINE_KEY_PREFIX}${userId}`)
    if (!raw) return { routineId: null, date: null }
    return JSON.parse(raw) as { routineId: string | null; date: string | null }
  } catch {
    return { routineId: null, date: null }
  }
}

function storeLastRoutineId(userId: string, routineId: string, date: string): void {
  try {
    localStorage.setItem(`${LAST_ROUTINE_KEY_PREFIX}${userId}`, JSON.stringify({ routineId, date }))
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
}

export function useDashboardData() {
  const session = useAuthStore((state) => state.session)
  const profile = useAuthStore((state) => state.profile)
  const refreshProfile = useAuthStore((state) => state.refreshProfile)
  const queryClient = useQueryClient()

  const userId = session?.user.id ?? null
  const [now] = useState(() => new Date())

  const planQuery = useQuery({
    queryKey: ['plan', userId],
    queryFn: () => fetchActivePlan(userId!),
    enabled: !!userId,
    retry: 1,
  })

  const plan = planQuery.data ?? null

  const workoutsQuery = useQuery({
    queryKey: ['workouts', plan?.id],
    queryFn: () => fetchWorkouts(plan!.id),
    enabled: !!plan?.id,
    retry: 1,
  })

  const checkinsQuery = useQuery({
    queryKey: ['readiness-checkins', userId],
    queryFn: () => fetchRecentCheckins(userId!),
    enabled: !!userId,
  })

  const sessionLogQuery = useQuery({
    queryKey: ['session-log', userId],
    queryFn: () => fetchActiveSessionLog(userId!),
    enabled: !!userId,
  })

  const todaySessionLogQuery = useQuery({
    queryKey: ['today-completed-session-log', userId],
    queryFn: () => fetchTodayCompletedSessionLog(userId!),
    enabled: !!userId,
  })

  const todaySessionLog = todaySessionLogQuery.data ?? null
  const isTodayWorkoutCompleted = !!todaySessionLog

  const workouts = workoutsQuery.data ?? []
  const checkins = useMemo(() => checkinsQuery.data ?? [], [checkinsQuery.data])
  const availabilityDays = profile?.availability_days ?? 0
  const xpTotal = profile?.xp_total ?? 0

  const todayIso = formatDateISO(now)
  const todayCheckin = checkins.find((c) => c.date === todayIso) ?? null

  const streak = useMemo(() => {
    const dates = new Set(checkins.map((c) => c.date))
    return calculateStreak(dates, now)
  }, [checkins, now])

  const deloadAlert = useMemo(() => {
    if (checkins.length < 3) return false
    const sorted = [...checkins].sort((a, b) => (a.date < b.date ? 1 : -1))
    return sorted.slice(0, 3).every((c) => c.score < 50)
  }, [checkins])

  const weekNumber = plan ? getCurrentWeekNumber(plan.start_date, plan.total_weeks, now) : 1

  const todaysWorkout = plan
    ? findTodaysWorkout(workouts, weekNumber, availabilityDays, plan.start_date, now)
    : null

  const weekSchedule = plan ? getWeekSchedule(workouts, weekNumber, plan.start_date, availabilityDays, now) : []

  const isRestDay = plan ? getDayOffsetInWeek(plan.start_date, now) + 1 > availabilityDays : false

  const previousWorkout = plan
    ? findPreviousTrainingWorkout(workouts, plan.total_weeks, availabilityDays, plan.start_date, now)
    : null

  const consecutiveTrainingDays = plan ? countConsecutiveTrainingDays(plan.start_date, availabilityDays, now) : 0

  const mobilityRoutine = useMemo(() => {
    if (!isRestDay || !userId) return null

    const { routineId: lastRoutineId, date: lastDate } = getLastRoutineId(userId)
    const yesterdayIso = formatDateISO(new Date(now.getTime() - 24 * 60 * 60 * 1000))
    const effectiveLastId = lastDate === yesterdayIso ? lastRoutineId : null

    const routine = selectMobilityRoutine(
      previousWorkout,
      todayCheckin?.score ?? null,
      consecutiveTrainingDays,
      effectiveLastId,
    )

    storeLastRoutineId(userId, routine.id, todayIso)
    return routine
  }, [isRestDay, userId, previousWorkout, todayCheckin, consecutiveTrainingDays, now, todayIso])

  const badge = getCurrentBadge(xpTotal)

  const [xpToast, setXpToast] = useState<number | null>(null)
  const [unlockedBadge, setUnlockedBadge] = useState<UnlockedBadge | null>(null)
  const [recoveryMilestone, setRecoveryMilestone] = useState(false)

  // Show a float-up for any XP earned off-Dashboard (e.g. during a workout session).
  useEffect(() => {
    if (!userId) return

    void (async () => {
      const pending = consumePendingXp(userId)
      if (pending) setXpToast(pending)
    })()
  }, [userId])

  useEffect(() => {
    if (xpToast === null) return
    const timer = setTimeout(() => setXpToast(null), 1600)
    return () => clearTimeout(timer)
  }, [xpToast])

  // Evaluate app-open notification triggers once per dashboard load.
  useEffect(() => {
    if (!userId || !plan) return

    const yesterday = addDays(now, -1)
    const yesterdayDayNumber = getDayOffsetInWeek(plan.start_date, yesterday) + 1
    const todayDayNumber = getDayOffsetInWeek(plan.start_date, now) + 1
    const isDayAfterLastTrainingDay = yesterdayDayNumber === availabilityDays && todayDayNumber > availabilityDays

    void (async () => {
      await evaluateAppOpenNotifications({
        userId,
        now,
        hasLoggedActivityToday: todayCheckin !== null,
        deloadAlert,
        isDayAfterLastTrainingDay,
      })
      await queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, plan?.id])

  const checkInMutation = useMutation({
    mutationFn: async (input: { sleep: number; soreness: number; energy: number }) => {
      const score = calculateReadinessScore(input.sleep, input.energy, input.soreness)
      const checkin = await submitCheckin({
        userId: userId!,
        sleepQuality: input.sleep,
        sorenessLevel: input.soreness,
        energyStress: input.energy,
        score,
        currentXp: xpTotal,
      })

      await recordXpEvents(userId!, ['readiness_checkin'])

      let xpAwarded = 10
      let earnedBadge: UnlockedBadge | null = null
      let recoveryMilestoneHit = false

      const dates = new Set([...checkins.map((c) => c.date), checkin.date])
      const newStreak = calculateStreak(dates, now)

      if (newStreak === 7) {
        const trigger = 'Logged your readiness check-in for 7 consecutive days'
        if (await awardBadge(userId!, 'streak_7', trigger)) {
          await recordXpEvents(userId!, ['streak_7'])
          await applyXpDelta(userId!, xpTotal + 10, 150)
          xpAwarded += 150
          earnedBadge = { id: 'streak_7', ...BADGE_DEFINITIONS.streak_7, trigger }
          recoveryMilestoneHit = true
        }
      } else if (newStreak === 14) {
        const trigger = 'Logged your readiness check-in for 14 consecutive days'
        if (await awardBadge(userId!, 'recovery_warrior', trigger)) {
          earnedBadge = { id: 'recovery_warrior', ...BADGE_DEFINITIONS.recovery_warrior, trigger }
        }
      }

      return { checkin, xpAwarded, earnedBadge, recoveryMilestoneHit }
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['readiness-checkins', userId] })
      await refreshProfile()
      setXpToast(result.xpAwarded)
      if (result.earnedBadge) setUnlockedBadge(result.earnedBadge)
      if (result.recoveryMilestoneHit) setRecoveryMilestone(true)
    },
  })

  const abandonSessionMutation = useMutation({
    mutationFn: async (sessionLogId: string) => abandonSessionLog(sessionLogId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session-log', userId] })
    },
  })

  const queryError =
    planQuery.error instanceof Error ? planQuery.error.message :
    workoutsQuery.error instanceof Error ? workoutsQuery.error.message :
    checkinsQuery.error instanceof Error ? checkinsQuery.error.message :
    null

  return {
    isLoading: planQuery.isLoading || workoutsQuery.isLoading || checkinsQuery.isLoading,
    error: queryError,
    profile,
    plan,
    workouts,
    todayCheckin,
    streak,
    deloadAlert,
    weekNumber,
    todaysWorkout,
    isTodayWorkoutCompleted,
    todaySessionLog,
    weekSchedule,
    isRestDay,
    mobilityRoutine,
    badge,
    xpTotal,
    sessionLog: sessionLogQuery.data ?? null,
    submitCheckin: checkInMutation.mutateAsync,
    isSubmittingCheckin: checkInMutation.isPending,
    abandonSession: abandonSessionMutation.mutateAsync,
    xpToast,
    unlockedBadge,
    dismissUnlockedBadge: () => setUnlockedBadge(null),
    recoveryMilestone,
    dismissRecoveryMilestone: () => setRecoveryMilestone(false),
  }
}
