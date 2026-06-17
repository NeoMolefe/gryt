import { EXERCISE_LIBRARY } from '@/lib/planGeneration/exerciseLibrary'
import type { Focus } from '@/types/plan.types'
import type { AthleticAxis } from '@/types/progress.types'

const CATEGORY_BY_EXERCISE: Record<string, Focus> = {}
for (const exercise of EXERCISE_LIBRARY) {
  CATEGORY_BY_EXERCISE[exercise.name] = exercise.category
  if (exercise.home_alternative) {
    CATEGORY_BY_EXERCISE[exercise.home_alternative] = exercise.category
  }
}

export function categoryForExercise(name: string): Focus | null {
  return CATEGORY_BY_EXERCISE[name] ?? null
}

/** Maps each training-plan focus category onto one of the five trainable athletic-profile axes. */
export const AXIS_BY_CATEGORY: Record<Focus, AthleticAxis> = {
  upper_push: 'Strength',
  upper_pull: 'Strength',
  lower: 'Strength',
  power: 'Power',
  plyometric: 'Power',
  sprint: 'Power',
  vo2max: 'Endurance',
  conditioning: 'Endurance',
  mobility: 'Mobility',
  core: 'Mobility',
  loaded_carry: 'Conditioning',
  agility: 'Conditioning',
  lateral: 'Conditioning',
}

export function axisForExercise(name: string): AthleticAxis | null {
  const category = categoryForExercise(name)
  return category ? AXIS_BY_CATEGORY[category] : null
}
