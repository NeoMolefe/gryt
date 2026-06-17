import { addDays, formatDateISO } from '@/lib/dashboard/schedule'
import { axisForExercise } from '@/lib/progress/exerciseCategory'
import { ATHLETIC_AXES } from '@/types/progress.types'
import type { ReadinessCheckin } from '@/types/dashboard.types'
import type { Workout } from '@/types/plan.types'
import type { ProgressLog } from '@/types/session.types'
import type { AthleticProfilePoint, HeatmapDay, ReadinessTrendPoint, TrainingLoadPoint } from '@/types/progress.types'

const HEATMAP_WEEKS = 12

/** Last 14 days of readiness scores, oldest first. */
export function readinessTrend(checkins: ReadinessCheckin[]): ReadinessTrendPoint[] {
  return [...checkins]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-14)
    .map((c) => ({ date: c.date, score: c.score }))
}

/** Total training volume (weight x reps) per plan week. */
export function trainingLoadByWeek(progressLogs: ProgressLog[], workouts: Workout[]): TrainingLoadPoint[] {
  const weekByWorkout = new Map(workouts.map((w) => [w.id, w.week_number]))
  const loadByWeek = new Map<number, number>()

  for (const log of progressLogs) {
    const week = weekByWorkout.get(log.workout_id)
    if (week === undefined) continue
    const volume = log.weight_kg * log.reps
    loadByWeek.set(week, (loadByWeek.get(week) ?? 0) + volume)
  }

  return Array.from(loadByWeek.entries())
    .sort(([a], [b]) => a - b)
    .map(([week, load]) => ({ week, load: Math.round(load) }))
}

/** 12 weeks x 7 days grid (oldest week first, Mon-Sun rows) of training-day activity. */
export function consistencyHeatmap(activeDates: Set<string>, now: Date = new Date()): HeatmapDay[][] {
  const totalDays = HEATMAP_WEEKS * 7
  const start = addDays(now, -(totalDays - 1))

  const days: HeatmapDay[] = []
  for (let i = 0; i < totalDays; i++) {
    const date = formatDateISO(addDays(start, i))
    days.push({ date, active: activeDates.has(date) })
  }

  const weeks: HeatmapDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

/** Derives a 6-axis athletic profile from training volume distribution and recent readiness. */
export function athleticProfile(progressLogs: ProgressLog[], readinessAvg: number): AthleticProfilePoint[] {
  const counts: Record<string, number> = {}
  let total = 0

  for (const log of progressLogs) {
    const axis = axisForExercise(log.exercise_name)
    if (!axis) continue
    counts[axis] = (counts[axis] ?? 0) + 1
    total += 1
  }

  return ATHLETIC_AXES.map((axis) => {
    if (axis === 'Recovery') {
      return { axis, value: Math.round(readinessAvg) }
    }
    const count = counts[axis] ?? 0
    const value = total > 0 ? Math.min(100, Math.round((count / total) * 100 * 5)) : 0
    return { axis, value }
  })
}
