import { useState } from 'react'
import { BottomSheet } from '@/components/dashboard/BottomSheet'
import { Button } from '@/components/Button'

const WEEKDAYS = [
  { label: 'Sun', index: 0 },
  { label: 'Mon', index: 1 },
  { label: 'Tue', index: 2 },
  { label: 'Wed', index: 3 },
  { label: 'Thu', index: 4 },
  { label: 'Fri', index: 5 },
  { label: 'Sat', index: 6 },
]

interface TrainingDaysModalProps {
  isOpen: boolean
  initialIndices: number[]
  isSaving: boolean
  onClose: () => void
  onSave: (indices: number[]) => void
}

export function TrainingDaysModal({ isOpen, initialIndices, isSaving, onClose, onSave }: TrainingDaysModalProps) {
  const [selected, setSelected] = useState<number[]>(initialIndices)

  function toggle(index: number) {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index],
    )
  }

  const isValid = selected.length >= 2

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Update Training Days">
      <div className="space-y-5">
        <p className="text-sm text-text-secondary">Select the days you train each week (minimum 2).</p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map(({ label, index }) => (
            <button
              key={index}
              type="button"
              onClick={() => toggle(index)}
              aria-pressed={selected.includes(index)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
                selected.includes(index)
                  ? 'border-brand-orange bg-brand-orange text-white'
                  : 'border-border bg-elevated text-text-primary hover:border-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {!isValid && selected.length > 0 && (
          <p className="text-sm text-phase-peak">Select at least 2 training days</p>
        )}
        <Button onClick={() => onSave(selected)} isLoading={isSaving} disabled={!isValid || isSaving}>
          Save
        </Button>
      </div>
    </BottomSheet>
  )
}
