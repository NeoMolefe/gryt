import type { Archetype, Equipment, ExerciseBlock, Focus, WorkoutSession } from '@/types/plan.types'
import type { ExperienceLevel, SecondaryGoal, SessionDuration } from '@/types/onboarding'
import { EXERCISE_LIBRARY } from './exerciseLibrary'
import { prescribe } from './prescribe'
import { findBlueprint } from './sessionBlueprints'
import { CONDITIONING_CATEGORIES } from './selectExercises'

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
  improve_core_strength: { inject_focuses: ['core'], inject_count: 2 }, // both injections go to core_stability
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
    ...(session.core_stability ?? []).map((b) => b.name),
  ])

  const isExperienceEligible = (exercise: { min_experience?: ExperienceLevel }) =>
    !exercise.min_experience || EXPERIENCE_LEVEL_RANK[experience] >= EXPERIENCE_LEVEL_RANK[exercise.min_experience]

  const matchesBaseFilters = (exercise: (typeof EXERCISE_LIBRARY)[number]) =>
    config.inject_focuses.includes(exercise.category) &&
    exercise.equipment.includes(equipment) &&
    exercise.archetypes.includes(archetype) &&
    exercise.phases.includes(session.phase) &&
    isExperienceEligible(exercise)

  // Non-core, non-conditioning candidates go to accessories (existing
  // behavior). Conditioning exercises (e.g. Run Zone 2 40min) must never
  // land here — they belong in the dedicated conditioning field only.
  const nonCoreCandidates = EXERCISE_LIBRARY.filter(
    (exercise) =>
      matchesBaseFilters(exercise) &&
      exercise.movement_pattern !== 'core' &&
      exercise.movement_pattern !== 'conditioning' &&
      !CONDITIONING_CATEGORIES.includes(exercise.category),
  )

  // Core candidates go to core_stability instead — goals like
  // improve_core_strength/improve_posture/injury_prevention/
  // improve_balance_coordination list 'core' in inject_focuses specifically
  // to land here, not in accessories.
  const coreCandidates = EXERCISE_LIBRARY.filter(
    (exercise) => matchesBaseFilters(exercise) && exercise.movement_pattern === 'core',
  )

  // Conditioning candidates go to the session's single conditioning slot —
  // goals like improve_cardio_base/lose_body_fat/improve_body_composition/
  // build_endurance_base/build_mental_toughness/increase_work_capacity list
  // 'conditioning' in inject_focuses specifically to land here, not in
  // accessories. Only relevant if the goal targets 'conditioning' at all.
  const conditioningCandidates = config.inject_focuses.includes('conditioning')
    ? EXERCISE_LIBRARY.filter((exercise) => matchesBaseFilters(exercise) && CONDITIONING_CATEGORIES.includes(exercise.category))
    : []

  const accessoryInjected: ExerciseBlock[] = []
  const coreInjected: ExerciseBlock[] = []
  let conditioningInjected: ExerciseBlock | null = null

  const buildBlock = (exercise: (typeof nonCoreCandidates)[number]): ExerciseBlock =>
    prescribe({
      exercise,
      phase: session.phase,
      weekInPhase: session.week_number,
      totalWeeksInPhase: session.week_number,
      experience,
    })

  const pickFrom = (pool: typeof nonCoreCandidates, offsetBase: number) => {
    const candidates = pool.filter((exercise) => !usedNames.has(exercise.name))
    if (candidates.length === 0) return null
    // Different offset per pick (the running `injected` count) so a
    // multi-injection goal doesn't just pick the same "first in rotation"
    // exercise twice.
    const offset = session.week_number + session.day_number + offsetBase
    return candidates[offset % candidates.length]
  }

  let injected = 0

  // Conditioning gets first claim on one injection slot, if this goal
  // targets 'conditioning' and the session doesn't already have one — the
  // field holds a single exercise, so an already-populated conditioning slot
  // is left untouched rather than overwritten. Goals whose only focus is
  // 'conditioning' (e.g. improve_cardio_base, inject_count: 2) will have
  // leftover slots after this with nowhere left to go — that's expected
  // graceful degradation, not a bug.
  if (conditioningCandidates.length > 0 && session.conditioning === null) {
    const exercise = pickFrom(conditioningCandidates, injected)
    if (exercise) {
      usedNames.add(exercise.name)
      conditioningInjected = buildBlock(exercise)
      injected += 1
    }
  }

  // Alternate non-core/core by injection slot rather than draining one pool
  // before the other — a goal like improve_posture (['upper_pull', 'core'])
  // has plenty of upper_pull candidates, so draining non-core first would
  // consume the entire injectCount before ever reaching the core pool. For a
  // single-focus goal (e.g. improve_core_strength: ['core']) the non-core
  // pool is empty by construction, so every slot falls through to core
  // regardless of alternation — both still land in core_stability as intended.
  while (injected < injectCount) {
    const preferCore = injected % 2 === 1
    const primary = preferCore ? coreCandidates : nonCoreCandidates
    const secondary = preferCore ? nonCoreCandidates : coreCandidates

    let exercise = pickFrom(primary, injected)
    let isCore = preferCore
    if (!exercise) {
      exercise = pickFrom(secondary, injected)
      isCore = !preferCore
    }
    if (!exercise) break

    usedNames.add(exercise.name)
    const block = buildBlock(exercise)
    if (isCore) {
      coreInjected.push(block)
    } else {
      accessoryInjected.push(block)
    }
    injected += 1
  }

  const main_lifts = config.extra_sets
    ? session.main_lifts.map((block) => ({ ...block, sets: block.sets + config.extra_sets! }))
    : session.main_lifts

  // Blueprint sessions are already complete with 4 main lifts (2 for Push/Pull
  // Day) — stacking baseline accessories on top of injected secondary goal
  // work would make the session too long. Cap total accessories at 3,
  // letting injected goal work replace baseline accessories rather than
  // stack on top (injected exercises are the ones the user explicitly opted
  // into via their secondary goal, so they take priority over the generic
  // baseline picks). Only accessoryInjected counts here — core_stability is a
  // separate section, not part of this cap.
  const isBlueprintSession = Boolean(findBlueprint(session.session_name)?.main_lift_slots.length)
  const accessories =
    isBlueprintSession && accessoryInjected.length > 0
      ? [...session.accessories.slice(0, Math.max(0, 3 - accessoryInjected.length)), ...accessoryInjected]
      : [...session.accessories, ...accessoryInjected]

  return {
    ...session,
    main_lifts,
    accessories,
    core_stability: [...(session.core_stability ?? []), ...coreInjected],
    conditioning: conditioningInjected ?? session.conditioning,
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
