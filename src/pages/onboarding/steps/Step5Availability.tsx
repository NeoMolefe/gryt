import { Chip } from '@/components/onboarding/Chip'
import { SESSION_DURATION_OPTIONS } from '@/lib/onboarding/options'
import type { StepProps } from '../types'

const WEEKDAYS = [
  { label: 'Sun', index: 0 },
  { label: 'Mon', index: 1 },
  { label: 'Tue', index: 2 },
  { label: 'Wed', index: 3 },
  { label: 'Thu', index: 4 },
  { label: 'Fri', index: 5 },
  { label: 'Sat', index: 6 },
]

export function Step5Availability({ data, updateData, errors }: StepProps) {
  function toggleDay(index: number) {
    const current = data.trainingDayIndices
    const next = current.includes(index)
      ? current.filter((d) => d !== index)
      : [...current, index]
    updateData('trainingDayIndices', next)
    updateData('availabilityDays', next.length > 0 ? next.length : null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Which days do you train?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Pick at least 2 days. We&apos;ll build your programme around your schedule.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-text-secondary">Training days</span>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map(({ label, index }) => (
            <Chip
              key={index}
              label={label}
              selected={data.trainingDayIndices.includes(index)}
              onClick={() => toggleDay(index)}
            />
          ))}
        </div>
        {errors.trainingDayIndices && (
          <p className="text-sm text-phase-peak">{errors.trainingDayIndices}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-text-secondary">Session duration</span>
        <div className="flex flex-wrap gap-2">
          {SESSION_DURATION_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={data.sessionDuration === option.value}
              onClick={() => updateData('sessionDuration', option.value)}
            />
          ))}
        </div>
        {errors.sessionDuration && (
          <p className="text-sm text-phase-peak">{errors.sessionDuration}</p>
        )}
      </div>
    </div>
  )
}
