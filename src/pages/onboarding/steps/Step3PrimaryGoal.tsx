import { Chip } from '@/components/onboarding/Chip'
import { PRIMARY_GOAL_OPTIONS } from '@/lib/onboarding/options'
import type { StepProps } from '../types'

export function Step3PrimaryGoal({ data, updateData, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          What&apos;s your primary goal?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Choose the one outcome that matters most right now.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {PRIMARY_GOAL_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            subtitle={option.subtitle}
            selected={data.primaryGoal === option.value}
            onClick={() => updateData('primaryGoal', option.value)}
          />
        ))}
      </div>
      {errors.primaryGoal && (
        <p className="text-sm text-phase-peak">{errors.primaryGoal}</p>
      )}
    </div>
  )
}
