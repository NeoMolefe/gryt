import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { flattenExercises, parseDurationSeconds } from '@/lib/session/flattenExercises'
import { parseDistanceKm } from '@/lib/session/fatigueTax'
import { shouldSuggestWeightIncrease } from '@/lib/session/rpeAdaptation'
import {
  checkFatigueTax,
  completeSessionLog,
  createSessionLog,
  fetchBestVolumes,
  fetchWorkoutById,
  writeProgressLogs,
  writeHyroxLogs,
} from '@/lib/session/queries'
import { applyXpDelta, hasAnyPriorPb } from '@/lib/gamification/queries'
import { evaluateSessionGamification } from '@/lib/gamification/sessionEvents'
import { setPendingXp } from '@/lib/gamification/pendingXp'
import { createNotificationIfEnabled } from '@/lib/notifications/queries'
import { loadActiveSession, saveActiveSession, clearActiveSession } from '@/lib/session/sessionStorage'
import { playRestEndBeep, pulseVibration } from '@/lib/session/timerFeedback'
import type { ActiveSessionState, FlatExercise, HyroxStationState, RecapStats } from '@/types/session.types'
import type { HyroxSimulationStation } from '@/types/plan.types'
import type { UnlockedBadge } from '@/types/gamification.types'

const SESSION_XP = 100
const PB_XP = 50

function workTimerFor(exercise: FlatExercise | undefined): { remaining: number; running: boolean } {
  const duration = exercise ? parseDurationSeconds(exercise.block.reps) : null
  return { remaining: duration ?? 0, running: false }
}

function createFreshState(
  userId: string,
  workoutId: string,
  sessionName: string,
  flat: FlatExercise[],
  hyroxSimulation?: HyroxSimulationStation[] | null,
): ActiveSessionState {
  const work = workTimerFor(flat[0])
  const now = new Date().toISOString()

  const hyrox_stations: HyroxStationState[] | null =
    hyroxSimulation?.length
      ? hyroxSimulation.map((s) => ({
          order: s.order,
          type: s.type,
          name: s.name,
          distance_or_reps: s.distance_or_reps,
          status: 'pending' as const,
          logged_weight: null,
          logged_reps: null,
          rpe: null,
          elapsed_seconds: 0,
          is_pb: false,
        }))
      : null

  return {
    userId,
    workoutId,
    sessionLogId: null,
    sessionName,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    timerType: 'work',
    timerRemainingSeconds: work.remaining,
    timerRunning: work.running,
    completedSets: [],
    skippedSets: [],
    sessionStatus: 'in_progress',
    isPaused: false,
    fatigueTaxActive: false,
    rpeBoostExerciseIndexes: [],
    startedAt: now,
    updatedAt: now,
    hyrox_stations,
    current_station_index: hyrox_stations ? 0 : null,
  }
}

function parseSegmentDistanceM(distanceOrReps: string): number {
  const m = distanceOrReps.match(/^(\d+)m$/i)
  return m ? parseInt(m[1]!, 10) : 0
}

export function useWorkoutSession(workoutId: string) {
  const userId = useAuthStore((state) => state.session?.user.id ?? null)
  const profile = useAuthStore((state) => state.profile)
  const refreshProfile = useAuthStore((state) => state.refreshProfile)

  const workoutQuery = useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => fetchWorkoutById(workoutId),
    enabled: !!workoutId,
  })

  const workout = workoutQuery.data ?? null
  const flatExercises = useMemo(() => (workout ? flattenExercises(workout) : []), [workout])

  const [state, setState] = useState<ActiveSessionState | null>(null)
  const [resumeMessage, setResumeMessage] = useState<string | null>(null)
  const [pbFlash, setPbFlash] = useState(false)
  const [recap, setRecap] = useState<RecapStats | null>(null)

  const bestVolumesRef = useRef<Record<string, number>>({})
  const initedRef = useRef(false)
  const stateRef = useRef<ActiveSessionState | null>(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Initialise session state once the workout has loaded.
  useEffect(() => {
    if (!workout || !userId || initedRef.current) return
    initedRef.current = true

    void (async () => {
      const flat = flattenExercises(workout)
      const exerciseNames = flat.map((f) => f.block.name)

      // For HYROX sessions, also prefetch best volumes for station names so PB
      // detection works for loadable movements (Sled Push, Farmers Carry, etc.).
      const hyroxStationNames = workout.hyrox_simulation
        ? workout.hyrox_simulation.filter((s) => s.type === 'station').map((s) => s.name)
        : []

      const [bestVolumes, fatigueTaxActive] = await Promise.all([
        fetchBestVolumes(userId, [...exerciseNames, ...hyroxStationNames]),
        checkFatigueTax(userId),
      ])
      bestVolumesRef.current = bestVolumes

      const existing = loadActiveSession(userId)

      if (existing && existing.workoutId === workoutId && existing.sessionStatus === 'in_progress') {
        const restored: ActiveSessionState = {
          ...existing,
          isPaused: false,
          timerRunning: existing.timerType === 'rest' ? false : workTimerFor(flat[existing.currentExerciseIndex]).running,
          timerRemainingSeconds:
            existing.timerType === 'rest'
              ? existing.timerRemainingSeconds
              : workTimerFor(flat[existing.currentExerciseIndex]).remaining,
        }
        setState(restored)
        setResumeMessage(`Session resumed — ${existing.completedSets.length} set${existing.completedSets.length === 1 ? '' : 's'} already logged.`)
        saveActiveSession(restored)
        return
      }

      const fresh = createFreshState(userId, workoutId, workout.session_name, flat, workout.hyrox_simulation)
      fresh.fatigueTaxActive = fatigueTaxActive

      const sessionLog = await createSessionLog(userId, workout)
      fresh.sessionLogId = sessionLog?.id ?? null

      setState(fresh)
      saveActiveSession(fresh)
    })()
  }, [workout, userId, workoutId])

  const persist = useCallback((next: ActiveSessionState) => {
    setState(next)
    saveActiveSession(next)
  }, [])

  const effectiveSets = useCallback(
    (exerciseIndex: number): number => {
      const fe = flatExercises[exerciseIndex]
      if (!fe) return 0
      const reduced = state?.completedSets.find((s) => s.exerciseIndex === exerciseIndex && s.rpe >= 9)
      if (reduced) return Math.min(fe.block.sets, reduced.setIndex + 1)
      return fe.block.sets
    },
    [flatExercises, state],
  )

  // Completion: write progress logs + award XP once.
  useEffect(() => {
    if (!state || !userId || !workout || state.sessionStatus !== 'completed' || recap) return

    void (async () => {
      const isHyrox = Boolean(workout.hyrox_simulation?.length)
      const exerciseNames = flatExercises.map((f) => f.block.name)
      const distanceKmByExerciseIndex: Record<number, number | null> = {}
      flatExercises.forEach((fe, index) => {
        distanceKmByExerciseIndex[index] = parseDistanceKm(fe.block.reps) ?? parseDistanceKm(fe.block.name)
      })

      const hyroxStations = state.hyrox_stations ?? []
      const hyroxPbCount = hyroxStations.filter((s) => s.is_pb).length
      const pbCount = state.completedSets.filter((s) => s.isPB).length + hyroxPbCount
      const xpEarned = SESSION_XP + pbCount * PB_XP
      const currentXp = profile?.xp_total ?? 0

      let totalXpEarned = xpEarned
      let unlockedBadges: UnlockedBadge[] = []

      try {
        const hadPriorPb = pbCount > 0 ? await hasAnyPriorPb(userId) : false

        await writeProgressLogs({
          userId,
          workoutId,
          exerciseNames,
          completedSets: state.completedSets,
          distanceKmByExerciseIndex,
          currentXp,
          xpEarned,
        })

        if (isHyrox) {
          const stationLogs = hyroxStations
            .filter((s) => s.type === 'station' && s.status === 'completed' && s.logged_weight != null)
            .map((s) => ({
              exercise_name: s.name,
              weight_kg: s.logged_weight ?? 0,
              reps: s.logged_reps ?? 1,
              rpe: s.rpe ?? 6,
              is_pb: s.is_pb ?? false,
            }))

          const totalRunDistanceM = hyroxStations
            .filter((s) => s.type === 'run' && s.status === 'completed')
            .reduce((sum, s) => sum + parseSegmentDistanceM(s.distance_or_reps), 0)

          await writeHyroxLogs(userId, workoutId, stationLogs, totalRunDistanceM / 1000)
        }

        if (state.sessionLogId) {
          await completeSessionLog(state.sessionLogId)
        }

        if (pbCount > 0) {
          await createNotificationIfEnabled(
            userId,
            'personal_best',
            'New personal best!',
            `You set ${pbCount} new personal best${pbCount === 1 ? '' : 's'} in ${workout.session_name}.`,
          )
        }

        const result = await evaluateSessionGamification({ userId, workout, pbCount, hadPriorPb })
        unlockedBadges = result.unlockedBadges

        if (result.bonusXp > 0) {
          await applyXpDelta(userId, currentXp + xpEarned, result.bonusXp)
        }

        totalXpEarned = xpEarned + result.bonusXp
        setPendingXp(userId, totalXpEarned)

        await refreshProfile()
      } catch (error) {
        console.error('Failed to finalise session:', error)
      }

      clearActiveSession(userId)

      if (isHyrox) {
        const hyroxStationsCompleted = hyroxStations.filter((s) => s.type === 'station' && s.status === 'completed').length
        const hyroxTotalStations = hyroxStations.filter((s) => s.type === 'station').length
        const hyroxTotalRunDistanceM = hyroxStations
          .filter((s) => s.type === 'run' && s.status === 'completed')
          .reduce((sum, s) => sum + parseSegmentDistanceM(s.distance_or_reps), 0)
        const hyroxSessionDurationSeconds = Math.floor(
          (Date.now() - new Date(state.startedAt).getTime()) / 1000,
        )

        setRecap({
          totalSets: flatExercises.reduce((sum, fe) => sum + fe.block.sets, 0),
          completedSets: state.completedSets.length,
          exerciseCount: flatExercises.length,
          pbCount,
          xpEarned: totalXpEarned,
          unlockedBadges,
          isHyroxSimulation: true,
          hyroxStationsCompleted,
          hyroxTotalStations,
          hyroxTotalRunDistanceM,
          hyroxSessionDurationSeconds,
        })
      } else {
        setRecap({
          totalSets: flatExercises.reduce((sum, fe) => sum + fe.block.sets, 0),
          completedSets: state.completedSets.length,
          exerciseCount: flatExercises.length,
          pbCount,
          xpEarned: totalXpEarned,
          unlockedBadges,
        })
      }
    })()
  }, [state, userId, workout, flatExercises, profile, recap, workoutId, refreshProfile])

  // Timer tick.
  useEffect(() => {
    if (!state || state.isPaused || !state.timerRunning || state.sessionStatus !== 'in_progress') return

    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev) return prev
        const remaining = prev.timerRemainingSeconds - 1

        if (remaining > 0) {
          const next = { ...prev, timerRemainingSeconds: remaining }
          if (prev.timerType === 'rest' && remaining % 30 === 0) {
            saveActiveSession(next)
          }
          return next
        }

        playRestEndBeep()
        pulseVibration()

        if (prev.timerType === 'rest') {
          const fe = flatExercises[prev.currentExerciseIndex]
          const currentEffectiveSets = fe
            ? (prev.completedSets.find((s) => s.exerciseIndex === prev.currentExerciseIndex && s.rpe >= 9)?.setIndex ?? Infinity) + 1
            : 0
          const maxSets = fe ? Math.min(fe.block.sets, currentEffectiveSets) : 0

          let nextExerciseIndex = prev.currentExerciseIndex
          let nextSetIndex = prev.currentSetIndex + 1

          if (nextSetIndex >= maxSets) {
            nextExerciseIndex += 1
            nextSetIndex = 0
          }

          if (nextExerciseIndex >= flatExercises.length) {
            const completed: ActiveSessionState = { ...prev, sessionStatus: 'completed', timerRunning: false }
            saveActiveSession(completed)
            return completed
          }

          const work = workTimerFor(flatExercises[nextExerciseIndex])
          const next: ActiveSessionState = {
            ...prev,
            currentExerciseIndex: nextExerciseIndex,
            currentSetIndex: nextSetIndex,
            timerType: 'work',
            timerRemainingSeconds: work.remaining,
            timerRunning: work.running,
          }
          saveActiveSession(next)
          return next
        }

        const next: ActiveSessionState = { ...prev, timerRunning: false }
        saveActiveSession(next)
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state, flatExercises])

  // Page Visibility + beforeunload synchronous saves.
  useEffect(() => {
    function handleSave() {
      if (stateRef.current) saveActiveSession(stateRef.current)
    }

    document.addEventListener('visibilitychange', handleSave)
    window.addEventListener('beforeunload', handleSave)

    return () => {
      document.removeEventListener('visibilitychange', handleSave)
      window.removeEventListener('beforeunload', handleSave)
    }
  }, [])

  const logSet = useCallback(
    (weightKg: number, reps: number, rpe: number) => {
      if (!state) return
      const exerciseIndex = state.currentExerciseIndex
      const setIndex = state.currentSetIndex
      const fe = flatExercises[exerciseIndex]
      if (!fe) return

      const volume = weightKg * reps
      const best = bestVolumesRef.current[fe.block.name] ?? 0
      const isPB = best > 0 && volume > best
      if (volume > best) bestVolumesRef.current[fe.block.name] = volume

      if (isPB) {
        setPbFlash(true)
        setTimeout(() => setPbFlash(false), 1800)
      }

      const rpeBoostExerciseIndexes = [...state.rpeBoostExerciseIndexes]
      if (shouldSuggestWeightIncrease(rpe, fe.isCompound, setIndex) && !rpeBoostExerciseIndexes.includes(exerciseIndex)) {
        rpeBoostExerciseIndexes.push(exerciseIndex)
      }

      const next: ActiveSessionState = {
        ...state,
        completedSets: [
          ...state.completedSets,
          { exerciseIndex, setIndex, weight_kg: weightKg, reps, rpe, isPB, loggedAt: new Date().toISOString() },
        ],
        rpeBoostExerciseIndexes,
        timerType: 'rest',
        timerRemainingSeconds: fe.block.rest_seconds,
        timerRunning: true,
      }

      persist(next)
    },
    [state, flatExercises, persist],
  )

  const skipSet = useCallback(() => {
    if (!state) return
    const fe = flatExercises[state.currentExerciseIndex]
    if (!fe) return

    const next: ActiveSessionState = {
      ...state,
      skippedSets: [...state.skippedSets, { exerciseIndex: state.currentExerciseIndex, setIndex: state.currentSetIndex }],
      timerType: 'rest',
      timerRemainingSeconds: Math.min(fe.block.rest_seconds, 10),
      timerRunning: true,
    }

    persist(next)
  }, [state, flatExercises, persist])

  const markExerciseComplete = useCallback(() => {
    if (!state) return
    const nextExerciseIndex = state.currentExerciseIndex + 1

    if (nextExerciseIndex >= flatExercises.length) {
      persist({ ...state, sessionStatus: 'completed', timerRunning: false })
      return
    }

    const work = workTimerFor(flatExercises[nextExerciseIndex])
    persist({
      ...state,
      currentExerciseIndex: nextExerciseIndex,
      currentSetIndex: 0,
      timerType: 'work',
      timerRemainingSeconds: work.remaining,
      timerRunning: work.running,
    })
  }, [state, flatExercises, persist])

  const startTimer = useCallback(() => {
    if (!state) return
    persist({ ...state, timerRunning: true })
  }, [state, persist])

  const togglePause = useCallback(() => {
    if (!state) return
    persist({ ...state, isPaused: !state.isPaused })
  }, [state, persist])

  const endSession = useCallback(() => {
    if (!state) return
    persist({ ...state, sessionStatus: 'completed', timerRunning: false })
  }, [state, persist])

  // ── HYROX simulation actions ──

  // Saves elapsed run seconds directly to localStorage without a React re-render.
  // Called by HyroxSimulationFlow every 30 seconds during an active run segment.
  const saveHyroxElapsed = useCallback((stationIndex: number, elapsedSeconds: number) => {
    const current = stateRef.current
    if (!current?.hyrox_stations) return
    const stations = [...current.hyrox_stations]
    const station = stations[stationIndex]
    if (!station) return
    stations[stationIndex] = { ...station, elapsed_seconds: elapsedSeconds }
    saveActiveSession({ ...current, hyrox_stations: stations })
  }, [])

  const completeHyroxRunSegment = useCallback(
    (stationIndex: number, elapsedSeconds: number) => {
      if (!state?.hyrox_stations) return
      const stations = [...state.hyrox_stations]
      const station = stations[stationIndex]
      if (!station) return
      stations[stationIndex] = { ...station, status: 'completed', elapsed_seconds: elapsedSeconds }
      const nextIndex = stationIndex + 1
      persist({
        ...state,
        hyrox_stations: stations,
        current_station_index: nextIndex < stations.length ? nextIndex : stationIndex,
      })
    },
    [state, persist],
  )

  const logHyroxStation = useCallback(
    (stationIndex: number, weightKg: number | null, reps: number | null, rpe: number): boolean => {
      if (!state?.hyrox_stations) return false
      const stations = [...state.hyrox_stations]
      const station = stations[stationIndex]
      if (!station) return false

      let isPB = false
      if (weightKg !== null && reps !== null) {
        const volume = weightKg * reps
        const best = bestVolumesRef.current[station.name] ?? 0
        isPB = best > 0 && volume > best
        if (volume > best) bestVolumesRef.current[station.name] = volume
        if (isPB) {
          setPbFlash(true)
          setTimeout(() => setPbFlash(false), 1800)
        }
      }

      stations[stationIndex] = {
        ...station,
        status: 'completed',
        logged_weight: weightKg,
        logged_reps: reps,
        rpe,
        is_pb: isPB,
      }
      const nextIndex = stationIndex + 1
      persist({
        ...state,
        hyrox_stations: stations,
        current_station_index: nextIndex < stations.length ? nextIndex : stationIndex,
      })
      return isPB
    },
    [state, persist],
  )

  // Marks all remaining stations as skipped — used when the user chooses to
  // skip to cooldown from within the simulation flow.
  const completeHyroxSimulation = useCallback(() => {
    if (!state?.hyrox_stations) return
    const stations = state.hyrox_stations.map((s) =>
      s.status === 'pending' || s.status === 'in_progress' ? { ...s, status: 'skipped' as const } : s,
    )
    persist({ ...state, hyrox_stations: stations, current_station_index: null })
  }, [state, persist])

  const currentExercise = state ? flatExercises[state.currentExerciseIndex] ?? null : null
  const totalSets = state ? effectiveSets(state.currentExerciseIndex) : 0

  return {
    isLoading: workoutQuery.isLoading || !state,
    workout,
    flatExercises,
    state,
    currentExercise,
    currentSetNumber: state ? state.currentSetIndex + 1 : 0,
    totalSets,
    resumeMessage,
    clearResumeMessage: () => setResumeMessage(null),
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
  }
}
