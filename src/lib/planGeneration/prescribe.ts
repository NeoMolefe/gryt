import type { ExperienceLevel } from '@/types/onboarding'
import type { ExerciseBlock, Phase } from '@/types/plan.types'
import type { LibraryExercise } from './exerciseLibrary'
import { formatPaceDisplay } from './calculateGoalPace'
import type { PaceZones } from './calculateGoalPace'

export interface PrescribeInput {
  exercise: LibraryExercise
  phase: Phase
  weekInPhase: number
  totalWeeksInPhase: number
  experience: ExperienceLevel
  sessionName?: string
  paceZones?: PaceZones | null
  // Warm-up exercises always get exactly 2 sets, regardless of phase or
  // experience — they're priming the body, not a training stimulus that
  // should progress with the program.
  isWarmUp?: boolean
}

const RPE_RANGES: Record<Phase, [number, number]> = {
  foundation: [6, 7],
  build: [7, 8],
  peak: [8, 9],
  deload: [5, 6],
}

function interpolateRpe(phase: Phase, weekInPhase: number, totalWeeksInPhase: number): number {
  const [min, max] = RPE_RANGES[phase]
  if (totalWeeksInPhase <= 1) return max
  const progress = (weekInPhase - 1) / (totalWeeksInPhase - 1)
  const raw = min + (max - min) * progress
  return Math.round(raw * 2) / 2
}

function prescribeSets(exercise: LibraryExercise, phase: Phase, weekInPhase: number, experience: ExperienceLevel): number {
  const baseSets = (() => {
    switch (phase) {
      case 'foundation':
        return Math.max(2, exercise.default_sets - 1)
      case 'build':
        return Math.min(exercise.default_sets + 2, exercise.default_sets + Math.floor((weekInPhase - 1) / 2))
      case 'peak':
        return exercise.default_sets
      case 'deload':
        return Math.max(1, Math.round(exercise.default_sets * 0.6))
    }
  })()
  if (experience === 'beginner') return Math.max(2, baseSets - 1)
  if (experience === 'advanced') return baseSets + 1
  return baseSets
}

function prescribeReps(exercise: LibraryExercise, phase: Phase): number | string {
  if (typeof exercise.default_reps !== 'number') return exercise.default_reps

  switch (phase) {
    case 'foundation':
      return exercise.default_reps + 2
    case 'build':
      return exercise.default_reps
    case 'peak':
      return Math.max(1, exercise.default_reps - 2)
    case 'deload':
      return exercise.default_reps
  }
}

function paceZoneForSession(sessionName: string, phase: Phase, paceZones: PaceZones): string {
  const lower = sessionName.toLowerCase()
  if (phase === 'deload' || lower.includes('easy') || lower.includes('long')) {
    return formatPaceDisplay(paceZones.easy_pace_min_per_km, 'easy')
  }
  if (lower.includes('tempo') || lower.includes('threshold')) {
    return formatPaceDisplay(paceZones.tempo_pace_min_per_km, 'tempo')
  }
  if (lower.includes('interval') || lower.includes('speed') || lower.includes('vo2') || lower.includes('conditioning')) {
    return formatPaceDisplay(paceZones.interval_pace_min_per_km, 'interval')
  }
  return formatPaceDisplay(paceZones.goal_pace_min_per_km, 'goal pace')
}

function loadGuidance(
  exercise: LibraryExercise,
  phase: Phase,
  weekInPhase: number,
  experience: ExperienceLevel,
  rpe: number,
  sessionName: string,
  paceZones: PaceZones | null | undefined,
): string {
  const isPercentBased =
    experience === 'advanced' && exercise.is_compound && typeof exercise.default_reps === 'number'

  if (isPercentBased) {
    let pct: number
    switch (phase) {
      case 'foundation':
        pct = 60 + (weekInPhase - 1) * 1
        break
      case 'build':
        pct = 70 + (weekInPhase - 1) * 2.5
        break
      case 'peak':
        pct = 82 + (weekInPhase - 1) * 2
        break
      case 'deload':
        pct = 55
        break
    }
    return `${Math.round(pct)}% of 1RM`
  }

  if (typeof exercise.default_reps !== 'number') {
    if (paceZones) {
      return paceZoneForSession(sessionName, phase, paceZones)
    }
    return phase === 'deload' ? 'Easy effort, well below race pace' : `Hold an effort around RPE ${rpe}`
  }

  const repsInTank = Math.max(0, Math.round(10 - rpe))
  return `Leave ~${repsInTank} rep${repsInTank === 1 ? '' : 's'} in reserve`
}

function prescribeRestSeconds(exercise: LibraryExercise, phase: Phase): number {
  if (phase === 'peak' && exercise.is_compound) return exercise.default_rest_seconds + 30
  if (phase === 'deload') return Math.max(30, Math.round(exercise.default_rest_seconds * 0.75))
  return exercise.default_rest_seconds
}

export function prescribe(input: PrescribeInput): ExerciseBlock {
  const { exercise, phase, weekInPhase, totalWeeksInPhase, experience, sessionName = '', paceZones, isWarmUp } = input

  const rpe = interpolateRpe(phase, weekInPhase, totalWeeksInPhase)
  const sets = isWarmUp ? 2 : prescribeSets(exercise, phase, weekInPhase, experience)
  const reps = prescribeReps(exercise, phase)
  const rest_seconds = prescribeRestSeconds(exercise, phase)

  return {
    name: exercise.name,
    sets,
    reps,
    rest_seconds,
    rpe_target: rpe,
    load_guidance: loadGuidance(exercise, phase, weekInPhase, experience, rpe, sessionName, paceZones),
    coaching_cues: exercise.coaching_cues,
    home_alternative: exercise.home_alternative,
    progression_tier: weekInPhase,
  }
}
