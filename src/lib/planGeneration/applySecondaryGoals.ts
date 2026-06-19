import type { Archetype, Equipment, ExerciseBlock, Focus, WorkoutSession } from '@/types/plan.types'
import type { ExperienceLevel, SecondaryGoal, SessionDuration } from '@/types/onboarding'
import { EXERCISE_LIBRARY } from './exerciseLibrary'
import { prescribe } from './prescribe'

const GOAL_FOCUS_MAP: Record<SecondaryGoal, Focus[]> = {
  improve_athleticism: ['agility', 'plyometric'],
  increase_explosiveness: ['power', 'plyometric'],
  improve_mobility_flexibility: ['mobility'],
  build_mental_toughness: ['conditioning'],
  improve_cardio_base: ['conditioning'],
  lose_body_fat: ['conditioning'],
  build_muscle: ['upper_push', 'upper_pull', 'lower'],
  improve_body_composition: ['conditioning'],
  improve_core_strength: ['core'],
  improve_posture: ['upper_pull', 'core'],
  injury_prevention: ['mobility', 'core'],
  improve_balance_coordination: ['agility', 'core'],
  increase_work_capacity: ['conditioning'],
  improve_recovery: ['mobility'],
  build_endurance_base: ['conditioning'],
  increase_raw_strength: ['upper_push', 'upper_pull', 'lower'],
}

const DURATION_THRESHOLDS: Record<SessionDuration, number> = {
  90: 90,
  60: 75,
  45: 50,
  30: 50,
}

function estimateBlockMinutes(block: ExerciseBlock, restPaddingSeconds: number): number {
  if (typeof block.reps === 'string') {
    const minutesMatch = block.reps.match(/(\d+)\s*min/)
    if (minutesMatch) return Number(minutesMatch[1])
    return Math.round((block.sets * (block.rest_seconds + 30)) / 60) || 10
  }
  return (block.sets * (block.rest_seconds + restPaddingSeconds)) / 60
}

export function estimateSessionDuration(session: WorkoutSession): number {
  let total = 5 // warm-up
  total += 5 // cooldown
  for (const block of session.main_lifts) total += estimateBlockMinutes(block, 45)
  for (const block of session.accessories) total += estimateBlockMinutes(block, 35)
  if (session.conditioning) total += estimateBlockMinutes(session.conditioning, 30)
  return Math.round(total)
}

function injectExtraAccessory(
  session: WorkoutSession,
  goal: SecondaryGoal,
  equipment: Equipment,
  archetype: Archetype,
  experience: ExperienceLevel,
): WorkoutSession {
  const focuses = GOAL_FOCUS_MAP[goal]
  const existingNames = new Set([
    ...session.main_lifts.map((b) => b.name),
    ...session.accessories.map((b) => b.name),
  ])

  const candidates = EXERCISE_LIBRARY.filter(
    (exercise) =>
      focuses.includes(exercise.category) &&
      exercise.equipment.includes(equipment) &&
      exercise.archetypes.includes(archetype) &&
      exercise.phases.includes(session.phase) &&
      !existingNames.has(exercise.name),
  )

  if (candidates.length === 0) return session

  const exercise = candidates[(session.week_number + session.day_number) % candidates.length]
  const extraBlock = prescribe({
    exercise,
    phase: session.phase,
    weekInPhase: session.week_number,
    totalWeeksInPhase: session.week_number,
    experience,
  })

  return {
    ...session,
    accessories: [...session.accessories, extraBlock],
  }
}

function trimSession(session: WorkoutSession, sessionDurationMinutes: SessionDuration): WorkoutSession {
  const threshold = DURATION_THRESHOLDS[sessionDurationMinutes]
  let trimmed = session
  let trimmedAny = false

  while (estimateSessionDuration(trimmed) > threshold && trimmed.accessories.length > 0) {
    trimmed = { ...trimmed, accessories: trimmed.accessories.slice(0, -1) }
    trimmedAny = true
  }

  if (estimateSessionDuration(trimmed) > threshold && trimmed.conditioning) {
    trimmed = { ...trimmed, conditioning: null }
    trimmedAny = true
  }

  if (trimmedAny) {
    const note = `Trimmed to fit your ${sessionDurationMinutes}-minute session length.`
    trimmed = { ...trimmed, notes: [...(trimmed.notes ?? []), note] }
  }

  return trimmed
}

export function applySecondaryGoals(
  sessions: WorkoutSession[],
  secondaryGoals: SecondaryGoal[],
  equipment: Equipment,
  archetype: Archetype,
  experience: ExperienceLevel,
  sessionDurationMinutes: SessionDuration,
): WorkoutSession[] {
  let result = sessions

  if (secondaryGoals.length > 0) {
    result = result.map((session, index) => {
      if (session.phase === 'deload') return session
      // A HYROX Simulation day is the race rehearsal itself — never layer
      // extra accessory work onto it just because a secondary goal is due.
      if (session.hyrox_simulation) return session
      const goal = secondaryGoals[index % secondaryGoals.length]
      return injectExtraAccessory(session, goal, equipment, archetype, experience)
    })
  }

  return result.map((session) => trimSession(session, sessionDurationMinutes))
}
