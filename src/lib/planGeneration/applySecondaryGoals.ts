import type { Archetype, Equipment, ExerciseBlock, Focus, WorkoutSession } from '@/types/plan.types'
import type { ExperienceLevel, SecondaryGoal, SessionDuration } from '@/types/onboarding'
import { EXERCISE_LIBRARY } from './exerciseLibrary'
import { prescribe } from './prescribe'

interface SecondaryGoalConfig {
  inject_focuses: Focus[]
  extra_sets?: number
  inject_count?: number
}

const GOAL_CONFIG_MAP: Record<SecondaryGoal, SecondaryGoalConfig> = {
  improve_athleticism: { inject_focuses: ['agility', 'plyometric'], inject_count: 2 },
  increase_explosiveness: { inject_focuses: ['power', 'plyometric'], inject_count: 2 },
  improve_mobility_flexibility: { inject_focuses: ['mobility'], inject_count: 1 },
  build_mental_toughness: { inject_focuses: ['conditioning'], extra_sets: 1, inject_count: 1 },
  improve_cardio_base: { inject_focuses: ['conditioning'], inject_count: 2 },
  lose_body_fat: { inject_focuses: ['conditioning'], inject_count: 2 },
  build_muscle: { inject_focuses: ['upper_push', 'upper_pull', 'lower'], extra_sets: 1, inject_count: 2 },
  improve_body_composition: { inject_focuses: ['conditioning', 'lower'], inject_count: 2 },
  improve_core_strength: { inject_focuses: ['core'], inject_count: 2 },
  improve_posture: { inject_focuses: ['upper_pull', 'core'], inject_count: 2 },
  injury_prevention: { inject_focuses: ['mobility', 'core'], inject_count: 2 },
  improve_balance_coordination: { inject_focuses: ['agility', 'core'], inject_count: 2 },
  increase_work_capacity: { inject_focuses: ['conditioning'], extra_sets: 1, inject_count: 1 },
  improve_recovery: { inject_focuses: ['mobility'], inject_count: 2 },
  build_endurance_base: { inject_focuses: ['conditioning'], inject_count: 2 },
  increase_raw_strength: { inject_focuses: ['lower', 'upper_push', 'upper_pull'], extra_sets: 1, inject_count: 1 },
}

const EXPERIENCE_LEVEL_RANK: Record<ExperienceLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
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

function injectSecondaryGoalWork(
  session: WorkoutSession,
  goal: SecondaryGoal,
  equipment: Equipment,
  archetype: Archetype,
  experience: ExperienceLevel,
): WorkoutSession {
  const config = GOAL_CONFIG_MAP[goal]
  const injectCount = config.inject_count ?? 1

  const usedNames = new Set([
    ...session.main_lifts.map((b) => b.name),
    ...session.accessories.map((b) => b.name),
  ])

  const candidates = EXERCISE_LIBRARY.filter(
    (exercise) =>
      config.inject_focuses.includes(exercise.category) &&
      exercise.equipment.includes(equipment) &&
      exercise.archetypes.includes(archetype) &&
      exercise.phases.includes(session.phase) &&
      // Core exercises have their own dedicated core_stability section —
      // never inject one into main_lifts/accessories, even when a secondary
      // goal (e.g. improve_core_strength) maps to the 'core' focus category.
      exercise.movement_pattern !== 'core' &&
      (!exercise.min_experience || EXPERIENCE_LEVEL_RANK[experience] >= EXPERIENCE_LEVEL_RANK[exercise.min_experience]),
  )

  const injectedBlocks: ExerciseBlock[] = []
  for (let i = 0; i < injectCount; i++) {
    const pool = candidates.filter((exercise) => !usedNames.has(exercise.name))
    if (pool.length === 0) break
    // Different offset per injected exercise (the `+ i`) so a 2-injection
    // goal doesn't just pick the same "first in rotation" exercise twice.
    const offset = session.week_number + session.day_number + i
    const exercise = pool[offset % pool.length]
    usedNames.add(exercise.name)
    injectedBlocks.push(
      prescribe({
        exercise,
        phase: session.phase,
        weekInPhase: session.week_number,
        totalWeeksInPhase: session.week_number,
        experience,
      }),
    )
  }

  const main_lifts = config.extra_sets
    ? session.main_lifts.map((block) => ({ ...block, sets: block.sets + config.extra_sets! }))
    : session.main_lifts

  return {
    ...session,
    main_lifts,
    accessories: [...session.accessories, ...injectedBlocks],
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
      return injectSecondaryGoalWork(session, goal, equipment, archetype, experience)
    })
  }

  return result.map((session) => trimSession(session, sessionDurationMinutes))
}
