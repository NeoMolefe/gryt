import { Button } from '@/components/Button'
import type { WorkoutAdaptation } from '@/lib/kwazi/workoutAdaptation'

interface WorkoutAdaptationCardProps {
  adaptation: WorkoutAdaptation
  onApply: () => void
  onKeepOriginal: () => void
}

export function WorkoutAdaptationCard({ adaptation, onApply, onKeepOriginal }: WorkoutAdaptationCardProps) {
  return (
    <div className="mt-2 flex w-full max-w-[85%] flex-col gap-3 rounded-2xl border border-border bg-elevated p-4">
      <p className="text-sm font-semibold text-text-primary">💪 Session adapted for today</p>
      <p className="text-sm text-text-secondary">{adaptation.reason}</p>
      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1">
          Apply to today&apos;s session
        </Button>
        <Button variant="outline" onClick={onKeepOriginal} className="flex-1">
          Keep original
        </Button>
      </div>
    </div>
  )
}
