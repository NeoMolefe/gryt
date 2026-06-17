import { Button } from '@/components/Button'
import type { Phase } from '@/types/plan.types'
import type { MobilityRoutine } from '@/types/dashboard.types'
import { phaseDotClass, phaseTextClass } from '@/lib/dashboard/phaseStyles'

interface RestDayCardProps {
  phase: Phase
  routine: MobilityRoutine
  recoveryTip: string
  onStart: () => void
}

export function RestDayCard({ phase, routine, recoveryTip, onStart }: RestDayCardProps) {
  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className={`mb-1 text-sm font-bold tracking-widest ${phaseTextClass(phase)}`}>REST DAY</p>
        <p className="mb-4 text-text-secondary">Recovery is where progress is made.</p>

        <h3 className="mb-2 font-semibold text-text-primary">{routine.name}</h3>
        <ul className="mb-4 space-y-1">
          {routine.exercises.map((exercise) => (
            <li key={exercise.name} className="flex items-center justify-between text-sm text-text-secondary">
              <span className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${phaseDotClass(phase)}`} />
                {exercise.name}
              </span>
              <span>{exercise.duration_minutes} min</span>
            </li>
          ))}
        </ul>

        <Button onClick={onStart}>Start Mobility Session</Button>
      </div>

      <p className="mt-3 px-1 text-sm text-text-secondary">{recoveryTip}</p>
    </div>
  )
}
