import { Chip } from '@/components/onboarding/Chip'
import { EXPERIENCE_OPTIONS } from '@/lib/onboarding/options'
import type { StepProps } from '../types'

export function Step2Experience({ data, updateData, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          What&apos;s your training experience?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          This helps Kwazi calibrate your starting point.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXPERIENCE_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={data.experience === option.value}
            onClick={() => updateData('experience', option.value)}
          />
        ))}
      </div>
      {errors.experience && (
        <p className="text-sm text-phase-peak">{errors.experience}</p>
      )}
    </div>
  )
}
