import type { MovementPattern } from './exerciseLibrary'
import type { Focus } from '@/types/plan.types'

export interface SlotDefinition {
  pattern: MovementPattern // which movement pattern fills this slot
  focus_filter?: Focus[] // optional: only pick from exercises in these focus categories
  required: boolean // if true and no exercise found, log a warning; if false, skip silently
}

export interface SessionBlueprint {
  // Exact session_name values (after stripping any "(Week Cycle N)" suffix)
  // that trigger this blueprint.
  matches: string[]
  main_lift_slots: SlotDefinition[]
  // Note: accessories, core_stability, conditioning are handled separately and unchanged
}

export const SESSION_BLUEPRINTS: SessionBlueprint[] = [
  // ───────────── PUSH DAY (Bodybuilder PPL split) ─────────────
  // Kept separate from UPPER BODY: a true push/pull/legs split's Push Day
  // must never get a pull exercise injected, which the 4-slot Upper Body
  // blueprint would otherwise do.
  {
    matches: ['Push Day', 'Push Day II'],
    main_lift_slots: [
      { pattern: 'push_horizontal', required: true },
      { pattern: 'push_vertical', required: true },
    ],
  },

  // ───────────── PULL DAY (Bodybuilder PPL split) ─────────────
  {
    matches: ['Pull Day', 'Pull Day II'],
    main_lift_slots: [
      { pattern: 'pull_horizontal', required: true },
      { pattern: 'pull_vertical', required: true },
    ],
  },

  // ───────────── UPPER BODY STRENGTH (all variants) ─────────────
  {
    matches: [
      'Upper Body',
      'Upper Body II',
      'Upper Body III',
      'Upper Body Strength',
      'Upper Body Strength II',
      'Upper Body Strength III',
      'Strength Session II', // hybrid/endurance/athletic-performance upper-focused strength
    ],
    main_lift_slots: [
      { pattern: 'push_horizontal', required: true }, // Bench Press variation
      { pattern: 'pull_horizontal', required: true }, // Row variation
      { pattern: 'push_vertical', required: true }, // Shoulder Press variation
      { pattern: 'pull_vertical', required: true }, // Pulldown/Pull-Up variation
    ],
  },

  // ───────────── LOWER BODY STRENGTH (all variants) ─────────────
  {
    matches: [
      'Lower Body',
      'Lower Body II',
      'Lower Body III',
      'Lower Body Strength',
      'Lower Body Strength II',
      'Lower Body Strength III',
      'Leg Day',
      'Leg Day II',
      'Strength Session', // hybrid/endurance/athletic-performance lower-focused strength
    ],
    main_lift_slots: [
      { pattern: 'squat', required: true }, // Squat variation
      { pattern: 'hinge', required: true }, // Primary hinge (RDL, Deadlift)
      { pattern: 'hinge', required: false }, // Second hinge or glute variation (Hip Thrust, Nordic Curl)
    ],
  },

  // ───────────── FULL BODY ─────────────
  {
    matches: [
      'Full Body',
      'Full Body Strength',
      'Full Body Hybrid',
      'Full Body Finisher',
      'Full Body Burn',
      'Strength Session III', // hybrid performers full body
    ],
    main_lift_slots: [
      { pattern: 'squat', required: true },
      { pattern: 'hinge', required: true },
      { pattern: 'push_horizontal', required: true },
      { pattern: 'pull_horizontal', required: true },
    ],
  },

  // ───────────── CONDITIONING SESSIONS ─────────────
  // These don't need strength blueprints — conditioning selection is unchanged.
  // Explicitly list them so the blueprint system knows to skip them (no main_lift_slots).
  {
    matches: [
      'Conditioning Session',
      'Conditioning Session II',
      'Conditioning Session III',
      'Easy Run',
      'Easy Run II',
      'Tempo Run',
      'Tempo Run II',
      'Long Run',
      'Mobility & Regeneration',
    ],
    main_lift_slots: [], // conditioning sessions: no blueprint-selected main lifts
  },

  // ───────────── ATHLETIC / POWER SESSIONS ─────────────
  {
    matches: ['Power & Explosiveness', 'Full Athletic Circuit'],
    main_lift_slots: [
      { pattern: 'squat', required: true, focus_filter: ['power', 'plyometric', 'lower'] },
      { pattern: 'hinge', required: false, focus_filter: ['power', 'lower'] },
    ],
  },

  // ───────────── HYBRID HYROX STATIONS + RUN ─────────────
  // Already handled by selectHyroxExercises — do NOT add a blueprint here.
  // Leave absent from SESSION_BLUEPRINTS entirely.
]

// Strips the "(Week Cycle N)" suffix that selectSplit.ts appends once a
// plan's availabilityDays exceeds the archetype's 7-template cycle, so a
// session like "Push Day (Week Cycle 2)" still resolves to the same
// blueprint as "Push Day".
function stripWeekCycleSuffix(sessionName: string): string {
  return sessionName.replace(/\s*\(Week Cycle \d+\)$/, '')
}

export function findBlueprint(sessionName: string): SessionBlueprint | null {
  const baseName = stripWeekCycleSuffix(sessionName)
  // Exact match only — substring containment (e.g. via .includes()) would let
  // 'Strength Session' incorrectly catch 'Strength Session III', which the
  // Full Body blueprint above is meant to own instead.
  return SESSION_BLUEPRINTS.find((bp) => bp.matches.includes(baseName)) ?? null
}
