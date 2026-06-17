import { supabase } from '@/lib/supabase'
import type { Workout } from '@/types/plan.types'
import type { LoggedSetEntry, ProgressLog } from '@/types/session.types'
import type { SessionLog } from '@/types/dashboard.types'

export async function fetchWorkoutById(workoutId: string): Promise<Workout | null> {
  const { data, error } = await supabase.from('workouts').select('*').eq('id', workoutId).maybeSingle()

  if (error) {
    console.error('Failed to fetch workout:', error.message)
    return null
  }

  return data as Workout | null
}

/** Best logged volume (weight_kg * reps) per exercise name for this user. */
export async function fetchBestVolumes(userId: string, exerciseNames: string[]): Promise<Record<string, number>> {
  if (exerciseNames.length === 0) return {}

  const { data, error } = await supabase
    .from('progress_logs')
    .select('exercise_name, weight_kg, reps')
    .eq('user_id', userId)
    .in('exercise_name', exerciseNames)

  if (error) {
    console.error('Failed to fetch progress logs:', error.message)
    return {}
  }

  const best: Record<string, number> = {}
  for (const row of (data ?? []) as Pick<ProgressLog, 'exercise_name' | 'weight_kg' | 'reps'>[]) {
    const volume = row.weight_kg * row.reps
    if (!best[row.exercise_name] || volume > best[row.exercise_name]!) {
      best[row.exercise_name] = volume
    }
  }

  return best
}

/** Whether a cardio session covering more than 5km was logged in the last 24 hours. */
export async function checkFatigueTax(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('progress_logs')
    .select('distance_km')
    .eq('user_id', userId)
    .gte('completed_at', since)
    .gt('distance_km', 5)
    .limit(1)

  if (error) {
    console.error('Failed to check fatigue tax:', error.message)
    return false
  }

  return (data ?? []).length > 0
}

export async function createSessionLog(userId: string, workout: Workout): Promise<SessionLog | null> {
  const { data, error } = await supabase
    .from('session_logs')
    .insert({
      user_id: userId,
      workout_id: workout.id,
      session_name: workout.session_name,
      status: 'in_progress',
    })
    .select('*')
    .single()

  if (error) {
    console.error('Failed to create session log:', error.message)
    return null
  }

  return data as SessionLog
}

export async function completeSessionLog(sessionLogId: string): Promise<void> {
  const { error } = await supabase
    .from('session_logs')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', sessionLogId)

  if (error) {
    console.error('Failed to complete session log:', error.message)
  }
}

export interface CompleteSessionInput {
  userId: string
  workoutId: string
  exerciseNames: string[]
  completedSets: LoggedSetEntry[]
  distanceKmByExerciseIndex: Record<number, number | null>
  currentXp: number
  xpEarned: number
}

export interface HyroxStationLog {
  exercise_name: string
  weight_kg: number
  reps: number
  rpe: number
  is_pb: boolean
}

export async function writeHyroxLogs(
  userId: string,
  workoutId: string,
  stationLogs: HyroxStationLog[],
  totalRunDistanceKm: number,
): Promise<void> {
  if (stationLogs.length > 0) {
    const rows = stationLogs.map((log) => ({
      user_id: userId,
      workout_id: workoutId,
      exercise_name: log.exercise_name,
      set_number: 1,
      weight_kg: log.weight_kg,
      reps: log.reps,
      rpe: log.rpe,
      is_pb: log.is_pb,
      distance_km: null,
      completed_at: new Date().toISOString(),
    }))
    const { error } = await supabase.from('progress_logs').insert(rows)
    if (error) console.error('Failed to write HYROX station logs:', error.message)
  }

  // Write cumulative run distance so checkFatigueTax picks it up for future sessions.
  // HYROX run segments use "300m"/"500m"/"1000m" format which parseDistanceKm cannot
  // parse — this explicit log is the integration point.
  if (totalRunDistanceKm >= 1) {
    const { error } = await supabase.from('progress_logs').insert({
      user_id: userId,
      workout_id: workoutId,
      exercise_name: 'HYROX Run Total',
      set_number: 1,
      weight_kg: 0,
      reps: 1,
      rpe: 7,
      is_pb: false,
      distance_km: totalRunDistanceKm,
      completed_at: new Date().toISOString(),
    })
    if (error) console.error('Failed to write HYROX run distance log:', error.message)
  }
}

export async function writeProgressLogs(input: CompleteSessionInput): Promise<void> {
  const { userId, workoutId, exerciseNames, completedSets, distanceKmByExerciseIndex } = input

  if (completedSets.length > 0) {
    const rows = completedSets.map((set) => ({
      user_id: userId,
      workout_id: workoutId,
      exercise_name: exerciseNames[set.exerciseIndex] ?? 'Unknown',
      set_number: set.setIndex + 1,
      weight_kg: set.weight_kg,
      reps: set.reps,
      rpe: set.rpe,
      is_pb: set.isPB,
      distance_km: distanceKmByExerciseIndex[set.exerciseIndex] ?? null,
      completed_at: set.loggedAt,
    }))

    const { error } = await supabase.from('progress_logs').insert(rows)
    if (error) {
      throw new Error(error.message)
    }
  }

  const { error: xpError } = await supabase
    .from('profiles')
    .update({ xp_total: input.currentXp + input.xpEarned })
    .eq('id', userId)

  if (xpError) {
    throw new Error(xpError.message)
  }
}
