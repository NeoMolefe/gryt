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

// Supporting strength movements for HYROX Competitor sessions — capped at 3,
// chosen because each transfers directly to a HYROX station pattern
// (hip hinge → sled pull/deadlift carries, squat → wall ball/sled push,
// single-leg → lunges station), not generic strength-day filler.
const HYROX_SUPPORTING_LIFT_NAMES = ['Romanian Deadlift', 'Front Squat', 'Bulgarian Split Squat']
const MAX_HYROX_SUPPORTING_LIFTS = 3
const MAX_HYROX_STATIONS = 5

// Short interval-style running only — the 30-60min Zone 2 / Tempo / Long Run
// options in the library are sized for endurance-athlete sessions and would
// crowd out station volume if used as a HYROX session's opening block.
const HYROX_RUNNING_NAMES = ['Interval Run 6×800m', 'Interval Run 8×400m']

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

// HYROX sessions are structured fundamentally differently from the standard
// strength-first template: running is the primary conditioning block, HYROX
// station exercises (sled push/pull, wall ball, farmers carry, burpee broad
// jump, sandbag lunges, ski erg, rowing) form the main body of the session,
// and traditional main_lifts are limited to a handful of supporting lifts
// that directly transfer to those stations.
function selectHyroxExercises(input: SelectExercisesInput): SelectedExercises {
  const { equipment, phase, dayIndex, previousAccessoryNames } = input
  const archetype: Archetype = 'HYROX Competitor'

  const available = EXERCISE_LIBRARY.filter((exercise) => isAvailable(exercise, equipment, archetype, phase))

  const mobilityPool = available.filter((exercise) => exercise.category === 'mobility')
  const warm_up = rotate(mobilityPool, dayIndex).slice(0, 3)
  const cooldown = rotate(mobilityPool, dayIndex + 3).slice(0, 2)

  // Running is the primary conditioning block — selected ahead of stations.
  const runningPool = available.filter((exercise) => HYROX_RUNNING_NAMES.includes(exercise.name))
  const conditioning = rotate(runningPool, dayIndex)[0] ?? null

  // HYROX station exercises form the main body of the session.
  const stationPool = rotate(available.filter((exercise) => exercise.is_hyrox_station), dayIndex)
  const nonPreviousStations = stationPool.filter((exercise) => !previousAccessoryNames.includes(exercise.name))
  const previousStations = stationPool.filter((exercise) => previousAccessoryNames.includes(exercise.name))
  const stationSelectionPool =
    nonPreviousStations.length >= MAX_HYROX_STATIONS ? nonPreviousStations : [...nonPreviousStations, ...previousStations]
  const accessories = stationSelectionPool.slice(0, Math.min(MAX_HYROX_STATIONS, stationSelectionPool.length))

  // Traditional main_lifts capped at 2-3 supporting strength movements.
  const supportingLiftPool = rotate(
    available.filter((exercise) => HYROX_SUPPORTING_LIFT_NAMES.includes(exercise.name)),
    dayIndex,
  )
  const main_lifts = supportingLiftPool.slice(0, Math.min(MAX_HYROX_SUPPORTING_LIFTS, supportingLiftPool.length))

  return { warm_up, main_lifts, accessories, conditioning, cooldown }
}

export function selectExercises(input: SelectExercisesInput): SelectedExercises {
  if (input.archetype === 'HYROX Competitor') {
    return selectHyroxExercises(input)
  }

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
