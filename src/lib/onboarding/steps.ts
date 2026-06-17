import type { OnboardingData, PrimaryGoal, StepId } from '@/types/onboarding'

export const BASE_STEPS: StepId[] = [
  'personal',
  'experience',
  'primaryGoal',
  'secondaryGoals',
  'availability',
  'equipment',
  'trainingStyle',
  'injuryHistory',
]

export function buildSteps(primaryGoal: PrimaryGoal | null): StepId[] {
  const steps = [...BASE_STEPS]
  if (primaryGoal === 'event_specific') {
    steps.push('eventType')
  }
  steps.push('summary')
  return steps
}

export function validateStep(
  id: StepId,
  data: OnboardingData,
): Record<string, string> {
  const errors: Record<string, string> = {}

  switch (id) {
    case 'personal': {
      if (!data.firstName.trim()) errors.firstName = 'First name is required'
      if (!data.age.trim() || Number(data.age) <= 0) errors.age = 'Enter a valid age'
      if (!data.heightCm.trim() || Number(data.heightCm) <= 0)
        errors.heightCm = 'Enter a valid height'
      if (!data.weightKg.trim() || Number(data.weightKg) <= 0)
        errors.weightKg = 'Enter a valid weight'
      if (!data.gender) errors.gender = 'Please select an option'
      break
    }
    case 'experience': {
      if (!data.experience) errors.experience = 'Please select your experience level'
      break
    }
    case 'primaryGoal': {
      if (!data.primaryGoal) errors.primaryGoal = 'Please select a primary goal'
      break
    }
    case 'availability': {
      if (!data.availabilityDays)
        errors.availabilityDays = 'Please select how many days you can train'
      if (!data.sessionDuration)
        errors.sessionDuration = 'Please select a session duration'
      break
    }
    case 'equipment': {
      if (!data.equipment) errors.equipment = 'Please select your available equipment'
      break
    }
    case 'trainingStyle': {
      if (data.trainingStyle.length === 0)
        errors.trainingStyle = 'Please select at least one training style'
      break
    }
    case 'eventType': {
      if (!data.eventType) errors.eventType = 'Please select an event'
      if (!data.eventDate) {
        errors.eventDate = 'Please enter your event date'
      } else {
        const todayStr = new Date().toISOString().slice(0, 10)
        if (data.eventDate <= todayStr) {
          errors.eventDate = 'Your event date needs to be in the future.'
        }
      }
      break
    }
    default:
      break
  }

  return errors
}

export const FUNCTIONAL_ATHLETIC_MIN_DAYS = 4

export function summaryBlockReason(data: OnboardingData): string | null {
  if (
    data.primaryGoal === 'functional_athletic' &&
    (data.availabilityDays ?? 0) < FUNCTIONAL_ATHLETIC_MIN_DAYS
  ) {
    return `This programme requires a minimum of ${FUNCTIONAL_ATHLETIC_MIN_DAYS} training days per week. Please update your availability.`
  }
  return null
}
