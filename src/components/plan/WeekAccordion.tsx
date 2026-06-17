import { ChevronDown } from 'lucide-react'
import type { Workout } from '@/types/plan.types'
import type { InjuryFlag } from '@/types/profile'
import { DayCard } from './DayCard'

export interface WeekGroup {
  weekNumber: number
  workouts: Workout[]
}

interface WeekAccordionProps {
  weeks: WeekGroup[]
  expandedWeek: number | null
  expandedDayId: string | null
  eventBadgeLabel: string | null
  injuryFlags?: InjuryFlag[] | null
  onToggleWeek: (weekNumber: number) => void
  onToggleDay: (workoutId: string) => void
  onStart: (workout: Workout) => void
}

export function WeekAccordion({
  weeks,
  expandedWeek,
  expandedDayId,
  eventBadgeLabel,
  injuryFlags,
  onToggleWeek,
  onToggleDay,
  onStart,
}: WeekAccordionProps) {
  return (
    <div className="space-y-3">
      {weeks.map((week) => {
        const isExpanded = expandedWeek === week.weekNumber

        return (
          <div key={week.weekNumber} className="rounded-2xl border border-border bg-card">
            <button
              type="button"
              onClick={() => onToggleWeek(week.weekNumber)}
              className="flex w-full items-center justify-between p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
            >
              <span className="font-semibold text-text-primary">Week {week.weekNumber}</span>
              <ChevronDown className={`text-text-secondary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
              <div className="space-y-3 border-t border-border p-4">
                {week.workouts.map((workout) => (
                  <DayCard
                    key={workout.id}
                    workout={workout}
                    eventBadgeLabel={eventBadgeLabel}
                    injuryFlags={injuryFlags}
                    isExpanded={expandedDayId === workout.id}
                    onToggle={() => onToggleDay(workout.id)}
                    onStart={() => onStart(workout)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
