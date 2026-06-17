import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PhaseBadge } from '@/components/dashboard/PhaseBadge'
import { RPE_COLOR_TEXT_CLASS, rpeColor } from '@/lib/progress/rpe'
import type { SessionHistoryEntry } from '@/types/progress.types'

interface HistoryCardProps {
  entry: SessionHistoryEntry
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
}

export function HistoryCard({ entry }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const completionPct = Math.round(entry.completionRate * 100)
  const avgRpeClass = RPE_COLOR_TEXT_CLASS[rpeColor(entry.averageRpe)]

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button type="button" onClick={() => setExpanded((e) => !e)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-text-primary">{entry.sessionName}</p>
            <PhaseBadge phase={entry.phase} />
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            {formatDate(entry.date)} · Week {entry.weekNumber}, Day {entry.dayNumber}
            {entry.planLabel && <span className="text-text-muted"> · {entry.planLabel}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-text-primary">{completionPct}%</p>
            <p className="text-xs text-text-secondary">complete</p>
          </div>
          <ChevronDown size={18} className={`text-text-secondary transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Best sets</p>
          <ul className="space-y-1">
            {entry.bestSets.map((set) => (
              <li key={set.exerciseName} className="text-sm text-text-primary">
                {set.exerciseName}: {set.weightKg}kg × {set.reps} reps @ RPE {set.rpe}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <span className="text-text-secondary">Average RPE: </span>
            <span className={`font-semibold ${avgRpeClass}`}>{entry.averageRpe.toFixed(1)}</span>
          </p>
        </div>
      )}
    </div>
  )
}
