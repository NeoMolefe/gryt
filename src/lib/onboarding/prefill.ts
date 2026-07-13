import { INITIAL_ONBOARDING_DATA } from '@/types/onboarding'
import type { OnboardingData } from '@/types/onboarding'
import type { Profile } from '@/types/profile'

/** Builds onboarding data pre-populated from the user's existing profile, for plan regeneration. */
export function prefillFromProfile(profile: Profile): OnboardingData {
  return {
    ...INITIAL_ONBOARDING_DATA,
    firstName: profile.first_name ?? '',
    age: profile.age != null ? String(profile.age) : '',
    heightCm: profile.height_cm != null ? String(profile.height_cm) : '',
    weightKg: profile.weight_kg != null ? String(profile.weight_kg) : '',
    gender: profile.gender ?? null,
    experience: profile.experience ?? null,
    primaryGoal: profile.primary_goal ?? null,
    secondaryGoals: profile.secondary_goals ?? [],
    trainingDayIndices: profile.training_day_indices ?? [],
    availabilityDays: profile.availability_days ?? null,
    sessionDuration: profile.session_duration_minutes ?? null,
    equipment: profile.equipment ?? null,
    trainingStyle: profile.training_styles ?? [],
    injuryHistory: profile.injury_history ?? '',
    eventType: profile.event_type ?? null,
    eventDate: profile.event_date ?? null,
    goalTimeMinutes: profile.goal_time_minutes ?? null,
  }
}
