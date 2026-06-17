import type { ExerciseBlock } from '@/types/plan.types'
import type { SessionLogStatus } from '@/types/dashboard.types'
import type { UnlockedBadge } from '@/types/gamification.types'

export type ExerciseSection = 'warm_up' | 'main_lifts' | 'accessories' | 'conditioning' | 'cooldown'

export interface HyroxStationState {
  order: number
  type: 'run' | 'station'
  name: string
  distance_or_reps: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  logged_weight?: number | null
  logged_reps?: number | null
  rpe?: number | null
  elapsed_seconds?: number | null
  is_pb?: boolean | null
}

export interface FlatExercise {
  section: ExerciseSection
  block: ExerciseBlock
  isCompound: boolean
}

export type TimerType = 'work' | 'rest'

export interface LoggedSetEntry {
  exerciseIndex: number
  setIndex: number
  weight_kg: number
  reps: number
  rpe: number
  isPB: boolean
  loggedAt: string
}

export interface SkippedSetEntry {
  exerciseIndex: number
  setIndex: number
}

export interface ActiveSessionState {
  userId: string
  workoutId: string
  sessionLogId: string | null
  sessionName: string
  currentExerciseIndex: number
  currentSetIndex: number
  timerType: TimerType
  timerRemainingSeconds: number
  timerRunning: boolean
  completedSets: LoggedSetEntry[]
  skippedSets: SkippedSetEntry[]
  sessionStatus: SessionLogStatus
  isPaused: boolean
  fatigueTaxActive: boolean
  rpeBoostExerciseIndexes: number[]
  startedAt: string
  updatedAt: string
  hyrox_stations?: HyroxStationState[] | null
  current_station_index?: number | null
}

export interface ProgressLog {
  id: string
  user_id: string
  workout_id: string
  exercise_name: string
  set_number: number
  weight_kg: number
  reps: number
  rpe: number
  is_pb: boolean
  distance_km: number | null
  completed_at: string
  created_at: string
}

export interface RecapStats {
  totalSets: number
  completedSets: number
  exerciseCount: number
  pbCount: number
  xpEarned: number
  unlockedBadges: UnlockedBadge[]
  isHyroxSimulation?: boolean
  hyroxStationsCompleted?: number
  hyroxTotalStations?: number
  hyroxTotalRunDistanceM?: number
  hyroxSessionDurationSeconds?: number
}
