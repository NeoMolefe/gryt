import { useState } from 'react'
import { Chip } from '@/components/onboarding/Chip'
import {
  PRIMARY_GOAL_OPTIONS,
  SECONDARY_GOAL_CATEGORIES,
  SECONDARY_GOAL_OPTIONS,
} from '@/lib/onboarding/options'
import type { StepProps } from '../types'

const MAX_SECONDARY_GOALS = 5

export function Step4SecondaryGoals({ data, updateData }: StepProps) {
  const [limitMessage, setLimitMessage] = useState<string | null>(null)

  const primaryGoalLabel = PRIMARY_GOAL_OPTIONS.find(
    (option) => option.value === data.primaryGoal,
  )?.label

  function toggleGoal(value: (typeof data.secondaryGoals)[number]) {
    const isSelected = data.secondaryGoals.includes(value)

    if (isSelected) {
      setLimitMessage(null)
      updateData(
        'secondaryGoals',
        data.secondaryGoals.filter((goal) => goal !== value),
      )
      return
    }

    if (data.secondaryGoals.length >= MAX_SECONDARY_GOALS) {
      setLimitMessage('Maximum 5 secondary goals. Deselect one to choose another.')
      return
    }

    setLimitMessage(null)
    updateData('secondaryGoals', [...data.secondaryGoals, value])
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Any secondary goals?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Optional — choose up to 5 supporting goals.
        </p>
      </div>

      {limitMessage && (
        <p className="text-sm text-phase-peak">{limitMessage}</p>
      )}

      {SECONDARY_GOAL_CATEGORIES.map((category) => {
        const options = SECONDARY_GOAL_OPTIONS.filter(
          (option) =>
            option.category === category && option.label !== primaryGoalLabel,
        )

        if (options.length === 0) return null

        return (
          <div key={category} className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {category}
            </span>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={data.secondaryGoals.includes(option.value)}
                  onClick={() => toggleGoal(option.value)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
