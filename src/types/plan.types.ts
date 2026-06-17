export type Phase = 'foundation' | 'build' | 'peak' | 'deload'

export type Archetype =
  | 'Bodybuilder'
  | 'Strength Athlete'
  | 'Endurance Athlete'
  | 'Hybrid Performer'
  | 'General Fitness'
  | 'Mobility Focus'
  | 'Fat Loss'
  | 'Functional Strength & Conditioning'
  | 'Athletic Performance'

export type Equipment = 'full_gym' | 'home_gym' | 'bodyweight'

export type Focus =
  | 'upper_push'
  | 'upper_pull'
  | 'lower'
  | 'core'
  | 'conditioning'
  | 'power'
  | 'plyometric'
  | 'lateral'
  | 'agility'
  | 'loaded_carry'
  | 'sprint'
  | 'vo2max'
  | 'mobility'

export interface ExerciseBlock {
  name: string
  sets: number
  reps: number | string
  rest_seconds: number
  rpe_target: number
  load_guidance: string
  coaching_cues: string[]
  home_alternative?: string
  progression_tier?: number
}

export interface HyroxSimulationStation {
  order: number
  type: 'run' | 'station'
  name: string
  distance_or_reps: string
}

export interface WorkoutSession {
  session_name: string
  phase: Phase
  week_number: number
  day_number: number
  estimated_duration_minutes: number
  warm_up: ExerciseBlock[]
  main_lifts: ExerciseBlock[]
  accessories: ExerciseBlock[]
  conditioning: ExerciseBlock | null
  cooldown: ExerciseBlock[]
  notes?: string[]
  // NOTE for UI: when hyrox_simulation is present on a HYROX Simulation session,
  // render it as a sequential run/station checklist instead of the standard exercise logger.
  hyrox_simulation?: HyroxSimulationStation[]
}

export interface Plan {
  id: string
  user_id: string
  archetype: Archetype
  total_weeks: number
  active: boolean
  start_date: string
  daily_calories: number
  daily_protein_g: number
  daily_carbs_g: number
  daily_fat_g: number
  tdee: number
  created_at: string
}

export interface Workout extends WorkoutSession {
  id: string
  plan_id: string
  user_id: string
  hyrox_simulation?: HyroxSimulationStation[] | null
}
