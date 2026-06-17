import type { Phase } from '@/types/plan.types'

export interface ExerciseBestSet {
  exerciseName: string
  weightKg: number
  reps: number
  rpe: number
}

export interface SessionHistoryEntry {
  id: string
  workoutId: string
  date: string
  sessionName: string
  phase: Phase
  weekNumber: number
  dayNumber: number
  completionRate: number
  averageRpe: number
  bestSets: ExerciseBestSet[]
  planLabel: string | null
}

export type BadgeId =
  | 'phase_complete'
  | 'streak_7'
  | 'first_pb'
  | 'recovery_warrior'
  | 'deload_discipline'
  | 'hybrid_ready'

export interface BadgeStatus {
  id: BadgeId
  name: string
  description: string
  earned: boolean
  earnedDate: string | null
  progressCurrent: number
  progressTarget: number
}

export const ATHLETIC_AXES = ['Strength', 'Power', 'Endurance', 'Mobility', 'Conditioning', 'Recovery'] as const
export type AthleticAxis = (typeof ATHLETIC_AXES)[number]

export interface AthleticProfilePoint {
  axis: AthleticAxis
  value: number
}

export interface TrainingLoadPoint {
  week: number
  load: number
}

export interface ReadinessTrendPoint {
  date: string
  score: number
}

export interface HeatmapDay {
  date: string
  active: boolean
}

export interface CompletedSession {
  workoutId: string
  date: string
}
