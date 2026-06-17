import { TextField } from '@/components/TextField'
import { Chip } from '@/components/onboarding/Chip'
import { GENDER_OPTIONS } from '@/lib/onboarding/options'
import type { StepProps } from '../types'

export function Step1PersonalDetails({ data, updateData, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Tell us about yourself
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          We use this to personalise your programme.
        </p>
      </div>

      <TextField
        label="First name"
        value={data.firstName}
        onChange={(event) => updateData('firstName', event.target.value)}
        error={errors.firstName}
        autoComplete="given-name"
      />

      <TextField
        label="Age"
        type="number"
        inputMode="numeric"
        value={data.age}
        onChange={(event) => updateData('age', event.target.value)}
        error={errors.age}
      />

      <TextField
        label="Height (cm)"
        type="number"
        inputMode="numeric"
        value={data.heightCm}
        onChange={(event) => updateData('heightCm', event.target.value)}
        error={errors.heightCm}
      />

      <TextField
        label="Weight (kg)"
        type="number"
        inputMode="numeric"
        value={data.weightKg}
        onChange={(event) => updateData('weightKg', event.target.value)}
        error={errors.weightKg}
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm text-text-secondary">Gender</span>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={data.gender === option.value}
              onClick={() => updateData('gender', option.value)}
            />
          ))}
        </div>
        {errors.gender && <p className="text-sm text-phase-peak">{errors.gender}</p>}
      </div>
    </div>
  )
}
