import { supabase } from '@/lib/supabase'
import type { Plan, Workout } from '@/types/plan.types'
import type { ProgressLog } from '@/types/session.types'
import type { CompletedSession } from '@/types/progress.types'

export async function fetchAllProgressLogs(userId: string): Promise<ProgressLog[]> {
  const { data, error } = await supabase
    .from('progress_logs')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch progress logs:', error.message)
    return []
  }

  return (data ?? []) as ProgressLog[]
}

export async function fetchAllPlans(userId: string): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch plans:', error.message)
    return []
  }

  return (data ?? []) as Plan[]
}

export async function fetchAllWorkouts(userId: string): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to fetch workouts:', error.message)
    return []
  }

  return (data ?? []) as Workout[]
}

export async function fetchCompletedSessions(userId: string): Promise<CompletedSession[]> {
  const { data, error } = await supabase
    .from('session_logs')
    .select('workout_id, updated_at')
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (error) {
    console.error('Failed to fetch completed sessions:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    workoutId: row.workout_id as string,
    date: (row.updated_at as string).slice(0, 10),
  }))
}
