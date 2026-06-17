import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TrainingLoadPoint } from '@/types/progress.types'

interface TrainingLoadChartProps {
  data: TrainingLoadPoint[]
}

export function TrainingLoadChart({ data }: TrainingLoadChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-text-secondary">No training load data yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="week" tickFormatter={(week) => `W${week}`} stroke="var(--color-text-secondary)" fontSize={11} />
        <YAxis stroke="var(--color-text-secondary)" fontSize={11} />
        <Tooltip
          contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8 }}
          labelStyle={{ color: 'var(--color-text-primary)' }}
          labelFormatter={(week) => `Week ${week}`}
          formatter={(value) => [`${value} kg`, 'Load']}
        />
        <Bar dataKey="load" fill="#FF5C1A" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
