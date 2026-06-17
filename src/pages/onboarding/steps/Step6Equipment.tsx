import { Chip } from '@/components/onboarding/Chip'
import { EQUIPMENT_OPTIONS } from '@/lib/onboarding/options'
import type { StepProps } from '../types'

export function Step6Equipment({ data, updateData, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          What equipment do you have access to?
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {EQUIPMENT_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={data.equipment === option.value}
            onClick={() => updateData('equipment', option.value)}
          />
        ))}
      </div>
      {errors.equipment && (
        <p className="text-sm text-phase-peak">{errors.equipment}</p>
      )}
    </div>
  )
}
