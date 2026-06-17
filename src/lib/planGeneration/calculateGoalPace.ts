// Riegel formula: T2 = T1 * (D2/D1)^1.06
// Used here to convert a goal time at the user's target event distance
// into equivalent paces at other distances/efforts, and into training zones.

const EVENT_DISTANCES_KM: Record<string, number> = {
  marathon: 42.2,
  half_marathon: 21.1,
  race_15k: 15,
  race_10k: 10,
  race_5k: 5,
}

export interface PaceZones {
  goal_pace_min_per_km: number
  easy_pace_min_per_km: number
  tempo_pace_min_per_km: number
  interval_pace_min_per_km: number
}

export function calculateGoalPace(
  eventType: keyof typeof EVENT_DISTANCES_KM,
  goalTimeMinutes: number,
): PaceZones | null {
  const distance = EVENT_DISTANCES_KM[eventType]
  if (!distance || !goalTimeMinutes) return null

  const goalPace = goalTimeMinutes / distance // min per km at goal effort

  return {
    goal_pace_min_per_km: round2(goalPace),
    // Easy runs: 20-25% slower than goal race pace — aerobic base building,
    // should feel conversational, not race effort.
    easy_pace_min_per_km: round2(goalPace * 1.22),
    // Tempo: 5-8% slower than goal pace — comfortably hard, threshold work.
    tempo_pace_min_per_km: round2(goalPace * 1.065),
    // Intervals: at or slightly faster than goal pace — builds speed reserve
    // above race requirement.
    interval_pace_min_per_km: round2(goalPace * 0.96),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function formatPaceDisplay(minPerKm: number, label: string): string {
  const mins = Math.floor(minPerKm)
  const secs = Math.round((minPerKm - mins) * 60)
  const secsStr = secs.toString().padStart(2, '0')
  return `${mins}:${secsStr}/km (${label})`
}

export const RUNNING_EVENT_TYPES = ['marathon', 'half_marathon', 'race_5k', 'race_10k', 'race_15k'] as const
export type RunningEventType = (typeof RUNNING_EVENT_TYPES)[number]
