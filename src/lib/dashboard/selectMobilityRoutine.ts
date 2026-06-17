import { EXERCISE_LIBRARY } from '@/lib/planGeneration/exerciseLibrary'
import type { Focus, Workout } from '@/types/plan.types'
import type { MobilityRoutine } from '@/types/dashboard.types'
import { MOBILITY_ROUTINES } from './mobilityRoutines'

const ACTIVE_RECOVERY = MOBILITY_ROUTINES.find((routine) => routine.id === 'active_recovery')!
const FULL_BODY_FLOW = MOBILITY_ROUTINES.find((routine) => routine.id === 'full_body_flow')!

// Ordered by priority — first matching group wins, per spec.
const ROUTINE_PRIORITY = [
  { id: 'hip_glute' as const, focuses: ['lower', 'plyometric'] as Focus[] },
  { id: 'thoracic_shoulder' as const, focuses: ['upper_push', 'upper_pull', 'loaded_carry'] as Focus[] },
  { id: 'lower_back_hamstring' as const, focuses: ['conditioning', 'sprint'] as Focus[] },
  { id: 'ankle_knee' as const, focuses: ['lateral', 'agility'] as Focus[] },
  { id: 'full_body_flow' as const, focuses: ['conditioning'] as Focus[] },
]

function getSessionFocuses(session: Workout): Set<Focus> {
  const names = [...session.main_lifts, ...session.accessories, session.conditioning]
    .filter((block): block is NonNullable<typeof block> => block !== null)
    .map((block) => block.name)

  const focuses = new Set<Focus>()
  for (const name of names) {
    const exercise = EXERCISE_LIBRARY.find((item) => item.name === name)
    if (exercise) focuses.add(exercise.category)
  }

  return focuses
}

function findRoutineById(id: string): MobilityRoutine {
  return MOBILITY_ROUTINES.find((routine) => routine.id === id) ?? FULL_BODY_FLOW
}

export function selectMobilityRoutine(
  previousSession: Workout | null,
  readinessScore: number | null,
  consecutiveTrainingDays: number,
  lastRoutineId: string | null,
): MobilityRoutine {
  if ((readinessScore !== null && readinessScore < 50) || consecutiveTrainingDays >= 3) {
    return ACTIVE_RECOVERY
  }

  const focuses = previousSession ? getSessionFocuses(previousSession) : new Set<Focus>()

  const candidates: MobilityRoutine[] = []
  for (const entry of ROUTINE_PRIORITY) {
    if (entry.focuses.some((focus) => focuses.has(focus))) {
      candidates.push(findRoutineById(entry.id))
    }
  }
  candidates.push(FULL_BODY_FLOW)

  const choice = candidates.find((routine) => routine.id !== lastRoutineId)
  return choice ?? candidates[0]
}
