import { supabase } from '@/lib/supabase'
import type { Plan, Workout } from '@/types/plan.types'
import type { ReadinessCheckin, SessionLog } from '@/types/dashboard.types'
import { formatDateISO } from './schedule'

export async function fetchActivePlan(userId: string): Promise<Plan | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)

  return data as Plan | null
}

export async function fetchWorkouts(planId: string): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('plan_id', planId)
    .order('week_number', { ascending: true })
    .order('day_number', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as Workout[]
}

/** Fetches the most recent check-ins, most recent first. */
export async function fetchRecentCheckins(userId: string, limit = 10): Promise<ReadinessCheckin[]> {
  const { data, error } = await supabase
    .from('readiness_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch readiness check-ins:', error.message)
    return []
  }

  return (data ?? []) as ReadinessCheckin[]
}

export async function fetchActiveSessionLog(userId: string): Promise<SessionLog | null> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('session_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .gte('started_at', since)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch active session log:', error.message)
    return null
  }

  return data as SessionLog | null
}

export interface SubmitCheckinInput {
  userId: string
  sleepQuality: number
  sorenessLevel: number
  energyStress: number
  score: number
  currentXp: number
}

export async function submitCheckin(input: SubmitCheckinInput): Promise<ReadinessCheckin> {
  const { userId, sleepQuality, sorenessLevel, energyStress, score, currentXp } = input

  const { data, error } = await supabase
    .from('readiness_checkins')
    .insert({
      user_id: userId,
      date: formatDateISO(new Date()),
      sleep_quality: sleepQuality,
      soreness_level: sorenessLevel,
      energy_stress: energyStress,
      score,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const { error: xpError } = await supabase
    .from('profiles')
    .update({ xp_total: currentXp + 10 })
    .eq('id', userId)

  if (xpError) {
    throw new Error(xpError.message)
  }

  return data as ReadinessCheckin
}

export async function abandonSessionLog(sessionLogId: string): Promise<void> {
  const { error } = await supabase
    .from('session_logs')
    .update({ status: 'abandoned' })
    .eq('id', sessionLogId)

  if (error) {
    console.error('Failed to abandon session log:', error.message)
  }
}
