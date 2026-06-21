import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { List, Pause, Play, X } from 'lucide-react'
import { Button } from '@/components/Button'
import { PhaseBadge } from '@/components/dashboard/PhaseBadge'
import { Chip } from '@/components/session/Chip'
import { Confetti } from '@/components/session/Confetti'
import { ExerciseSidebar } from '@/components/session/ExerciseSidebar'
import { ReadinessGate } from '@/components/session/ReadinessGate'
import { SessionRecap } from '@/components/session/SessionRecap'
import { SetLogger } from '@/components/session/SetLogger'
import { TimerRing } from '@/components/session/TimerRing'
import { HyroxSimulationFlow } from '@/components/workout/HyroxSimulationFlow'
import { useAuthStore } from '@/store/authStore'
import { useWorkoutSession } from '@/hooks/useWorkoutSession'
import { adaptSessionForReadiness } from '@/lib/dashboard/adaptSession'
import { fetchActivePlan, fetchRecentCheckins } from '@/lib/dashboard/queries'
import { calculateStreak } from '@/lib/dashboard/streak'
import { isLegExercise } from '@/lib/session/fatigueTax'
import { parseDurationSeconds } from '@/lib/session/flattenExercises'
import { fetchWorkoutById } from '@/lib/session/queries'
import { suggestedWeightIncrease } from '@/lib/session/rpeAdaptation'
import { loadActiveSession } from '@/lib/session/sessionStorage'
import { kwaziOverrideKey, type KwaziOverridePayload } from '@/lib/kwazi/workoutAdaptation'
import type { Workout } from '@/types/plan.types'

const SWIPE_THRESHOLD = 60

function readinessOverrideKey(workoutId: string): string {
  return `gryt_readiness_override_${workoutId}`
}

export function WorkoutSession() {
  const { workoutId } = useParams<{ workoutId: string }>()
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const profile = useAuthStore((state) => state.profile)
  const userId = session?.user.id ?? null

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

  // Same query key the hook itself uses internally — React Query dedupes
  // this to a single network request, not an extra fetch. We need our own
  // copy here so the readiness gate can be computed before the active
  // session is allowed to initialise.
  const rawWorkoutQuery = useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => fetchWorkoutById(workoutId!),
    enabled: !!workoutId,
  })
  const rawWorkout = rawWorkoutQuery.data ?? null

  const todayReadinessScore = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10)
    return (checkinsQuery.data ?? []).find((c) => c.date === todayIso)?.score ?? null
  }, [checkinsQuery.data])

  const { adaptedSession, adaptation } = useMemo(() => {
    if (!rawWorkout) return { adaptedSession: null, adaptation: { type: 'none' as const } }
    return adaptSessionForReadiness(rawWorkout, todayReadinessScore)
  }, [rawWorkout, todayReadinessScore])

  const overrideKey = workoutId ? readinessOverrideKey(workoutId) : ''
  const hasStoredOverride = overrideKey ? sessionStorage.getItem(overrideKey) === 'true' : false

  // Kwazi override takes priority over readiness adaptation — it's more
  // specific and was explicitly requested by the user. Stored under
  // localStorage (not sessionStorage) keyed by date, since a user who told
  // Kwazi about a sore knee this morning should still see the adapted
  // session this evening, unlike the readiness override's per-tab lifetime.
  const todayIsoForKwazi = new Date().toISOString().slice(0, 10)
  const kwaziKey = workoutId ? kwaziOverrideKey(workoutId, todayIsoForKwazi) : ''

  function readKwaziOverride(): KwaziOverridePayload | null {
    if (!kwaziKey) return null
    const raw = localStorage.getItem(kwaziKey)
    console.log('[WorkoutSession] checking Kwazi override — key:', kwaziKey, 'found:', raw)
    if (!raw) return null
    try {
      return JSON.parse(raw) as KwaziOverridePayload
    } catch {
      return null
    }
  }

  const [kwaziOverridePayload, setKwaziOverridePayload] = useState<KwaziOverridePayload | null>(() => readKwaziOverride())

  useEffect(() => {
    // Re-check on mount/key-change (covers normal navigation), on a
    // cross-tab storage write, and on visibility change (covers PWA
    // backgrounding/foregrounding or any same-tab path that doesn't force a
    // full remount) — a plain useMemo on [kwaziKey] only ever re-reads if
    // this component happens to remount, which isn't guaranteed.
    setKwaziOverridePayload(readKwaziOverride())

    function handlePotentialChange() {
      setKwaziOverridePayload(readKwaziOverride())
    }

    window.addEventListener('storage', handlePotentialChange)
    document.addEventListener('visibilitychange', handlePotentialChange)
    return () => {
      window.removeEventListener('storage', handlePotentialChange)
      document.removeEventListener('visibilitychange', handlePotentialChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kwaziKey])

  const existingLocalSession = userId ? loadActiveSession(userId) : null
  const isResumingThisWorkout =
    existingLocalSession?.workoutId === workoutId && existingLocalSession?.sessionStatus === 'in_progress'

  // Gate-choice state for the two hard-gate tiers — only relevant on a fresh
  // (non-resuming) load. 'pending' blocks the active session from
  // initialising at all (see effectiveWorkout below).
  const [recoveryGateChoice, setRecoveryGateChoice] = useState<'pending' | 'recovery' | 'original'>('pending')
  const [restGateConfirmed, setRestGateConfirmed] = useState(false)
  const [kwaziChangesVisible, setKwaziChangesVisible] = useState(false)

  const effectiveWorkout = useMemo<Workout | null>(() => {
    if (!rawWorkout) return null

    // Kwazi override wins outright, before any readiness gating — including
    // over an in-progress resume, since "Apply to today's session" is an
    // explicit, fresh user action that should take effect immediately.
    if (kwaziOverridePayload) return kwaziOverridePayload.workout

    if (isResumingThisWorkout && existingLocalSession) {
      // Reconstruct whichever variant was active when this session started,
      // so flatExercises lines up with the persisted exercise indices.
      if (existingLocalSession.sessionName === adaptedSession?.session_name && adaptation.type === 'recovery_substitution') {
        return adaptedSession as Workout
      }
      if (hasStoredOverride) return rawWorkout
      if (adaptation.type === 'reduced_volume') return (adaptedSession as Workout) ?? rawWorkout
      return rawWorkout
    }

    if (hasStoredOverride) return rawWorkout

    switch (adaptation.type) {
      case 'none':
        return rawWorkout
      case 'reduced_volume':
        return (adaptedSession as Workout) ?? rawWorkout
      case 'recovery_substitution':
        if (recoveryGateChoice === 'recovery') return adaptedSession as Workout
        if (recoveryGateChoice === 'original') return rawWorkout
        return null // gate still pending
      case 'rest_recommended':
        return restGateConfirmed ? rawWorkout : null // gate still pending
    }
  }, [
    rawWorkout,
    kwaziOverridePayload,
    isResumingThisWorkout,
    existingLocalSession,
    hasStoredOverride,
    adaptation,
    adaptedSession,
    recoveryGateChoice,
    restGateConfirmed,
  ])

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
  } = useWorkoutSession(workoutId ?? '', effectiveWorkout)

  function handleOverrideReducedVolume() {
    if (!overrideKey) return
    sessionStorage.setItem(overrideKey, 'true')
    // Reload rather than swap state in place — the active session's
    // in-memory exercise indices are built against whichever workout variant
    // initialised it, so switching mid-flight without a fresh init would
    // desync currentExerciseIndex/completedSets from the new exercise list.
    window.location.reload()
  }

  function handleUseOriginalKwazi() {
    if (!kwaziKey) return
    try {
      localStorage.removeItem(kwaziKey)
    } catch {
      // ignore storage failures
    }
    window.location.reload()
  }

  function handleStartRecovery() {
    setRecoveryGateChoice('recovery')
  }

  function handleContinueOriginal() {
    if (overrideKey) sessionStorage.setItem(overrideKey, 'true')
    setRecoveryGateChoice('original')
  }

  function handleConfirmTrainAnyway() {
    if (overrideKey) sessionStorage.setItem(overrideKey, 'true')
    setRestGateConfirmed(true)
  }

  const streak = useMemo(() => {
    const dates = new Set((checkinsQuery.data ?? []).map((c) => c.date))
    return calculateStreak(dates, new Date())
  }, [checkinsQuery.data])

  if (rawWorkoutQuery.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-text-secondary">Loading session...</p>
      </div>
    )
  }

  // Hard gates — take priority over the active session's own loading state,
  // since effectiveWorkout is intentionally null while these are pending.
  const gateIsPending = !isResumingThisWorkout && !hasStoredOverride
  if (gateIsPending && rawWorkout && adaptation.type === 'recovery_substitution' && recoveryGateChoice === 'pending') {
    return (
      <ReadinessGate
        mode="recovery_substitution"
        score={todayReadinessScore ?? 0}
        onStartRecovery={handleStartRecovery}
        onContinueOriginal={handleContinueOriginal}
      />
    )
  }
  if (gateIsPending && rawWorkout && adaptation.type === 'rest_recommended' && !restGateConfirmed) {
    return (
      <ReadinessGate mode="rest_recommended" score={todayReadinessScore ?? 0} onConfirmTrainAnyway={handleConfirmTrainAnyway} />
    )
  }

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

      {kwaziOverridePayload && (
        <div className="mt-4 rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-text-secondary">
          <p>
            Session adapted by Kwazi based on how you&apos;re feeling today.{' '}
            <button
              type="button"
              onClick={() => setKwaziChangesVisible((v) => !v)}
              className="font-semibold text-text-primary hover:underline"
            >
              View changes
            </button>{' '}
            <button type="button" onClick={handleUseOriginalKwazi} className="font-semibold text-text-primary hover:underline">
              Use original
            </button>
          </p>
          {kwaziChangesVisible && <p className="mt-2 text-text-secondary">{kwaziOverridePayload.reason}</p>}
        </div>
      )}

      {!kwaziOverridePayload && !isResumingThisWorkout && !hasStoredOverride && adaptation.type === 'reduced_volume' && (
        <div className="mt-4 rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-text-secondary">
          Your readiness score is {todayReadinessScore} today — we&apos;ve lightened today&apos;s load to match how
          you&apos;re feeling. Sets and intensity have been reduced.{' '}
          <button type="button" onClick={handleOverrideReducedVolume} className="font-semibold text-text-primary hover:underline">
            Override — use original plan
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
