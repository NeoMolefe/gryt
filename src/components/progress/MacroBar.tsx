import type { MacroSplit } from '@/lib/progress/nutrition'

interface MacroBarProps {
  split: MacroSplit
}

export function MacroBar({ split }: MacroBarProps) {
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-elevated">
        <div className="h-full bg-brand-orange" style={{ width: `${split.proteinPct}%` }} />
        <div className="h-full bg-phase-foundation" style={{ width: `${split.carbsPct}%` }} />
        <div className="h-full bg-phase-build" style={{ width: `${split.fatPct}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs">
        <span className="flex items-center gap-1.5 text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-brand-orange" /> Protein {split.proteinPct}%
        </span>
        <span className="flex items-center gap-1.5 text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-phase-foundation" /> Carbs {split.carbsPct}%
        </span>
        <span className="flex items-center gap-1.5 text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-phase-build" /> Fat {split.fatPct}%
        </span>
      </div>
    </div>
  )
}
