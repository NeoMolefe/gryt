import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { List, Pause, Play, X } from 'lucide-react'
import { Button } from '@/components/Button'
import { PhaseBadge } from '@/components/dashboard/PhaseBadge'
import { Chip } from '@/components/session/Chip'
import { Confetti } from '@/components/session/Confetti'
import { ExerciseSidebar } from '@/components/session/ExerciseSidebar'
import { SessionRecap } from '@/components/session/SessionRecap'
import { SetLogger } from '@/components/session/SetLogger'
import { TimerRing } from '@/components/session/TimerRing'
import { HyroxSimulationFlow } from '@/components/workout/HyroxSimulationFlow'
import { useAuthStore } from '@/store/authStore'
import { useWorkoutSession } from '@/hooks/useWorkoutSession'
import { fetchActivePlan, fetchRecentCheckins } from '@/lib/dashboard/queries'
import { calculateStreak } from '@/lib/dashboard/streak'
import { isLegExercise } from '@/lib/session/fatigueTax'
import { parseDurationSeconds } from '@/lib/session/flattenExercises'
import { suggestedWeightIncrease } from '@/lib/session/rpeAdaptation'

const SWIPE_THRESHOLD = 60

export function WorkoutSession() {
  const { workoutId } = useParams<{ workoutId: string }>()
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const profile = useAuthStore((state) => state.profile)
  const userId = session?.user.id ?? null

  const {
    isLoading,
    workout,
    flatExercises,
    state,
    currentExercise,
    currentSetNumber,
    totalSets,
    resumeMessage,
    clearResumeMessage,
    pbFlash,
    recap,
    logSet,
    skipSet,
    markExerciseComplete,
    startTimer,
    togglePause,
    endSession,
    logHyroxStation,
    completeHyroxRunSegment,
    completeHyroxSimulation,
    saveHyroxElapsed,
  } = useWorkoutSession(workoutId ?? '')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const planQuery = useQuery({
    queryKey: ['plan', userId],
    queryFn: () => fetchActivePlan(userId!),
    enabled: !!userId,
  })

  const checkinsQuery = useQuery({
    queryKey: ['readiness-checkins', userId],
    queryFn: () => fetchRecentCheckins(userId!),
    enabled: !!userId,
  })

  const streak = useMemo(() => {
    const dates = new Set((checkinsQuery.data ?? []).map((c) => c.date))
    return calculateStreak(dates, new Date())
  }, [checkinsQuery.data])

  if (isLoading || !workout || !state) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-text-secondary">Loading session...</p>
      </div>
    )
  }

  if (state.sessionStatus === 'completed') {
    if (!recap) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-background">
          <p className="text-text-secondary">Saving your session...</p>
        </div>
      )
    }

    return (
      <SessionRecap
        stats={recap}
        sessionName={workout.session_name}
        phase={workout.phase}
        weekNumber={workout.week_number}
        totalWeeks={planQuery.data?.total_weeks ?? workout.week_number}
        firstName={profile?.first_name ?? ''}
        streak={streak}
      />
    )
  }

  // HYROX Simulation branch: warm-up runs through the existing flow, then the
  // station sequence takes over, then cooldown resumes the existing flow.
  const isHyroxSimulation = Boolean(workout.hyrox_simulation?.length)
  const warmUpCount = workout.warm_up.length
  const allStationsDone =
    !isHyroxSimulation ||
    (state.hyrox_stations ?? []).every((s) => s.status === 'completed' || s.status === 'skipped')
  const inSimulation =
    isHyroxSimulation &&
    state.hyrox_stations != null &&
    state.hyrox_stations.length > 0 &&
    state.currentExerciseIndex >= warmUpCount &&
    !allStationsDone

  function handleExit() {
    if (window.confirm('Pause and exit this session? Your progress has been saved.')) {
      navigate('/workouts')
    }
  }

  if (inSimulation) {
    return (
      <>
        <HyroxSimulationFlow
          stations={state.hyrox_stations!}
          currentIndex={state.current_station_index ?? 0}
          state={state}
          workout={workout}
          profile={profile}
          onCompleteRunSegment={completeHyroxRunSegment}
          onLogStation={logHyroxStation}
          onCompleteSimulation={completeHyroxSimulation}
          saveElapsed={saveHyroxElapsed}
          togglePause={togglePause}
          onExit={handleExit}
        />
        {pbFlash && (
          <>
            <Confetti />
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-green-500/30">
              <p className="text-4xl font-extrabold text-white">PERSONAL BEST!</p>
            </div>
          </>
        )}
      </>
    )
  }

  if (!currentExercise) return null

  const block = currentExercise.block
  const durationSeconds = parseDurationSeconds(block.reps)
  const isWork = state.timerType === 'work'
  const isRest = state.timerType === 'rest'

  const showSetLogger = isWork && state.timerRemainingSeconds === 0
  const showStartTimer = isWork && state.timerRemainingSeconds > 0 && !state.timerRunning
  const showResumeRest = isRest && !state.timerRunning

  const ringTotal = isRest ? block.rest_seconds : durationSeconds ?? 1
  const ringColor = isRest ? '#F59E0B' : '#FF5C1A'
  const ringLabel = isRest ? 'Rest' : 'Work'

  let weightBoost: { min: number; max: number } | null = null
  if (state.rpeBoostExerciseIndexes.includes(state.currentExerciseIndex)) {
    const firstSet = state.completedSets.find(
      (s) => s.exerciseIndex === state.currentExerciseIndex && s.setIndex === 0,
    )
    if (firstSet) weightBoost = suggestedWeightIncrease(firstSet.weight_kg)
  }

  const rpeReduced = state.completedSets.some((s) => s.exerciseIndex === state.currentExerciseIndex && s.rpe >= 9)
  const fatigueTaxOnExercise = state.fatigueTaxActive && isLegExercise(block.name)

  function handlePointerDown(event: React.PointerEvent) {
    touchStartX.current = event.clientX
  }

  function handlePointerUp(event: React.PointerEvent) {
    if (touchStartX.current === null) return
    const delta = event.clientX - touchStartX.current
    touchStartX.current = null

    if (delta <= -SWIPE_THRESHOLD) {
      markExerciseComplete()
    } else if (delta >= SWIPE_THRESHOLD) {
      skipSet()
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col bg-background px-6 py-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleExit}
          aria-label="Exit session"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
        >
          <X size={22} />
        </button>
        <PhaseBadge phase={workout.phase} />
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Exercise list"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
        >
          <List size={22} />
        </button>
      </div>

      {resumeMessage && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-phase-deload/40 bg-phase-deload/10 px-4 py-2 text-sm text-phase-deload">
          <span>{resumeMessage}</span>
          <button type="button" onClick={clearResumeMessage} className="font-semibold">
            ✕
          </button>
        </div>
      )}

      <div
        className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{block.name}</h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Set {currentSetNumber} of {totalSets}
          </p>
        </div>

        {block.coaching_cues[0] && <p className="max-w-xs text-sm text-text-secondary">{block.coaching_cues[0]}</p>}

        <TimerRing remainingSeconds={state.timerRemainingSeconds} totalSeconds={ringTotal} label={ringLabel} color={ringColor}>
          {isWork && state.timerRemainingSeconds === 0 && (
            <span className="text-lg font-semibold text-text-primary">Ready</span>
          )}
        </TimerRing>

        <div className="flex w-full max-w-sm flex-col gap-2">
          {weightBoost && (
            <Chip tone="positive">
              RPE was low — try {weightBoost.min}-{weightBoost.max}kg on remaining sets
            </Chip>
          )}
          {(rpeReduced || fatigueTaxOnExercise) && <Chip tone="warning">Fatigue Tax Active</Chip>}
        </div>

        <div className="w-full max-w-sm">
          {showStartTimer && <Button onClick={startTimer}>Start ({durationSeconds}s)</Button>}
          {showResumeRest && <Button onClick={startTimer}>Tap to resume</Button>}
          {showSetLogger && <SetLogger defaultReps={typeof block.reps === 'number' ? block.reps : null} onLogSet={logSet} />}
        </div>

        <p className="text-xs text-text-muted">Swipe left to mark exercise complete · swipe right to skip set</p>
      </div>

      <div className="sticky bottom-0 left-0 right-0 flex gap-3 border-t border-border bg-background pt-4 pb-2">
        <Button variant="outline" onClick={togglePause} className="flex-1">
          {state.isPaused ? <Play size={18} /> : <Pause size={18} />}
          {state.isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button variant="outline" onClick={endSession} className="flex-1">
          End Session
        </Button>
      </div>

      <ExerciseSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} exercises={flatExercises} state={state} />

      {pbFlash && (
        <>
          <Confetti />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-green-500/30">
            <p className="text-4xl font-extrabold text-white">PERSONAL BEST!</p>
          </div>
        </>
      )}
    </div>
  )
}
