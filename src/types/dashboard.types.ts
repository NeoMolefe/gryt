import type { Focus } from '@/types/plan.types'

export interface ReadinessCheckin {
  id: string
  user_id: string
  date: string
  sleep_quality: number
  soreness_level: number
  energy_stress: number
  score: number
  created_at: string
}

export interface MobilityExercise {
  name: string
  duration_minutes: number
}

export type MobilityRoutineId =
  | 'hip_glute'
  | 'thoracic_shoulder'
  | 'lower_back_hamstring'
  | 'ankle_knee'
  | 'full_body_flow'
  | 'active_recovery'

export interface MobilityRoutine {
  id: MobilityRoutineId
  name: string
  triggerFocuses: Focus[]
  exercises: MobilityExercise[]
}

export type SessionLogStatus = 'in_progress' | 'completed' | 'abandoned'

export interface SessionLog {
  id: string
  user_id: string
  workout_id: string
  session_name: string
  status: SessionLogStatus
  started_at: string
  updated_at: string
}

export interface Badge {
  name: string
  threshold: number
}

export type NotificationType =
  | 'daily_reminder'
  | 'daily_summary_evening'
  | 'streak_reminder'
  | 'deload_trigger'
  | 'personal_best'
  | 'badge_unlocked'
  | 'phase_complete'
  | 'weekly_kwazi_review'

export interface DashboardNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  created_at: string
  read: boolean
}
