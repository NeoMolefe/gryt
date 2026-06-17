import type { Phase } from '@/types/plan.types'

export interface PhaseBlock {
  phase: Phase
  weeks: number
}

export interface PlanStructure {
  totalWeeks: number
  phases: PhaseBlock[]
}

export function buildStructure(availabilityDays: number): PlanStructure {
  const totalWeeks = availabilityDays >= 6 ? 12 : availabilityDays >= 4 ? 10 : 8

  const foundationWeeks = Math.round(totalWeeks * 0.3)
  const buildWeeks = Math.round(totalWeeks * 0.4)
  const peakWeeks = Math.round(totalWeeks * 0.2)
  const deloadWeeks = Math.max(1, totalWeeks - foundationWeeks - buildWeeks - peakWeeks)

  return {
    totalWeeks,
    phases: [
      { phase: 'foundation', weeks: foundationWeeks },
      { phase: 'build', weeks: buildWeeks },
      { phase: 'peak', weeks: peakWeeks },
      { phase: 'deload', weeks: deloadWeeks },
    ],
  }
}

export interface ExpandedWeek {
  week_number: number
  phase: Phase
  weekInPhase: number
  totalWeeksInPhase: number
}

export function expandPhases(structure: PlanStructure): ExpandedWeek[] {
  const weeks: ExpandedWeek[] = []
  let weekNumber = 1
  for (const block of structure.phases) {
    for (let i = 0; i < block.weeks; i++) {
      weeks.push({
        week_number: weekNumber,
        phase: block.phase,
        weekInPhase: i + 1,
        totalWeeksInPhase: block.weeks,
      })
      weekNumber += 1
    }
  }
  return weeks
}
