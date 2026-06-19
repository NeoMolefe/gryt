import type { Workout } from '@/types/plan.types'
import type { ExerciseSection, FlatExercise } from '@/types/session.types'

const SECTION_ORDER: ExerciseSection[] = ['warm_up', 'main_lifts', 'accessories', 'core_stability', 'conditioning', 'cooldown']

// For HYROX simulation sessions the main body (main_lifts, accessories, conditioning)
// is replaced by the station sequence — only warm-up and cooldown flow through the
// standard exercise logger.
const HYROX_SECTIONS: ExerciseSection[] = ['warm_up', 'cooldown']

export function flattenExercises(workout: Workout): FlatExercise[] {
  const flat: FlatExercise[] = []
  const isHyrox = Boolean(workout.hyrox_simulation?.length)
  const sections = isHyrox ? HYROX_SECTIONS : SECTION_ORDER

  for (const section of sections) {
    if (section === 'conditioning') {
      if (workout.conditioning) {
        flat.push({ section, block: workout.conditioning, isCompound: false })
      }
      continue
    }

    // core_stability is nullable (rows created before that column existed
    // have null, not []) — every other section here is a required array.
    for (const block of workout[section] ?? []) {
      flat.push({ section, block, isCompound: section === 'main_lifts' })
    }
  }

  return flat
}

/** Parses a duration string like "30 sec", "45s", "1 min" into total seconds, or null if not a duration. */
export function parseDurationSeconds(reps: number | string): number | null {
  if (typeof reps === 'number') return null

  const match = reps.match(/(\d+(?:\.\d+)?)\s*(sec|second|min|minute)/i)
  if (!match) return null

  const value = parseFloat(match[1]!)
  const unit = match[2]!.toLowerCase()
  return unit.startsWith('min') ? Math.round(value * 60) : Math.round(value)
}
