interface ChipProps {
  tone: 'positive' | 'warning'
  children: React.ReactNode
  onDismiss?: () => void
}

export function Chip({ tone, children, onDismiss }: ChipProps) {
  const toneClasses = tone === 'positive' ? 'border-phase-deload/40 bg-phase-deload/10 text-phase-deload' : 'border-phase-peak/40 bg-phase-peak/10 text-phase-peak'

  return (
    <div className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${toneClasses}`}>
      <span>{children}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-xs font-semibold opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  )
}
