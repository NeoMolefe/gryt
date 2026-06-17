import { AlertTriangle } from 'lucide-react'
import type { ExerciseBlock } from '@/types/plan.types'
import type { InjuryFlag } from '@/types/profile'

interface ExerciseBlockRowProps {
  block: ExerciseBlock
  injuryFlags?: InjuryFlag[]
}

export function ExerciseBlockRow({ block, injuryFlags = [] }: ExerciseBlockRowProps) {
  return (
    <li className="rounded-xl bg-elevated p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-text-primary">{block.name}</span>
        <span className="text-sm text-text-secondary">
          {block.sets} × {block.reps}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        <span>{block.load_guidance}</span>
        <span>RPE {block.rpe_target}</span>
        <span>Rest {block.rest_seconds}s</span>
      </div>
      {injuryFlags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {injuryFlags.map((flag) => (
            <span
              key={flag.bodyArea}
              className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-500"
            >
              <AlertTriangle size={12} />
              May aggravate {flag.bodyArea.toLowerCase()} ({flag.severity.toLowerCase()})
            </span>
          ))}
        </div>
      )}
    </li>
  )
}
