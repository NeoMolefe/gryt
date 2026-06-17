import { Chip } from '@/components/onboarding/Chip'
import { TRAINING_STYLE_OPTIONS } from '@/lib/onboarding/options'
import type { StepProps } from '../types'

export function Step7TrainingStyle({ data, updateData, errors }: StepProps) {
  function toggleStyle(value: (typeof data.trainingStyle)[number]) {
    if (data.trainingStyle.includes(value)) {
      updateData(
        'trainingStyle',
        data.trainingStyle.filter((style) => style !== value),
      )
    } else {
      updateData('trainingStyle', [...data.trainingStyle, value])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          What training styles do you enjoy?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Choose all that apply.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRAINING_STYLE_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={data.trainingStyle.includes(option.value)}
            onClick={() => toggleStyle(option.value)}
          />
        ))}
      </div>
      {errors.trainingStyle && (
        <p className="text-sm text-phase-peak">{errors.trainingStyle}</p>
      )}
    </div>
  )
}
