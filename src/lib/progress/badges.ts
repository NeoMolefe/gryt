import { axisForExercise } from '@/lib/progress/exerciseCategory'
import type { Phase, Workout } from '@/types/plan.types'
import type { ProgressLog } from '@/types/session.types'
import type { BadgeStatus, CompletedSession } from '@/types/progress.types'

const PHASES: Phase[] = ['foundation', 'build', 'peak', 'deload']

/** Finds the longest run of consecutive calendar dates and the date the run first reached `target` days. */
function findStreak(dates: string[], target: number): { longest: number; achievedDate: string | null } {
  const sorted = [...new Set(dates)].sort()

  let longest = 0
  let runLength = 0
  let achievedDate: string | null = null
  let prev: Date | null = null

  for (const date of sorted) {
    const current = new Date(date)
    if (prev) {
      const diffDays = Math.round((current.getTime() - prev.getTime()) / 86400000)
      runLength = diffDays === 1 ? runLength + 1 : 1
    } else {
      runLength = 1
    }

    if (runLength > longest) longest = runLength
    if (runLength === target && !achievedDate) achievedDate = date

    prev = current
  }

  return { longest, achievedDate }
}

/** ISO-week key (year + week number) for grouping sessions by week. */
export function isoWeekKey(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`)
  const target = new Date(date.valueOf())
  const dayNumber = (date.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNumber + 3)
  const firstThursday = target.valueOf()
  target.setUTCMonth(0, 1)
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7)
  }
  const weekNumber = 1 + Math.round((firstThursday - target.valueOf()) / (7 * 86400000))
  return `${date.getUTCFullYear()}-W${weekNumber}`
}

export function inferSessionStyle(workout: Pick<Workout, 'main_lifts' | 'conditioning' | 'accessories'>): string | null {
  const candidate = workout.main_lifts[0] ?? workout.conditioning ?? workout.accessories[0]
  if (!candidate) return null
  return axisForExercise(candidate.name)
}

export interface ComputeBadgesInput {
  progressLogs: ProgressLog[]
  checkinDates: string[]
  completedSessions: CompletedSession[]
  workouts: Workout[]
}

export function computeBadges(input: ComputeBadgesInput): BadgeStatus[] {
  const { progressLogs, checkinDates, completedSessions, workouts } = input

  const completedWorkoutIds = new Set(completedSessions.map((s) => s.workoutId))
  const workoutById = new Map(workouts.map((w) => [w.id, w]))

  // --- Phase Complete / Deload Discipline ---
  let phaseComplete: BadgeStatus = {
    id: 'phase_complete',
    name: 'Phase Complete',
    description: 'Complete every workout in a training phase.',
    earned: false,
    earnedDate: null,
    progressCurrent: 0,
    progressTarget: 1,
  }

  let deloadDiscipline: BadgeStatus = {
    id: 'deload_discipline',
    name: 'Deload Discipline',
    description: 'Complete every workout in a deload week.',
    earned: false,
    earnedDate: null,
    progressCurrent: 0,
    progressTarget: 1,
  }

  for (const phase of PHASES) {
    const phaseWorkouts = workouts.filter((w) => w.phase === phase)
    if (phaseWorkouts.length === 0) continue

    const completedCount = phaseWorkouts.filter((w) => completedWorkoutIds.has(w.id)).length
    const earned = completedCount === phaseWorkouts.length

    const target = phase === 'deload' ? deloadDiscipline : phaseComplete
    if (completedCount > target.progressCurrent || target.progressTarget === 1) {
      target.progressCurrent = completedCount
      target.progressTarget = phaseWorkouts.length
    }

    if (earned) {
      const dates = completedSessions
        .filter((s) => phaseWorkouts.some((w) => w.id === s.workoutId))
        .map((s) => s.date)
        .sort()
      const date = dates[dates.length - 1] ?? null

      if (phase === 'deload') {
        deloadDiscipline = { ...deloadDiscipline, earned: true, earnedDate: date }
      } else if (!phaseComplete.earned) {
        phaseComplete = { ...phaseComplete, earned: true, earnedDate: date }
      }
    }
  }

  // --- First PB ---
  const pbLogs = [...progressLogs].filter((l) => l.is_pb).sort((a, b) => (a.completed_at < b.completed_at ? -1 : 1))
  const firstPb: BadgeStatus = {
    id: 'first_pb',
    name: 'First PB',
    description: 'Set your first personal best on any exercise.',
    earned: pbLogs.length > 0,
    earnedDate: pbLogs[0]?.completed_at.slice(0, 10) ?? null,
    progressCurrent: Math.min(pbLogs.length, 1),
    progressTarget: 1,
  }

  // --- 7-Day Streak / Recovery Warrior ---
  const sevenDay = findStreak(checkinDates, 7)
  const streak7: BadgeStatus = {
    id: 'streak_7',
    name: '7-Day Streak',
    description: 'Log your readiness check-in for 7 consecutive days.',
    earned: sevenDay.achievedDate !== null,
    earnedDate: sevenDay.achievedDate,
    progressCurrent: Math.min(sevenDay.longest, 7),
    progressTarget: 7,
  }

  const fourteenDay = findStreak(checkinDates, 14)
  const recoveryWarrior: BadgeStatus = {
    id: 'recovery_warrior',
    name: 'Recovery Warrior',
    description: 'Log your readiness check-in for 14 consecutive days.',
    earned: fourteenDay.achievedDate !== null,
    earnedDate: fourteenDay.achievedDate,
    progressCurrent: Math.min(fourteenDay.longest, 14),
    progressTarget: 14,
  }

  // --- Hybrid Ready ---
  const stylesByWeek = new Map<string, Set<string>>()
  let maxStyles = 0
  let hybridDate: string | null = null

  const sortedSessions = [...completedSessions].sort((a, b) => (a.date < b.date ? -1 : 1))
  for (const session of sortedSessions) {
    const workout = workoutById.get(session.workoutId)
    if (!workout) continue
    const style = inferSessionStyle(workout)
    if (!style) continue

    const weekKey = isoWeekKey(session.date)
    const styles = stylesByWeek.get(weekKey) ?? new Set<string>()
    styles.add(style)
    stylesByWeek.set(weekKey, styles)

    if (styles.size > maxStyles) maxStyles = styles.size
    if (styles.size >= 3 && !hybridDate) hybridDate = session.date
  }

  const hybridReady: BadgeStatus = {
    id: 'hybrid_ready',
    name: 'Hybrid Ready',
    description: 'Complete sessions across 3+ different training styles in one week.',
    earned: hybridDate !== null,
    earnedDate: hybridDate,
    progressCurrent: Math.min(maxStyles, 3),
    progressTarget: 3,
  }

  return [phaseComplete, streak7, firstPb, recoveryWarrior, deloadDiscipline, hybridReady]
}
