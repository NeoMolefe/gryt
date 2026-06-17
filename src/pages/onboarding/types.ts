import type { OnboardingData } from '@/types/onboarding'

export interface StepProps {
  data: OnboardingData
  updateData: <K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K],
  ) => void
  errors: Record<string, string>
}
