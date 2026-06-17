import { AthleticRadarChart } from '@/components/progress/charts/AthleticRadarChart'
import { ConsistencyHeatmap } from '@/components/progress/charts/ConsistencyHeatmap'
import { ReadinessTrendChart } from '@/components/progress/charts/ReadinessTrendChart'
import { TrainingLoadChart } from '@/components/progress/charts/TrainingLoadChart'
import type { AthleticProfilePoint, HeatmapDay, ReadinessTrendPoint, TrainingLoadPoint } from '@/types/progress.types'

interface AnalyticsSectionProps {
  readiness: ReadinessTrendPoint[]
  trainingLoad: TrainingLoadPoint[]
  heatmap: HeatmapDay[][]
  profile: AthleticProfilePoint[]
}

export function AnalyticsSection({ readiness, trainingLoad, heatmap, profile }: AnalyticsSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-lg font-semibold text-text-primary">Readiness Trend</h2>
        <p className="mb-2 text-xs text-text-secondary">Last 14 days</p>
        <ReadinessTrendChart data={readiness} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-lg font-semibold text-text-primary">Training Load</h2>
        <p className="mb-2 text-xs text-text-secondary">Total volume (kg) by plan week</p>
        <TrainingLoadChart data={trainingLoad} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-lg font-semibold text-text-primary">Consistency</h2>
        <p className="mb-2 text-xs text-text-secondary">Last 12 weeks</p>
        <ConsistencyHeatmap weeks={heatmap} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-lg font-semibold text-text-primary">Athletic Profile</h2>
        <p className="mb-2 text-xs text-text-secondary">Derived from your training history</p>
        <AthleticRadarChart data={profile} />
      </div>
    </div>
  )
}
