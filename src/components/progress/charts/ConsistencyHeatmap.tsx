import type { HeatmapDay } from '@/types/progress.types'

interface ConsistencyHeatmapProps {
  weeks: HeatmapDay[][]
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ConsistencyHeatmap({ weeks }: ConsistencyHeatmapProps) {
  return (
    <div className="flex flex-col gap-1">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              title={`${formatDate(day.date)}${day.active ? ' — trained' : ''}`}
              className={`h-3 flex-1 rounded-sm ${day.active ? 'bg-brand-orange' : 'bg-elevated'}`}
            />
          ))}
        </div>
      ))}
      <div className="mt-2 flex items-center justify-end gap-2 text-xs text-text-muted">
        <span className="h-3 w-3 rounded-sm bg-elevated" /> No session
        <span className="ml-2 h-3 w-3 rounded-sm bg-brand-orange" /> Trained
      </div>
    </div>
  )
}
