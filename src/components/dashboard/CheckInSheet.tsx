import { useState } from 'react'
import { Button } from '@/components/Button'
import { BottomSheet } from './BottomSheet'

interface CheckInSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: { sleep: number; soreness: number; energy: number }) => Promise<unknown>
  isSubmitting: boolean
}

const SCALE = [1, 2, 3, 4, 5]

interface ScaleQuestionProps {
  label: string
  lowLabel: string
  highLabel: string
  value: number | null
  onChange: (value: number) => void
}

function ScaleQuestion({ label, lowLabel, highLabel, value, onChange }: ScaleQuestionProps) {
  return (
    <div className="mb-6">
      <p className="mb-2 font-medium text-text-primary">{label}</p>
      <div className="flex gap-2">
        {SCALE.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={`flex h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
              value === option
                ? 'border-brand-orange bg-brand-orange text-white'
                : 'border-border bg-elevated text-text-primary hover:border-text-secondary'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-text-secondary">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}

export function CheckInSheet({ isOpen, onClose, onSubmit, isSubmitting }: CheckInSheetProps) {
  const [sleep, setSleep] = useState<number | null>(null)
  const [soreness, setSoreness] = useState<number | null>(null)
  const [energy, setEnergy] = useState<number | null>(null)

  const canSubmit = sleep !== null && soreness !== null && energy !== null

  async function handleSubmit() {
    if (!canSubmit) return
    await onSubmit({ sleep, soreness, energy })
    setSleep(null)
    setSoreness(null)
    setEnergy(null)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Daily Check-In">
      <ScaleQuestion label="Sleep quality" lowLabel="Poor" highLabel="Excellent" value={sleep} onChange={setSleep} />
      <ScaleQuestion
        label="Soreness level"
        lowLabel="None"
        highLabel="Very sore"
        value={soreness}
        onChange={setSoreness}
      />
      <ScaleQuestion
        label="Energy & stress"
        lowLabel="Low / stressed"
        highLabel="High / relaxed"
        value={energy}
        onChange={setEnergy}
      />

      <Button onClick={handleSubmit} disabled={!canSubmit} isLoading={isSubmitting}>
        Submit Check-In
      </Button>
    </BottomSheet>
  )
}
