interface SettingsToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function SettingsToggle({ label, checked, onChange }: SettingsToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl bg-elevated px-4 py-3 text-left"
    >
      <span className="text-sm text-text-primary">{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
          checked ? 'bg-brand-orange' : 'bg-border'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-150 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}
