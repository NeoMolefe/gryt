import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import type { AthleticProfilePoint } from '@/types/progress.types'

interface AthleticRadarChartProps {
  data: AthleticProfilePoint[]
}

export function AthleticRadarChart({ data }: AthleticRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis dataKey="axis" stroke="var(--color-text-secondary)" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
        <Radar dataKey="value" stroke="#FF5C1A" fill="#FF5C1A" fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
