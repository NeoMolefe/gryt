import type { Archetype, Equipment, Focus, Phase } from '@/types/plan.types'
import { EXERCISE_LIBRARY, type LibraryExercise } from './exerciseLibrary'
import type { SessionTemplate } from './selectSplit'

export interface SelectExercisesInput {
  template: SessionTemplate
  archetype: Archetype
  equipment: Equipment
  phase: Phase
  dayIndex: number
  previousAccessoryNames: string[]
}

export interface SelectedExercises {
  warm_up: LibraryExercise[]
  main_lifts: LibraryExercise[]
  accessories: LibraryExercise[]
  conditioning: LibraryExercise | null
  cooldown: LibraryExercise[]
}

const CONDITIONING_CATEGORIES = ['conditioning', 'vo2max', 'sprint']

function rotate<T>(arr: T[], offset: number): T[] {
  if (arr.length === 0) return arr
  const o = ((offset % arr.length) + arr.length) % arr.length
  return [...arr.slice(o), ...arr.slice(0, o)]
}

function isAvailable(exercise: LibraryExercise, equipment: Equipment, archetype: Archetype, phase: Phase): boolean {
  return (
    exercise.equipment.includes(equipment) &&
    exercise.archetypes.includes(archetype) &&
    exercise.phases.includes(phase)
  )
}

function sessionNameKeyword(sessionName: string): string | null {
  const match = sessionName.match(/^[A-Za-z]+/)
  return match ? match[0].toLowerCase() : null
}

export function selectExercises(input: SelectExercisesInput): SelectedExercises {
  const { template, archetype, equipment, phase, dayIndex, previousAccessoryNames } = input

  const available = EXERCISE_LIBRARY.filter((exercise) => isAvailable(exercise, equipment, archetype, phase))

  const mobilityPool = available.filter((exercise) => exercise.category === 'mobility')
  const rotatedMobility = rotate(mobilityPool, dayIndex)
  const warm_up = rotatedMobility.slice(0, 3)
  const cooldown = rotate(mobilityPool, dayIndex + 3).slice(0, 2)

  const focusPool = available.filter((exercise) => template.focus.includes(exercise.category))

  const conditioningCandidates = focusPool.filter((exercise) => CONDITIONING_CATEGORIES.includes(exercise.category))
  const nonConditioningPool = focusPool.filter((exercise) => !CONDITIONING_CATEGORIES.includes(exercise.category))

  // Power/plyometric-focused sessions must contain a matching exercise in main_lifts,
  // even though those exercises are not flagged as compounds.
  const isPowerFocus = (focus: Focus): boolean => focus === 'power' || focus === 'plyometric'
  const hasPowerFocus = template.focus.some(isPowerFocus)
  const powerCandidates = rotate(
    nonConditioningPool.filter((exercise) => hasPowerFocus && isPowerFocus(exercise.category)),
    dayIndex,
  )

  const sortedRest = rotate(
    [...nonConditioningPool]
      .filter((exercise) => !(hasPowerFocus && isPowerFocus(exercise.category)))
      .sort((a, b) => Number(b.is_compound) - Number(a.is_compound)),
    dayIndex,
  )

  const mainCount = Math.min(5, Math.max(3, Math.min(nonConditioningPool.length, 4)))

  const main_lifts: LibraryExercise[] = []
  if (powerCandidates.length > 0) {
    main_lifts.push(powerCandidates[0])
  }
  for (const exercise of sortedRest) {
    if (main_lifts.length >= mainCount) break
    main_lifts.push(exercise)
  }

  const mainNames = new Set(main_lifts.map((exercise) => exercise.name))
  const remainingPool = nonConditioningPool.filter((exercise) => !mainNames.has(exercise.name))

  const nonPrevious = remainingPool.filter((exercise) => !previousAccessoryNames.includes(exercise.name))
  const previous = remainingPool.filter((exercise) => previousAccessoryNames.includes(exercise.name))
  const accessoryPool = nonPrevious.length >= 3 ? nonPrevious : [...nonPrevious, ...previous]
  const accessories = rotate(accessoryPool, dayIndex).slice(0, Math.min(3, accessoryPool.length))

  let conditioning: LibraryExercise | null = null
  if (conditioningCandidates.length > 0) {
    const constraint = template.conditioning_type_constraint
    const constrainedPool = constraint
      ? conditioningCandidates.filter((exercise) =>
          exercise.conditioning_type !== undefined && constraint.includes(exercise.conditioning_type),
        )
      : conditioningCandidates

    const pool = constrainedPool.length > 0 ? constrainedPool : conditioningCandidates

    const keyword = sessionNameKeyword(template.session_name)
    const keywordMatch = keyword
      ? pool.find((exercise) => exercise.name.toLowerCase().includes(keyword))
      : undefined
    conditioning = keywordMatch ?? rotate(pool, dayIndex)[0]
  }

  return { warm_up, main_lifts, accessories, conditioning, cooldown }
}
