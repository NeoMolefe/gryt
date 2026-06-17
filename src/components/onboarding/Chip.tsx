interface ChipProps {
  label: string
  subtitle?: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

export function Chip({ label, subtitle, selected, onClick, disabled }: ChipProps) {
  if (subtitle) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={`flex w-full flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-colors duration-150 min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:opacity-50 ${
          selected
            ? 'border-brand-orange bg-brand-orange/10 text-text-primary'
            : 'border-border bg-elevated text-text-primary hover:border-text-secondary'
        }`}
      >
        <span className="font-semibold">{label}</span>
        <span className="text-sm text-text-secondary">{subtitle}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex items-center justify-center rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-150 min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:opacity-50 ${
        selected
          ? 'border-brand-orange bg-brand-orange text-white'
          : 'border-border bg-elevated text-text-primary hover:border-text-secondary'
      }`}
    >
      {label}
    </button>
  )
}
