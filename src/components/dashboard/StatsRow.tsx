import type { Phase } from '@/types/plan.types'
import type { Badge } from '@/types/dashboard.types'
import { PhaseBadge } from './PhaseBadge'

interface StatsRowProps {
  phase: Phase
  streak: number
  xpTotal: number
  badge: Badge
}

export function StatsRow({ phase, streak, xpTotal, badge }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Phase</p>
        <PhaseBadge phase={phase} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Streak</p>
        <p className="flex items-center gap-1 text-xl font-bold text-text-primary">
          <span aria-hidden>🔥</span>
          {streak}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">XP</p>
        <p className="text-xl font-bold text-text-primary">{xpTotal}</p>
        <p className="truncate text-xs text-text-secondary">{badge.name}</p>
      </div>
    </div>
  )
}
