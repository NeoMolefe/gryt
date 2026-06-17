export type Gender = 'male' | 'female' | 'prefer_not_to_say'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type PrimaryGoal =
  | 'general_fitness'
  | 'hypertrophy'
  | 'fat_loss'
  | 'strength_conditioning'
  | 'functional_athletic'
  | 'mobility'
  | 'cardio_endurance'
  | 'functional_strength_conditioning'
  | 'athletic_performance'
  | 'hybrid_training'
  | 'event_specific'

export type SecondaryGoal =
  | 'improve_athleticism'
  | 'increase_explosiveness'
  | 'improve_mobility_flexibility'
  | 'build_mental_toughness'
  | 'improve_cardio_base'
  | 'lose_body_fat'
  | 'build_muscle'
  | 'improve_body_composition'
  | 'improve_core_strength'
  | 'improve_posture'
  | 'injury_prevention'
  | 'improve_balance_coordination'
  | 'increase_work_capacity'
  | 'improve_recovery'
  | 'build_endurance_base'
  | 'increase_raw_strength'

export type SessionDuration = 30 | 45 | 60 | 90

export type Equipment = 'full_gym' | 'home_gym' | 'bodyweight'

export type TrainingStyle =
  | 'strength'
  | 'endurance'
  | 'mixed'
  | 'mobility'
  | 'conditioning'
  | 'hybrid'

export type EventType =
  | 'marathon'
  | 'half_marathon'
  | 'race_5k'
  | 'race_10k'
  | 'race_15k'
  | 'hyrox'
  | 'triathlon'
  | 'cycling'

export interface OnboardingData {
  firstName: string
  age: string
  heightCm: string
  weightKg: string
  gender: Gender | null
  experience: ExperienceLevel | null
  primaryGoal: PrimaryGoal | null
  secondaryGoals: SecondaryGoal[]
  availabilityDays: number | null
  sessionDuration: SessionDuration | null
  equipment: Equipment | null
  trainingStyle: TrainingStyle[]
  injuryHistory: string
  eventType: EventType | null
  eventDate: string | null
  goalTimeMinutes: number | null
}

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  firstName: '',
  age: '',
  heightCm: '',
  weightKg: '',
  gender: null,
  experience: null,
  primaryGoal: null,
  secondaryGoals: [],
  availabilityDays: null,
  sessionDuration: null,
  equipment: null,
  trainingStyle: [],
  injuryHistory: '',
  eventType: null,
  eventDate: null,
  goalTimeMinutes: null,
}

export type StepId =
  | 'personal'
  | 'experience'
  | 'primaryGoal'
  | 'secondaryGoals'
  | 'availability'
  | 'equipment'
  | 'trainingStyle'
  | 'injuryHistory'
  | 'eventType'
  | 'summary'
