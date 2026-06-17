import { READINESS_COLOR_HEX, readinessColor } from '@/lib/dashboard/readiness'

interface ReadinessRingProps {
  score: number | null
  onCheckIn: () => void
}

const SIZE = 120
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ReadinessRing({ score, onCheckIn }: ReadinessRingProps) {
  if (score === null) {
    return (
      <button
        type="button"
        onClick={onCheckIn}
        className="flex h-[120px] w-[120px] flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-border text-text-secondary transition-colors duration-150 hover:border-brand-orange hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
      >
        <span className="text-2xl">+</span>
        <span className="text-sm font-semibold">Check In</span>
      </button>
    )
  }

  const color = READINESS_COLOR_HEX[readinessColor(score)]
  const offset = CIRCUMFERENCE * (1 - score / 100)

  return (
    <div className="relative flex h-[120px] w-[120px] items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" style={{ stroke: 'var(--color-border)' }} strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-text-primary">{score}</span>
        <span className="text-xs text-text-secondary">Readiness</span>
      </div>
    </div>
  )
}
