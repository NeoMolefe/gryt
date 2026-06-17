interface ChipRowProps {
  chips: string[]
  onSelect: (value: string) => void
  disabled?: boolean
}

export function ChipRow({ chips, onSelect, disabled = false }: ChipRowProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip)}
          className="rounded-full border border-brand-orange px-4 py-1.5 text-sm font-medium text-brand-orange transition-colors duration-150 hover:bg-brand-orange hover:text-white disabled:opacity-50"
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
