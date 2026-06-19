import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { fetchActivePlan, fetchWorkouts } from '@/lib/dashboard/queries'
import { getTrainingForLabel } from '@/lib/plan/trainingForLabel'
import { loadActiveSession, clearActiveSession } from '@/lib/session/sessionStorage'
import { ResumeSessionModal } from '@/components/session/ResumeSessionModal'
import { WeekAccordion, type WeekGroup } from '@/components/plan/WeekAccordion'
import type { Workout } from '@/types/plan.types'

export function Workouts() {
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const profile = useAuthStore((state) => state.profile)
  const userId = session?.user.id ?? null

  const planQuery = useQuery({
    queryKey: ['plan', userId],
    queryFn: () => fetchActivePlan(userId!),
    enabled: !!userId,
  })

  const plan = planQuery.data ?? null

  const workoutsQuery = useQuery({
    queryKey: ['workouts', plan?.id],
    queryFn: () => fetchWorkouts(plan!.id),
    enabled: !!plan?.id,
  })

  const [expandedWeek, setExpandedWeek] = useState<number | null>(1)
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null)
  const [pendingWorkout, setPendingWorkout] = useState<Workout | null>(null)
  const [resumeSessionName, setResumeSessionName] = useState<string | null>(null)
  const [resumeWorkoutId, setResumeWorkoutId] = useState<string | null>(null)

  const weeks = useMemo<WeekGroup[]>(() => {
    const workouts = workoutsQuery.data ?? []
    const byWeek = new Map<number, Workout[]>()
    for (const workout of workouts) {
      const list = byWeek.get(workout.week_number) ?? []
      list.push(workout)
      byWeek.set(workout.week_number, list)
    }

    return Array.from(byWeek.entries())
      .sort(([a], [b]) => a - b)
      .map(([weekNumber, weekWorkouts]) => ({
        weekNumber,
        workouts: [...weekWorkouts].sort((a, b) => a.day_number - b.day_number),
      }))
  }, [workoutsQuery.data])

  const eventBadgeLabel = plan ? getTrainingForLabel(plan.archetype) : null

  function handleStart(workout: Workout) {
    if (!userId) return

    const existing = loadActiveSession(userId)

    if (existing && existing.sessionStatus === 'in_progress') {
      if (existing.workoutId === workout.id) {
        navigate(`/session/${workout.id}`)
        return
      }

      setPendingWorkout(workout)
      setResumeSessionName(existing.sessionName)
      setResumeWorkoutId(existing.workoutId)
      return
    }

    navigate(`/session/${workout.id}`)
  }

  function handleResume() {
    if (resumeWorkoutId) navigate(`/session/${resumeWorkoutId}`)
  }

  function handleStartNew() {
    if (userId) clearActiveSession(userId)
    if (pendingWorkout) navigate(`/session/${pendingWorkout.id}`)
  }

  function handleCancel() {
    setPendingWorkout(null)
    setResumeSessionName(null)
    setResumeWorkoutId(null)
  }

  if (planQuery.isLoading || workoutsQuery.isLoading || !plan) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-text-secondary">Loading your plan...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="min-h-svh px-6 py-6 pb-24"
    >
      <div className="mx-auto max-w-md">
        <h1 className="mb-1 text-2xl font-bold text-text-primary">Your Plan</h1>
        <div className="mb-6">
          <p className="text-sm text-text-secondary">{plan.archetype} · {plan.total_weeks} weeks</p>
          {profile?.event_type === 'hyrox' && profile.goal_time_minutes && (
            <p className="mt-0.5 text-xs text-text-muted">
              Goal: sub-{Math.floor(profile.goal_time_minutes / 60)}:{String(profile.goal_time_minutes % 60).padStart(2, '0')} — roughly {Math.round(profile.goal_time_minutes / 8)} min per station including transitions.
            </p>
          )}
          {(profile?.event_type === 'triathlon' || profile?.event_type === 'cycling') && profile.goal_time_minutes && (
            <p className="mt-0.5 text-xs text-text-muted">
              Goal time: {Math.floor(profile.goal_time_minutes / 60)}h {profile.goal_time_minutes % 60}min
            </p>
          )}
        </div>

        <WeekAccordion
          weeks={weeks}
          expandedWeek={expandedWeek}
          expandedDayId={expandedDayId}
          eventBadgeLabel={eventBadgeLabel}
          injuryFlags={profile?.injury_flags}
          onToggleWeek={(weekNumber) => {
            setExpandedWeek((current) => (current === weekNumber ? null : weekNumber))
            setExpandedDayId(null)
          }}
          onToggleDay={(workoutId) => setExpandedDayId((current) => (current === workoutId ? null : workoutId))}
          onStart={handleStart}
        />
      </div>

      <ResumeSessionModal
        isOpen={!!pendingWorkout}
        sessionName={resumeSessionName ?? ''}
        onResume={handleResume}
        onStartNew={handleStartNew}
        onCancel={handleCancel}
      />
    </motion.div>
  )
}
