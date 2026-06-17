import type { ScheduleDay } from '@/lib/dashboard/schedule'
import { PhaseBadge } from './PhaseBadge'
import { BottomSheet } from './BottomSheet'

interface SessionPreviewSheetProps {
  day: ScheduleDay | null
  onClose: () => void
}

export function SessionPreviewSheet({ day, onClose }: SessionPreviewSheetProps) {
  if (!day) {
    return null
  }

  if (day.isRestDay || !day.workout) {
    return (
      <BottomSheet isOpen onClose={onClose} title="Rest Day">
        <p className="text-text-secondary">Recovery is where progress is made.</p>
      </BottomSheet>
    )
  }

  const { workout } = day

  return (
    <BottomSheet isOpen onClose={onClose} title={workout.session_name}>
      <div className="mb-4 flex items-center gap-2">
        <PhaseBadge phase={workout.phase} />
        <span className="text-sm text-text-secondary">~{workout.estimated_duration_minutes} min</span>
      </div>

      <div className="max-h-[50vh] space-y-4 overflow-y-auto">
        {workout.main_lifts.length > 0 && (
          <section>
            <h3 className="mb-1 text-sm font-semibold text-text-secondary">Main Lifts</h3>
            <ul className="space-y-1">
              {workout.main_lifts.map((block) => (
                <li key={block.name} className="text-sm text-text-primary">
                  {block.name} — {block.sets} × {block.reps}
                </li>
              ))}
            </ul>
          </section>
        )}

        {workout.accessories.length > 0 && (
          <section>
            <h3 className="mb-1 text-sm font-semibold text-text-secondary">Accessories</h3>
            <ul className="space-y-1">
              {workout.accessories.map((block) => (
                <li key={block.name} className="text-sm text-text-primary">
                  {block.name} — {block.sets} × {block.reps}
                </li>
              ))}
            </ul>
          </section>
        )}

        {workout.conditioning && (
          <section>
            <h3 className="mb-1 text-sm font-semibold text-text-secondary">Conditioning</h3>
            <p className="text-sm text-text-primary">
              {workout.conditioning.name} — {workout.conditioning.sets} × {workout.conditioning.reps}
            </p>
          </section>
        )}
      </div>
    </BottomSheet>
  )
}
