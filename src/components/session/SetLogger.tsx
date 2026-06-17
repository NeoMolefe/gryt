import { useState } from 'react'
import { Button } from '@/components/Button'

const RPE_SCALE = Array.from({ length: 10 }, (_, i) => i + 1)

interface SetLoggerProps {
  defaultReps: number | null
  onLogSet: (weightKg: number, reps: number, rpe: number) => void
}

export function SetLogger({ defaultReps, onLogSet }: SetLoggerProps) {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState(defaultReps ? String(defaultReps) : '')
  const [rpe, setRpe] = useState<number | null>(null)

  const canSubmit = weight.trim() !== '' && reps.trim() !== '' && rpe !== null

  function handleSubmit() {
    if (!canSubmit) return
    onLogSet(Number(weight), Number(reps), rpe!)
    setWeight('')
    setRpe(null)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex gap-3">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Weight (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-xl border border-border bg-elevated px-3 py-2 text-lg font-semibold text-text-primary focus:border-brand-orange focus:outline-none"
            placeholder="0"
          />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Reps</span>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full rounded-xl border border-border bg-elevated px-3 py-2 text-lg font-semibold text-text-primary focus:border-brand-orange focus:outline-none"
            placeholder="0"
          />
        </label>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">RPE</p>
      <div className="mb-4 grid grid-cols-5 gap-2">
        {RPE_SCALE.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRpe(value)}
            aria-pressed={rpe === value}
            className={`flex h-10 items-center justify-center rounded-xl border text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
              rpe === value
                ? 'border-brand-orange bg-brand-orange text-white'
                : 'border-border bg-elevated text-text-primary hover:border-text-secondary'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={!canSubmit}>
        Log Set
      </Button>
    </div>
  )
}
