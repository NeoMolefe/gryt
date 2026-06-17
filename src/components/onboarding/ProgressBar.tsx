interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (current / total) * 100))

  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        className="h-1.5 w-full overflow-hidden rounded-full bg-elevated"
      >
        <div
          className="h-full rounded-full bg-brand-orange transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-text-muted">
        Step {current} of {total}
      </span>
    </div>
  )
}
