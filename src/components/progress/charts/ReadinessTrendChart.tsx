import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ReadinessTrendPoint } from '@/types/progress.types'

interface ReadinessTrendChartProps {
  data: ReadinessTrendPoint[]
}

function formatDay(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString([], { day: 'numeric', month: 'short' })
}

export function ReadinessTrendChart({ data }: ReadinessTrendChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-text-secondary">No readiness check-ins yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDay} stroke="var(--color-text-secondary)" fontSize={11} />
        <YAxis domain={[0, 100]} stroke="var(--color-text-secondary)" fontSize={11} />
        <Tooltip
          contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8 }}
          labelStyle={{ color: 'var(--color-text-primary)' }}
          labelFormatter={(value) => formatDay(value as string)}
        />
        <Line type="monotone" dataKey="score" stroke="#FF5C1A" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
