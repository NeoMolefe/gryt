import type { ExerciseBlock, WorkoutSession } from '@/types/plan.types'

export type ReadinessAdaptation =
  | { type: 'none' }
  | { type: 'reduced_volume' }
  | { type: 'recovery_substitution' }
  | { type: 'rest_recommended' }

type RecoverySessionContent = Pick<
  WorkoutSession,
  'session_name' | 'warm_up' | 'main_lifts' | 'accessories' | 'core_stability' | 'conditioning' | 'cooldown'
>

// Hardcoded — never generated via AI or the plan generator. This is the
// session substituted in when a readiness score signals the body needs
// recovery, not more training load.
export const RECOVERY_SESSION_CONTENT: RecoverySessionContent = {
  session_name: 'Recovery Session',
  warm_up: [
    {
      name: "World's Greatest Stretch",
      sets: 2,
      reps: '5 each side',
      rest_seconds: 0,
      rpe_target: 5,
      load_guidance: 'Bodyweight only',
      coaching_cues: ['Move slowly and breathe into each position'],
    },
    {
      name: 'Hip 90/90',
      sets: 2,
      reps: '8 each side',
      rest_seconds: 0,
      rpe_target: 5,
      load_guidance: 'Bodyweight only',
      coaching_cues: ['Feel the stretch, no forcing'],
    },
  ],
  main_lifts: [],
  accessories: [],
  core_stability: [
    {
      name: 'Dead Bug',
      sets: 2,
      reps: 12,
      rest_seconds: 30,
      rpe_target: 5,
      load_guidance: 'Bodyweight only',
      coaching_cues: ['Slow and controlled, breathe out on the movement'],
    },
    {
      name: 'Cat-Cow',
      sets: 2,
      reps: 10,
      rest_seconds: 0,
      rpe_target: 4,
      load_guidance: 'Bodyweight only',
      coaching_cues: ['Match movement to breath'],
    },
  ],
  conditioning: null,
  cooldown: [
    {
      name: 'Leg Swing',
      sets: 1,
      reps: '10 each leg',
      rest_seconds: 0,
      rpe_target: 4,
      load_guidance: 'Bodyweight only',
      coaching_cues: ['Relaxed, pendulum-style swings'],
    },
    {
      name: 'Arm Circle',
      sets: 1,
      reps: 12,
      rest_seconds: 0,
      rpe_target: 4,
      load_guidance: 'Bodyweight only',
      coaching_cues: ['Full range, both directions'],
    },
    {
      name: 'Inchworm',
      sets: 1,
      reps: 8,
      rest_seconds: 0,
      rpe_target: 5,
      load_guidance: 'Bodyweight only',
      coaching_cues: ['Walk hands out slowly, feel the hamstrings'],
    },
  ],
}

function reduceBlock(block: ExerciseBlock, reduceRpe: boolean): ExerciseBlock {
  return {
    ...block,
    sets: Math.max(1, block.sets - 1),
    rpe_target: reduceRpe ? Math.max(5, block.rpe_target - 1) : block.rpe_target,
  }
}

function reduceVolume<T extends WorkoutSession>(session: T): T {
  return {
    ...session,
    main_lifts: session.main_lifts.map((block) => reduceBlock(block, true)),
    accessories: session.accessories.map((block) => reduceBlock(block, false)),
    // core_stability, conditioning, warm_up, cooldown unchanged — core work
    // and cardio prescription stay the same on a reduced-load day.
  }
}

/**
 * Computes a readiness-adapted version of today's session. Never writes
 * anything to Supabase — the returned session is for runtime rendering only.
 * Caller is responsible for persisting/respecting an override choice.
 */
export function adaptSessionForReadiness<T extends WorkoutSession>(
  session: T,
  readinessScore: number | null,
): { adaptedSession: T; adaptation: ReadinessAdaptation } {
  if (readinessScore === null || readinessScore >= 80) {
    return { adaptedSession: session, adaptation: { type: 'none' } }
  }
  if (readinessScore >= 60) {
    return { adaptedSession: reduceVolume(session), adaptation: { type: 'reduced_volume' } }
  }
  if (readinessScore >= 40) {
    return {
      adaptedSession: { ...session, ...RECOVERY_SESSION_CONTENT, hyrox_simulation: null },
      adaptation: { type: 'recovery_substitution' },
    }
  }
  // rest_recommended: the returned session is the unmodified original —
  // whether it's actually shown is gated entirely in the UI (deliberate
  // friction before revealing it), not by changing the data here.
  return { adaptedSession: session, adaptation: { type: 'rest_recommended' } }
}
