import { flattenExercises } from '@/lib/session/flattenExercises'
import type { Plan, Workout } from '@/types/plan.types'
import type { ProgressLog } from '@/types/session.types'
import type { ExerciseBestSet, SessionHistoryEntry } from '@/types/progress.types'

/** Groups progress logs into completed-session cards, one per workout per day. */
export function buildSessionHistory(progressLogs: ProgressLog[], workouts: Workout[], plans: Plan[]): SessionHistoryEntry[] {
  const workoutById = new Map(workouts.map((w) => [w.id, w]))
  const planIndexById = new Map(plans.map((plan, index) => [plan.id, index + 1]))

  const groups = new Map<string, ProgressLog[]>()
  for (const log of progressLogs) {
    const date = log.completed_at.slice(0, 10)
    const key = `${log.workout_id}__${date}`
    const list = groups.get(key)
    if (list) {
      list.push(log)
    } else {
      groups.set(key, [log])
    }
  }

  const entries: SessionHistoryEntry[] = []

  for (const [key, logs] of groups) {
    const workout = workoutById.get(logs[0]!.workout_id)
    if (!workout) continue

    const date = key.slice(key.indexOf('__') + 2)

    const bestByExercise = new Map<string, ExerciseBestSet>()
    let rpeSum = 0
    for (const log of logs) {
      rpeSum += log.rpe
      const current = bestByExercise.get(log.exercise_name)
      const volume = log.weight_kg * log.reps
      if (!current || volume > current.weightKg * current.reps) {
        bestByExercise.set(log.exercise_name, {
          exerciseName: log.exercise_name,
          weightKg: log.weight_kg,
          reps: log.reps,
          rpe: log.rpe,
        })
      }
    }

    const totalSets = flattenExercises(workout).reduce((sum, fe) => sum + fe.block.sets, 0)
    const planNumber = plans.length > 1 ? planIndexById.get(workout.plan_id) ?? null : null

    entries.push({
      id: key,
      workoutId: workout.id,
      date,
      sessionName: workout.session_name,
      phase: workout.phase,
      weekNumber: workout.week_number,
      dayNumber: workout.day_number,
      completionRate: totalSets > 0 ? Math.min(1, logs.length / totalSets) : 0,
      averageRpe: rpeSum / logs.length,
      bestSets: Array.from(bestByExercise.values()),
      planLabel: planNumber ? `Plan ${planNumber}` : null,
    })
  }

  return entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}
