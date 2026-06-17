import type { ScheduleDay } from '@/lib/dashboard/schedule'
import { phaseDotClass } from '@/lib/dashboard/phaseStyles'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function abbreviate(name: string): string {
  return name
    .split(' ')
    .map((word) => word.slice(0, 3))
    .join(' ')
}

interface WeeklyScheduleStripProps {
  days: ScheduleDay[]
  onSelectDay: (day: ScheduleDay) => void
}

export function WeeklyScheduleStrip({ days, onSelectDay }: WeeklyScheduleStripProps) {
  return (
    <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
      {days.map((day) => {
        const label = day.isRestDay ? 'Rest' : day.workout ? abbreviate(day.workout.session_name) : '—'
        const phase = day.workout?.phase ?? null

        return (
          <button
            key={day.date.toISOString()}
            type="button"
            onClick={() => onSelectDay(day)}
            className={`flex min-w-[64px] flex-col items-center gap-1 rounded-xl border px-3 py-2 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
              day.isToday
                ? 'border-brand-orange bg-brand-orange/10'
                : 'border-border bg-elevated'
            }`}
          >
            <span className="text-xs font-semibold text-text-secondary">{DAY_LABELS[day.date.getDay()]}</span>
            <span className="text-xs text-text-primary">{label}</span>
            {phase && <span className={`mt-1 h-1.5 w-1.5 rounded-full ${phaseDotClass(phase)}`} />}
          </button>
        )
      })}
    </div>
  )
}
