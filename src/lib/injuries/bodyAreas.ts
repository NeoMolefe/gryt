import { categoryForExercise } from '@/lib/progress/exerciseCategory'
import type { Focus } from '@/types/plan.types'
import type { InjuryBodyArea, InjuryFlag, InjurySeverity } from '@/types/profile'

export const BODY_AREAS: InjuryBodyArea[] = ['Knee', 'Lower Back', 'Shoulder', 'Hip', 'Ankle', 'Wrist', 'Neck', 'Other']

export const INJURY_SEVERITIES: InjurySeverity[] = ['Mild', 'Moderate', 'Severe']

/** Focus categories that commonly load each body area, used to flag exercises that may aggravate an injury. */
const FOCUSES_BY_BODY_AREA: Record<InjuryBodyArea, Focus[]> = {
  Knee: ['lower', 'plyometric', 'sprint', 'agility', 'lateral'],
  'Lower Back': ['lower', 'core', 'loaded_carry', 'power'],
  Shoulder: ['upper_push', 'upper_pull', 'power'],
  Hip: ['lower', 'mobility', 'lateral', 'agility', 'plyometric'],
  Ankle: ['lower', 'plyometric', 'agility', 'sprint', 'lateral'],
  Wrist: ['upper_push', 'upper_pull', 'loaded_carry'],
  Neck: ['upper_push', 'upper_pull'],
  Other: [],
}

/** Returns the injury flags whose body area maps onto the exercise's focus category. */
export function flagsForExercise(exerciseName: string, injuryFlags: InjuryFlag[] | null | undefined): InjuryFlag[] {
  if (!injuryFlags || injuryFlags.length === 0) return []
  const category = categoryForExercise(exerciseName)
  if (!category) return []

  return injuryFlags.filter((flag) => FOCUSES_BY_BODY_AREA[flag.bodyArea]?.includes(category))
}
