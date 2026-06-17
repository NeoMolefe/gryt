import type { Phase } from '@/types/plan.types'

export interface PhaseWeekRange {
  phase: Phase
  start_week: number
  end_week: number
  week_count: number
}

export interface EventTimeline {
  total_weeks: number
  phases: PhaseWeekRange[]
  weeks_until_event: number
}

/**
 * Calculates phase boundaries working backward from a fixed event date.
 * Peak phase always ends on the week containing the event.
 * Deload (taper) is the final 1-2 weeks directly before the event.
 * Foundation and Build fill the remaining time proportionally.
 */
export function buildEventTimeline(eventDate: string, today: Date = new Date()): EventTimeline {
  const event = new Date(eventDate)
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksUntilEvent = Math.max(1, Math.ceil((event.getTime() - today.getTime()) / msPerWeek))

  const totalWeeks = weeksUntilEvent

  // Taper/deload: always the final week before the event. If 2+ weeks remain
  // after accounting for a minimum 1-week Foundation and Build, use a 2-week
  // taper for events 10+ weeks out; otherwise a 1-week taper.
  const taperWeeks = totalWeeks >= 10 ? 2 : 1

  const trainingWeeks = Math.max(1, totalWeeks - taperWeeks)

  // Apply existing percentage split (Foundation 30% / Build 40% / Peak 20%)
  // to whatever trainingWeeks exists, then append taper as Deload.
  // Minimum 1 week per phase, regardless of how short the total is —
  // this satisfies "compress proportionally even if very short."
  const foundationWeeks = Math.max(1, Math.round(trainingWeeks * 0.3))
  const peakWeeks = Math.max(1, Math.round(trainingWeeks * 0.2))
  const buildWeeks = Math.max(1, trainingWeeks - foundationWeeks - peakWeeks)

  let cursor = 1
  const phases: PhaseWeekRange[] = []

  phases.push({ phase: 'foundation', start_week: cursor, end_week: cursor + foundationWeeks - 1, week_count: foundationWeeks })
  cursor += foundationWeeks

  phases.push({ phase: 'build', start_week: cursor, end_week: cursor + buildWeeks - 1, week_count: buildWeeks })
  cursor += buildWeeks

  phases.push({ phase: 'peak', start_week: cursor, end_week: cursor + peakWeeks - 1, week_count: peakWeeks })
  cursor += peakWeeks

  phases.push({ phase: 'deload', start_week: cursor, end_week: cursor + taperWeeks - 1, week_count: taperWeeks })
  cursor += taperWeeks

  // Reconcile rounding drift: if the sum of phase weeks doesn't exactly equal
  // totalWeeks due to Math.round, adjust the Build phase (the largest, most
  // forgiving block) by the difference rather than leaving a gap or overlap.
  const computedTotal = cursor - 1
  const drift = totalWeeks - computedTotal
  if (drift !== 0) {
    const buildPhase = phases.find((p) => p.phase === 'build')!
    buildPhase.end_week += drift
    buildPhase.week_count += drift
    // Shift every phase after Build by the same drift so there's no gap
    const peakPhase = phases.find((p) => p.phase === 'peak')!
    const deloadPhase = phases.find((p) => p.phase === 'deload')!
    peakPhase.start_week += drift
    peakPhase.end_week += drift
    deloadPhase.start_week += drift
    deloadPhase.end_week += drift
  }

  return { total_weeks: totalWeeks, phases, weeks_until_event: weeksUntilEvent }
}
