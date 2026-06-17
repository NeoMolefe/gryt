import { HistoryCard } from '@/components/progress/HistoryCard'
import type { SessionHistoryEntry } from '@/types/progress.types'

interface HistorySectionProps {
  entries: SessionHistoryEntry[]
}

export function HistorySection({ entries }: HistorySectionProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-text-secondary">No completed workouts yet. Complete your first session to see your history here.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <HistoryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
