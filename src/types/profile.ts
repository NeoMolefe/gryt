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

export type InjuryBodyArea = 'Knee' | 'Lower Back' | 'Shoulder' | 'Hip' | 'Ankle' | 'Wrist' | 'Neck' | 'Other'

export type InjurySeverity = 'Mild' | 'Moderate' | 'Severe'

export interface InjuryFlag {
  bodyArea: InjuryBodyArea
  severity: InjurySeverity
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  onboarding_completed: boolean
  created_at: string
  first_name?: string | null
  age?: number | null
  height_cm?: number | null
  weight_kg?: number | null
  gender?: Gender | null
  experience?: ExperienceLevel | null
  primary_goal?: PrimaryGoal | null
  secondary_goals?: SecondaryGoal[] | null
  availability_days?: number | null
  session_duration_minutes?: SessionDuration | null
  equipment?: Equipment | null
  training_styles?: TrainingStyle[] | null
  injury_history?: string | null
  event_type?: EventType | null
  event_date?: string | null
  goal_time_minutes?: number | null
  xp_total?: number | null
  injury_flags?: InjuryFlag[] | null
  has_seen_dashboard_tutorial?: boolean | null
}
