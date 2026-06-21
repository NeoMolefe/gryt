import { RECOVERY_SESSION_CONTENT } from '@/lib/dashboard/adaptSession'
import type { ExerciseBlock, Workout } from '@/types/plan.types'

export interface WorkoutAdaptationChange {
  exercise_name: string
  action: 'remove' | 'reduce_sets' | 'reduce_rpe'
  new_sets?: number
  new_rpe?: number
}

export interface WorkoutAdaptation {
  reason: string
  changes: WorkoutAdaptationChange[]
  add_recovery_exercises: boolean
}

/** Shape stored in localStorage under the Kwazi override key — keeps the
 * reason alongside the adapted workout so WorkoutSession.tsx's "View
 * changes" banner has something to show, not just the resulting exercises. */
export interface KwaziOverridePayload {
  workout: Workout
  reason: string
}

const ADAPTATION_BLOCK_REGEX = /<WORKOUT_ADAPTATION>([\s\S]*?)<\/WORKOUT_ADAPTATION>/

/** Extracts and parses the `<WORKOUT_ADAPTATION>` JSON block from a raw Kwazi reply, or null if absent/invalid. */
export function parseWorkoutAdaptation(message: string): WorkoutAdaptation | null {
  const match = message.match(ADAPTATION_BLOCK_REGEX)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1].trim())
    if (!Array.isArray(parsed.changes)) return null
    return parsed as WorkoutAdaptation
  } catch {
    return null
  }
}

/** Removes the `<WORKOUT_ADAPTATION>` block so only Kwazi's conversational text is displayed. */
export function stripWorkoutAdaptationBlock(message: string): string {
  return message
    .replace(ADAPTATION_BLOCK_REGEX, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function applyChangesToBlocks(blocks: ExerciseBlock[], changes: WorkoutAdaptationChange[]): ExerciseBlock[] {
  const changeByName = new Map(changes.map((c) => [c.exercise_name.toLowerCase(), c]))
  const result: ExerciseBlock[] = []

  for (const block of blocks) {
    const change = changeByName.get(block.name.toLowerCase())
    if (!change) {
      result.push(block)
      continue
    }
    if (change.action === 'remove') continue
    if (change.action === 'reduce_sets' && change.new_sets != null) {
      result.push({ ...block, sets: change.new_sets })
    } else if (change.action === 'reduce_rpe' && change.new_rpe != null) {
      result.push({ ...block, rpe_target: change.new_rpe })
    } else {
      result.push(block)
    }
  }

  return result
}

/**
 * Computes the adapted version of today's workout from Kwazi's suggested
 * changes. Never writes anything to Supabase — caller is responsible for
 * storing the result (localStorage, per the Kwazi override mechanism).
 */
export function applyWorkoutAdaptation(workout: Workout, adaptation: WorkoutAdaptation): Workout {
  if (adaptation.add_recovery_exercises) {
    return { ...workout, ...RECOVERY_SESSION_CONTENT, hyrox_simulation: null }
  }

  let conditioning = workout.conditioning
  if (conditioning) {
    const change = adaptation.changes.find((c) => c.exercise_name.toLowerCase() === conditioning!.name.toLowerCase())
    if (change?.action === 'remove') conditioning = null
    else if (change?.action === 'reduce_sets' && change.new_sets != null) conditioning = { ...conditioning, sets: change.new_sets }
    else if (change?.action === 'reduce_rpe' && change.new_rpe != null) conditioning = { ...conditioning, rpe_target: change.new_rpe }
  }

  return {
    ...workout,
    main_lifts: applyChangesToBlocks(workout.main_lifts, adaptation.changes),
    accessories: applyChangesToBlocks(workout.accessories, adaptation.changes),
    conditioning,
  }
}

export function kwaziOverrideKey(workoutId: string, dateIso: string): string {
  return `gryt_kwazi_override_${workoutId}_${dateIso}`
}
