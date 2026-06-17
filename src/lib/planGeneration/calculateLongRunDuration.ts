import type { Phase } from '@/types/plan.types'

export function calculateLongRunDuration(
  eventType: 'marathon' | 'half_marathon',
  phase: Phase,
  weekWithinPhase: number,
  totalWeeksInPhase: number,
  weeksUntilEvent: number,
): number {
  const isMarathon = eventType === 'marathon'
  const progressFraction = totalWeeksInPhase > 1 ? (weekWithinPhase - 1) / (totalWeeksInPhase - 1) : 1

  if (phase === 'foundation') {
    const start = 60
    const end = isMarathon ? 90 : 75
    return Math.round(start + (end - start) * progressFraction)
  }

  if (phase === 'build') {
    const start = isMarathon ? 90 : 75
    const end = isMarathon ? 150 : 110
    return Math.round(start + (end - start) * progressFraction)
  }

  if (phase === 'peak') {
    const peakDuration = isMarathon ? 165 : 105
    // Step down in the final 2-3 weeks before the event regardless of phase
    // week count — the longest run should not be the week immediately
    // before the event.
    if (weeksUntilEvent <= 2) return Math.round(peakDuration * 0.6)
    if (weeksUntilEvent <= 3) return Math.round(peakDuration * 0.8)
    return peakDuration
  }

  // deload / taper
  const peakDuration = isMarathon ? 165 : 105
  return Math.round(peakDuration * 0.45)
}
