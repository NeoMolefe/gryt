import type { Archetype, Equipment, Focus, Phase } from '@/types/plan.types'
import { EXERCISE_LIBRARY, type LibraryExercise, type MovementPattern } from './exerciseLibrary'
import type { SessionTemplate } from './selectSplit'

export interface SelectExercisesInput {
  template: SessionTemplate
  archetype: Archetype
  equipment: Equipment
  phase: Phase
  dayIndex: number
  previousAccessoryNames: string[]
  previousMainLiftNames: string[]
}

export interface SelectedExercises {
  warm_up: LibraryExercise[]
  main_lifts: LibraryExercise[]
  accessories: LibraryExercise[]
  core_stability: LibraryExercise[]
  conditioning: LibraryExercise | null
  cooldown: LibraryExercise[]
}

const CONDITIONING_CATEGORIES = ['conditioning', 'vo2max', 'sprint']

// Supporting strength movements for HYROX Competitor sessions — 3 are picked
// per day from this pool of 6, chosen because each transfers directly to a
// HYROX station pattern (hip hinge → sled pull/deadlift carries, squat →
// wall ball/sled push, single-leg → lunges station), not generic strength
// filler. Tagged by movement pattern so a day never stacks squat-dominant
// AND hinge-dominant work — see selectHyroxExercises for how this combines
// with previousMainLiftNames to avoid same-muscle-group back-to-back days.
const HYROX_SUPPORTING_LIFT_PATTERNS: Record<string, 'squat' | 'hinge'> = {
  'Front Squat': 'squat',
  'Goblet Squat': 'squat',
  'Bulgarian Split Squat': 'squat',
  'Romanian Deadlift': 'hinge',
  'Trap Bar Deadlift': 'hinge',
  'Hip Thrust': 'hinge',
}
const HYROX_SUPPORTING_LIFT_NAMES = Object.keys(HYROX_SUPPORTING_LIFT_PATTERNS)
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

// Picks `count` exercises from `pool`, preferring ones not used the previous
// day (rotated by dayIndex for variety), falling back to repeats only when
// the pool is too small to fully avoid them. Within each tier, exercises
// matching `preferredPattern` (e.g. the opposite of yesterday's dominant
// movement pattern) are ranked first, so squat- and hinge-dominant work
// naturally alternates rather than stacking on consecutive days.
function pickRotatedMainLifts(
  pool: LibraryExercise[],
  dayIndex: number,
  previousNames: string[],
  count: number,
  patternOf?: (exercise: LibraryExercise) => string | undefined,
  preferredPattern?: string | null,
): LibraryExercise[] {
  const rotated = rotate(pool, dayIndex)
  const nonPrevious = rotated.filter((exercise) => !previousNames.includes(exercise.name))
  const previous = rotated.filter((exercise) => previousNames.includes(exercise.name))

  const byPatternPreference = (tier: LibraryExercise[]): LibraryExercise[] => {
    if (!preferredPattern || !patternOf) return tier
    const preferred = tier.filter((exercise) => patternOf(exercise) === preferredPattern)
    const rest = tier.filter((exercise) => patternOf(exercise) !== preferredPattern)
    return [...preferred, ...rest]
  }

  const ordered = [...byPatternPreference(nonPrevious), ...byPatternPreference(previous)]
  return ordered.slice(0, Math.min(count, ordered.length))
}

function dominantPattern(
  names: string[],
  patternMap: Record<string, 'squat' | 'hinge'>,
): 'squat' | 'hinge' | null {
  const patterns = names.map((name) => patternMap[name]).filter((p): p is 'squat' | 'hinge' => p !== undefined)
  const squatCount = patterns.filter((p) => p === 'squat').length
  const hingeCount = patterns.filter((p) => p === 'hinge').length
  if (squatCount === hingeCount) return null
  return squatCount > hingeCount ? 'squat' : 'hinge'
}

function oppositePattern(pattern: 'squat' | 'hinge' | null): 'squat' | 'hinge' | null {
  if (pattern === 'squat') return 'hinge'
  if (pattern === 'hinge') return 'squat'
  return null
}

const CORE_STABILITY_COUNT = 2

// Every session gets 2 dedicated core exercises — drawn from `available`
// (equipment/archetype/phase filtered only, not narrowed by template.focus)
// because core work belongs after strength AND after conditioning days
// alike, not just sessions whose focus happens to list 'core'. rotate() by
// dayIndex over the 6-exercise core pool means a 2-pick window shifts by 2
// positions per day, so Day 1 and Day 3 never see the identical pair.
function selectCoreExercises(
  available: LibraryExercise[],
  dayIndex: number,
  count: number = CORE_STABILITY_COUNT,
): LibraryExercise[] {
  const corePool = available.filter((exercise) => exercise.movement_pattern === 'core')
  return rotate(corePool, dayIndex).slice(0, count)
}

// Issue 1: within a single session, across main_lifts + accessories combined,
// no more than 1 exercise of each squat/hinge/push/pull pattern — stacking
// two heavy lifts of the same pattern (e.g. Front Squat + Romanian Deadlift +
// Conventional Deadlift in one session) is a real same-muscle-group overload
// risk, not just a variety complaint. carry/core/conditioning/other patterns
// are never capped — HYROX station circuits are deliberately tagged that way
// so this never conflicts with Issue 2's station-content requirement.
// main_lifts are prescribed first and always win ties; a conflicting
// accessory is swapped for a non-conflicting replacement where one exists in
// `replacementPool`, otherwise the slot is dropped rather than kept in conflict.
const CAPPED_PATTERNS: ReadonlySet<MovementPattern> = new Set(['squat', 'hinge', 'push', 'pull'])

function enforceMovementPatternLimits(
  mainLifts: LibraryExercise[],
  accessories: LibraryExercise[],
  replacementPool: LibraryExercise[],
): { main_lifts: LibraryExercise[]; accessories: LibraryExercise[] } {
  const claimed = new Set<MovementPattern>()
  const usedNames = new Set<string>()

  const conflicts = (exercise: LibraryExercise): boolean =>
    CAPPED_PATTERNS.has(exercise.movement_pattern) && claimed.has(exercise.movement_pattern)

  const claim = (exercise: LibraryExercise): void => {
    if (CAPPED_PATTERNS.has(exercise.movement_pattern)) claimed.add(exercise.movement_pattern)
    usedNames.add(exercise.name)
  }

  const keptMain: LibraryExercise[] = []
  for (const exercise of mainLifts) {
    if (conflicts(exercise)) continue
    claim(exercise)
    keptMain.push(exercise)
  }

  const keptAccessories: LibraryExercise[] = []
  for (const exercise of accessories) {
    if (!conflicts(exercise)) {
      claim(exercise)
      keptAccessories.push(exercise)
      continue
    }
    const replacement = replacementPool.find((candidate) => !usedNames.has(candidate.name) && !conflicts(candidate))
    if (replacement) {
      claim(replacement)
      keptAccessories.push(replacement)
    }
  }

  return { main_lifts: keptMain, accessories: keptAccessories }
}

// HYROX sessions are structured fundamentally differently from the standard
// strength-first template: running is the primary conditioning block, HYROX
// station exercises (sled push/pull, wall ball, farmers carry, burpee broad
// jump, sandbag lunges, ski erg, rowing) form the main body of the session,
// and traditional main_lifts are limited to a handful of supporting lifts
// that directly transfer to those stations.
function selectHyroxExercises(input: SelectExercisesInput): SelectedExercises {
  const { template, equipment, phase, dayIndex, previousAccessoryNames, previousMainLiftNames } = input
  const archetype: Archetype = 'HYROX Competitor'

  const available = EXERCISE_LIBRARY.filter((exercise) => isAvailable(exercise, equipment, archetype, phase))

  const mobilityPool = available.filter((exercise) => exercise.category === 'mobility')
  const warm_up = rotate(mobilityPool, dayIndex).slice(0, 3)
  const cooldown = rotate(mobilityPool, dayIndex + 3).slice(0, 2)
  const core_stability = selectCoreExercises(available, dayIndex)

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

  const supportingLiftPool = available.filter((exercise) =>
    HYROX_SUPPORTING_LIFT_NAMES.includes(exercise.name),
  )

  // Issue 2: "Stations + Run" sessions are built around the station circuit
  // (accessories) and the run (conditioning) — those are already quad- and
  // posterior-chain-dominant on their own. main_lifts gets at most 1 hinge
  // exercise to prime the posterior chain before stations, never a squat
  // stacked on top of already squat-pattern-heavy station work.
  const isStationsRunSession = template.session_name.includes('Stations + Run')

  let main_lifts: LibraryExercise[]
  if (isStationsRunSession) {
    const hingePool = supportingLiftPool.filter(
      (exercise) => HYROX_SUPPORTING_LIFT_PATTERNS[exercise.name] === 'hinge',
    )
    main_lifts = pickRotatedMainLifts(hingePool, dayIndex, previousMainLiftNames, 1)
  } else {
    // Traditional main_lifts capped at 2-3 supporting strength movements,
    // rotated to avoid yesterday's exact exercises and to alternate
    // squat-dominant / hinge-dominant emphasis day to day.
    const yesterdaysPattern =
      previousMainLiftNames.length === 0
        ? 'hinge'
        : dominantPattern(previousMainLiftNames, HYROX_SUPPORTING_LIFT_PATTERNS)
    const rotatedPicks = pickRotatedMainLifts(
      supportingLiftPool,
      dayIndex,
      previousMainLiftNames,
      MAX_HYROX_SUPPORTING_LIFTS,
      (exercise) => HYROX_SUPPORTING_LIFT_PATTERNS[exercise.name],
      oppositePattern(yesterdaysPattern),
    )
    // Issue 1: even with the squat/hinge alternation above, a single day's
    // picks can still land on 3 of the same pattern (e.g. a pure squat day).
    // Enforce the 1-per-pattern cap here too, swapping in an opposite-pattern
    // replacement from the same pool rather than just dropping the slot.
    // Passed as `accessories` (not `mainLifts`) so every pick — not just the
    // first — is eligible for a non-conflicting replacement.
    const usedNames = new Set(rotatedPicks.map((exercise) => exercise.name))
    const replacementPool = supportingLiftPool.filter((exercise) => !usedNames.has(exercise.name))
    main_lifts = enforceMovementPatternLimits([], rotatedPicks, replacementPool).accessories
  }

  return { warm_up, main_lifts, accessories, core_stability, conditioning, cooldown }
}

export function selectExercises(input: SelectExercisesInput): SelectedExercises {
  if (input.archetype === 'HYROX Competitor') {
    return selectHyroxExercises(input)
  }

  const { template, archetype, equipment, phase, dayIndex, previousAccessoryNames, previousMainLiftNames } = input

  const available = EXERCISE_LIBRARY.filter((exercise) => isAvailable(exercise, equipment, archetype, phase))

  const mobilityPool = available.filter((exercise) => exercise.category === 'mobility')
  const rotatedMobility = rotate(mobilityPool, dayIndex)
  const warm_up = rotatedMobility.slice(0, 3)
  const cooldown = rotate(mobilityPool, dayIndex + 3).slice(0, 2)
  const core_stability = selectCoreExercises(available, dayIndex)

  const focusPool = available.filter((exercise) => template.focus.includes(exercise.category))

  const conditioningCandidates = focusPool.filter((exercise) => CONDITIONING_CATEGORIES.includes(exercise.category))
  // Core exercises get their own dedicated core_stability section above —
  // exclude them here so they never compete for a main_lifts/accessories
  // slot even when template.focus includes 'core' (enforceMovementPatternLimits
  // doesn't cap 'core' since it's never in conflict with squat/hinge/push/pull).
  const nonConditioningPool = focusPool.filter(
    (exercise) => !CONDITIONING_CATEGORIES.includes(exercise.category) && exercise.movement_pattern !== 'core',
  )

  // Prefer exercises not used in yesterday's main_lifts, same exclude-then-
  // fallback pattern already used for accessories below — avoids the same
  // main lift landing on consecutive training days whenever the pool allows it.
  const preferUnused = <T extends LibraryExercise>(list: T[]): T[] => {
    const nonPrevious = list.filter((exercise) => !previousMainLiftNames.includes(exercise.name))
    const previous = list.filter((exercise) => previousMainLiftNames.includes(exercise.name))
    return [...nonPrevious, ...previous]
  }

  // Power/plyometric-focused sessions must contain a matching exercise in main_lifts,
  // even though those exercises are not flagged as compounds.
  const isPowerFocus = (focus: Focus): boolean => focus === 'power' || focus === 'plyometric'
  const hasPowerFocus = template.focus.some(isPowerFocus)
  const powerCandidates = preferUnused(
    rotate(
      nonConditioningPool.filter((exercise) => hasPowerFocus && isPowerFocus(exercise.category)),
      dayIndex,
    ),
  )

  const sortedRest = preferUnused(
    rotate(
      [...nonConditioningPool]
        .filter((exercise) => !(hasPowerFocus && isPowerFocus(exercise.category)))
        .sort((a, b) => Number(b.is_compound) - Number(a.is_compound)),
      dayIndex,
    ),
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

  // Issue 1: cap squat/hinge/push/pull at 1 each across main_lifts + accessories
  // combined. Replacement candidates come from whatever's left in the focus
  // pool once main_lifts and accessories have already claimed their names.
  const selectedNames = new Set([...main_lifts, ...accessories].map((exercise) => exercise.name))
  const replacementPool = nonConditioningPool.filter((exercise) => !selectedNames.has(exercise.name))
  const deduped = enforceMovementPatternLimits(main_lifts, accessories, replacementPool)

  return {
    warm_up,
    main_lifts: deduped.main_lifts,
    accessories: deduped.accessories,
    core_stability,
    conditioning,
    cooldown,
  }
}
