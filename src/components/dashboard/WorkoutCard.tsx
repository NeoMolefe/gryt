import { Button } from '@/components/Button'
import type { Workout } from '@/types/plan.types'
import { PhaseBadge } from './PhaseBadge'

interface WorkoutCardProps {
  workout: Workout
  onStart: () => void
  isCompleted?: boolean
}

export function WorkoutCard({ workout, onStart, isCompleted = false }: WorkoutCardProps) {
  const exerciseCount =
    workout.main_lifts.length + workout.accessories.length + (workout.conditioning ? 1 : 0)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">{workout.session_name}</h2>
        <PhaseBadge phase={workout.phase} />
      </div>

      <p className="mb-4 text-sm text-text-secondary">
        {exerciseCount} exercises &middot; ~{workout.estimated_duration_minutes} min
      </p>

      {isCompleted ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-elevated p-3.5 text-[15px] font-medium text-text-secondary">
          ✓ Session complete
        </div>
      ) : (
        <Button onClick={onStart}>Start Workout</Button>
      )}
    </div>
  )
}
