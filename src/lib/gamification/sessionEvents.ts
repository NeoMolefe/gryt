import { supabase } from '@/lib/supabase'
import { inferSessionStyle, isoWeekKey } from '@/lib/progress/badges'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badgeDefinitions'
import { awardBadge, recordXpEvents } from '@/lib/gamification/queries'
import { createNotificationIfEnabled } from '@/lib/notifications/queries'
import { XP_VALUES } from '@/types/gamification.types'
import type { UnlockedBadge, XpEventType } from '@/types/gamification.types'
import type { Workout } from '@/types/plan.types'

export interface SessionGamificationResult {
  bonusXp: number
  unlockedBadges: UnlockedBadge[]
}

/**
 * Evaluates badge/XP triggers that fire when a workout session completes:
 * personal bests, the first-ever PB, phase/deload completion, and the
 * "3+ training styles in one week" hybrid badge.
 */
export async function evaluateSessionGamification(params: {
  userId: string
  workout: Workout
  pbCount: number
  hadPriorPb: boolean
}): Promise<SessionGamificationResult> {
  const { userId, workout, pbCount, hadPriorPb } = params

  const xpEvents: XpEventType[] = ['workout_complete']
  for (let i = 0; i < pbCount; i++) xpEvents.push('personal_best')

  const unlockedBadges: UnlockedBadge[] = []

  if (pbCount > 0 && !hadPriorPb) {
    const trigger = `Logged your first personal best in ${workout.session_name}`
    if (await awardBadge(userId, 'first_pb', trigger)) {
      unlockedBadges.push({ id: 'first_pb', ...BADGE_DEFINITIONS.first_pb, trigger })
    }
  }

  // Phase / deload completion.
  const { data: phaseWorkoutsData } = await supabase
    .from('workouts')
    .select('id')
    .eq('plan_id', workout.plan_id)
    .eq('phase', workout.phase)

  const phaseWorkoutIds = (phaseWorkoutsData ?? []).map((w: { id: string }) => w.id)

  if (phaseWorkoutIds.length > 0) {
    const { data: completedLogs } = await supabase
      .from('session_logs')
      .select('workout_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('workout_id', phaseWorkoutIds)

    const completedIds = new Set((completedLogs ?? []).map((l: { workout_id: string }) => l.workout_id))
    const phaseDone = phaseWorkoutIds.every((id) => completedIds.has(id))

    if (phaseDone) {
      if (workout.phase === 'deload') {
        const trigger = 'Completed every workout in your deload week'
        if (await awardBadge(userId, 'deload_discipline', trigger)) {
          unlockedBadges.push({ id: 'deload_discipline', ...BADGE_DEFINITIONS.deload_discipline, trigger })
        }
      } else {
        const trigger = `Completed every workout in your ${workout.phase} phase`
        if (await awardBadge(userId, 'phase_complete', trigger)) {
          unlockedBadges.push({ id: 'phase_complete', ...BADGE_DEFINITIONS.phase_complete, trigger })
          xpEvents.push('phase_complete')
          await createNotificationIfEnabled(
            userId,
            'phase_complete',
            'Phase complete',
            `You've completed every workout in your ${workout.phase} phase. Time to move on to the next block.`,
          )
        }
      }
    }
  }

  // Hybrid Ready: 3+ distinct training styles completed in the current ISO week.
  const todayKey = isoWeekKey(new Date().toISOString().slice(0, 10))

  const { data: allWorkouts } = await supabase
    .from('workouts')
    .select('id, main_lifts, accessories, conditioning')
    .eq('plan_id', workout.plan_id)

  const workoutById = new Map(
    (allWorkouts ?? []).map((w: Pick<Workout, 'id' | 'main_lifts' | 'accessories' | 'conditioning'>) => [w.id, w]),
  )

  const { data: completedSessionLogs } = await supabase
    .from('session_logs')
    .select('workout_id, updated_at')
    .eq('user_id', userId)
    .eq('status', 'completed')

  const styles = new Set<string>()
  for (const log of (completedSessionLogs ?? []) as { workout_id: string; updated_at: string }[]) {
    if (isoWeekKey(log.updated_at.slice(0, 10)) !== todayKey) continue
    const sessionWorkout = workoutById.get(log.workout_id)
    if (!sessionWorkout) continue
    const style = inferSessionStyle(sessionWorkout)
    if (style) styles.add(style)
  }

  if (styles.size >= 3) {
    const trigger = 'Completed sessions across 3+ training styles in one week'
    if (await awardBadge(userId, 'hybrid_ready', trigger)) {
      unlockedBadges.push({ id: 'hybrid_ready', ...BADGE_DEFINITIONS.hybrid_ready, trigger })
    }
  }

  await recordXpEvents(userId, xpEvents)

  const bonusXp = xpEvents.includes('phase_complete') ? XP_VALUES.phase_complete : 0

  return { bonusXp, unlockedBadges }
}
