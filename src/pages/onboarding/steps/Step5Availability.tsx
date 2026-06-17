import { Chip } from '@/components/onboarding/Chip'
import { SESSION_DURATION_OPTIONS } from '@/lib/onboarding/options'
import type { StepProps } from '../types'

const DAYS = [1, 2, 3, 4, 5, 6, 7]

export function Step5Availability({ data, updateData, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          What&apos;s your availability?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          We&apos;ll build your programme around your schedule.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-text-secondary">Days per week</span>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <Chip
              key={day}
              label={String(day)}
              selected={data.availabilityDays === day}
              onClick={() => updateData('availabilityDays', day)}
            />
          ))}
        </div>
        {errors.availabilityDays && (
          <p className="text-sm text-phase-peak">{errors.availabilityDays}</p>
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
