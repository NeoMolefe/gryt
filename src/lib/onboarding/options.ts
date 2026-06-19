import type {
  Equipment,
  EventType,
  ExperienceLevel,
  Gender,
  PrimaryGoal,
  SecondaryGoal,
  SessionDuration,
  TrainingStyle,
} from '@/types/onboarding'

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const PRIMARY_GOAL_OPTIONS: {
  value: PrimaryGoal
  label: string
  subtitle: string
}[] = [
  {
    value: 'general_fitness',
    label: 'General Fitness',
    subtitle: 'Overall health and movement quality',
  },
  {
    value: 'hypertrophy',
    label: 'Hypertrophy',
    subtitle: 'Build muscle size and definition',
  },
  {
    value: 'fat_loss',
    label: 'Fat Loss',
    subtitle: 'Reduce body fat while preserving muscle',
  },
  {
    value: 'strength_conditioning',
    label: 'Strength & Conditioning',
    subtitle: 'Build raw strength with conditioning work',
  },
  {
    value: 'functional_athletic',
    label: 'Functional Athletic',
    subtitle: 'Train like an athlete',
  },
  {
    value: 'mobility',
    label: 'Mobility',
    subtitle: 'Improve flexibility and movement range',
  },
  {
    value: 'cardio_endurance',
    label: 'Cardio & Endurance',
    subtitle: 'Build your aerobic engine',
  },
  {
    value: 'functional_strength_conditioning',
    label: 'Functional Strength & Conditioning',
    subtitle: 'Practical strength for real life',
  },
  {
    value: 'athletic_performance',
    label: 'Athletic Performance',
    subtitle: 'Sport-specific power and speed',
  },
  {
    value: 'hybrid_training',
    label: 'Hybrid Training',
    subtitle: 'Mix of strength and conditioning — no specific race or event',
  },
  {
    value: 'event_specific',
    label: 'Event Specific',
    subtitle: 'HYROX, marathon, triathlon, cycling — build toward a race',
  },
]

export interface SecondaryGoalOption {
  value: SecondaryGoal
  label: string
  category: string
}

export const SECONDARY_GOAL_OPTIONS: SecondaryGoalOption[] = [
  // PERFORMANCE ENHANCERS
  { value: 'improve_athleticism', label: 'Improve Athleticism', category: 'Performance Enhancers' },
  { value: 'increase_explosiveness', label: 'Increase Explosiveness', category: 'Performance Enhancers' },
  { value: 'improve_mobility_flexibility', label: 'Improve Mobility & Flexibility', category: 'Performance Enhancers' },
  { value: 'build_mental_toughness', label: 'Build Mental Toughness', category: 'Performance Enhancers' },
  { value: 'improve_cardio_base', label: 'Improve Cardiovascular Base', category: 'Performance Enhancers' },
  // BODY COMPOSITION
  { value: 'lose_body_fat', label: 'Lose Body Fat', category: 'Body Composition' },
  { value: 'build_muscle', label: 'Build Muscle', category: 'Body Composition' },
  { value: 'improve_body_composition', label: 'Improve Body Composition', category: 'Body Composition' },
  // FUNCTIONAL
  { value: 'improve_core_strength', label: 'Improve Core Strength', category: 'Functional' },
  { value: 'improve_posture', label: 'Improve Posture', category: 'Functional' },
  { value: 'injury_prevention', label: 'Injury Prevention', category: 'Functional' },
  { value: 'improve_balance_coordination', label: 'Improve Balance & Coordination', category: 'Functional' },
  // SPORT / EVENT ADJACENT
  { value: 'increase_work_capacity', label: 'Increase Work Capacity', category: 'Sport / Event Adjacent' },
  { value: 'improve_recovery', label: 'Improve Recovery', category: 'Sport / Event Adjacent' },
  { value: 'build_endurance_base', label: 'Build Endurance Base', category: 'Sport / Event Adjacent' },
  { value: 'increase_raw_strength', label: 'Increase Raw Strength', category: 'Sport / Event Adjacent' },
]

export const SECONDARY_GOAL_CATEGORIES = [
  'Performance Enhancers',
  'Body Composition',
  'Functional',
  'Sport / Event Adjacent',
] as const

export const SESSION_DURATION_OPTIONS: { value: SessionDuration; label: string }[] = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
]

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'full_gym', label: 'Full Gym' },
  { value: 'home_gym', label: 'Home Gym' },
  { value: 'bodyweight', label: 'Bodyweight Only' },
]

export const TRAINING_STYLE_OPTIONS: { value: TrainingStyle; label: string }[] = [
  { value: 'strength', label: 'Strength' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'mobility', label: 'Mobility' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'hybrid', label: 'Hybrid' },
]

export const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'marathon', label: 'Marathon (42.2km)' },
  { value: 'half_marathon', label: 'Half Marathon (21.1km)' },
  { value: 'race_5k', label: '5km Race' },
  { value: 'race_10k', label: '10km Race' },
  { value: 'race_15k', label: '15km Race' },
  { value: 'hyrox', label: 'HYROX' },
  { value: 'triathlon', label: 'Triathlon' },
  { value: 'cycling', label: 'Cycling Event' },
]

function findLabel<T extends string | number>(
  options: { value: T; label: string }[],
  value: T | null,
): string {
  return options.find((option) => option.value === value)?.label ?? '—'
}

export function genderLabel(value: Gender | null): string {
  return findLabel(GENDER_OPTIONS, value)
}

export function experienceLabel(value: ExperienceLevel | null): string {
  return findLabel(EXPERIENCE_OPTIONS, value)
}

export function primaryGoalLabel(value: PrimaryGoal | null): string {
  return findLabel(PRIMARY_GOAL_OPTIONS, value)
}

export function secondaryGoalLabel(value: SecondaryGoal): string {
  return SECONDARY_GOAL_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function equipmentLabel(value: Equipment | null): string {
  return findLabel(EQUIPMENT_OPTIONS, value)
}

export function trainingStyleLabel(value: TrainingStyle): string {
  return TRAINING_STYLE_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function sessionDurationLabel(value: SessionDuration | null): string {
  return findLabel(SESSION_DURATION_OPTIONS, value)
}

export function eventTypeLabel(value: EventType | null): string {
  return findLabel(EVENT_TYPE_OPTIONS, value)
}
