import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, SkipForward, X } from 'lucide-react'
import { Button } from '@/components/Button'
import { TimerRing } from '@/components/session/TimerRing'
import { EXERCISE_LIBRARY } from '@/lib/planGeneration/exerciseLibrary'
import { calculateGoalPace, RUNNING_EVENT_TYPES } from '@/lib/planGeneration/calculateGoalPace'
import { pulseVibration } from '@/lib/session/timerFeedback'
import type { Workout } from '@/types/plan.types'
import type { ActiveSessionState, HyroxStationState } from '@/types/session.types'
import type { Profile } from '@/types/profile'
import type { RunningEventType } from '@/lib/planGeneration/calculateGoalPace'

// Maps buildHyroxSimulation station names to EXERCISE_LIBRARY entry names for coaching cue lookup.
const STATION_LIBRARY_MAP: Record<string, string> = {
  SkiErg: 'SkiErg Endurance 1000m',
  'Sled Push': 'Sled Push 6×25m',
  'Sled Pull': 'Sled Pull 6×25m',
  'Burpee Broad Jumps': 'Burpee Broad Jump 4×10',
  Row: 'Rowing Endurance 1000m',
  'Farmers Carry': 'Farmers Carry HYROX 4×50m',
  'Sandbag Lunges': 'Sandbag Lunges HYROX 4×25m',
  'Wall Balls': 'Wall Balls Competition Volume 75 reps',
}

const LOADABLE_STATIONS = new Set(['Sled Push', 'Sled Pull', 'Farmers Carry', 'Sandbag Lunges'])

const RPE_SCALE = Array.from({ length: 10 }, (_, i) => i + 1)

function parseSegmentDistanceM(distanceOrReps: string): number {
  const m = distanceOrReps.match(/^(\d+)m$/i)
  return m ? parseInt(m[1]!, 10) : 0
}

interface HyroxSimulationFlowProps {
  stations: HyroxStationState[]
  currentIndex: number
  state: ActiveSessionState
  workout: Workout
  profile: Profile | null
  onCompleteRunSegment: (index: number, elapsed: number) => void
  onLogStation: (index: number, weight: number | null, reps: number | null, rpe: number) => void
  onCompleteSimulation: () => void
  saveElapsed: (index: number, elapsed: number) => void
  togglePause: () => void
  onExit: () => void
}

export function HyroxSimulationFlow({
  stations,
  currentIndex,
  state,
  profile,
  onCompleteRunSegment,
  onLogStation,
  onCompleteSimulation,
  saveElapsed,
  togglePause,
  onExit,
}: HyroxSimulationFlowProps) {
  const currentStation = stations[currentIndex] ?? null
  const isRunSegment = currentStation?.type === 'run'
  const isStation = currentStation?.type === 'station'
  const isLoadable = LOADABLE_STATIONS.has(currentStation?.name ?? '')

  const [elapsed, setElapsed] = useState<number>(() => currentStation?.elapsed_seconds ?? 0)
  const [weight, setWeight] = useState('')
  const [rpe, setRpe] = useState<number | null>(null)

  // Reset local form state whenever the active station changes.
  useEffect(() => {
    setElapsed(stations[currentIndex]?.elapsed_seconds ?? 0)
    setWeight('')
    setRpe(null)
  }, [currentIndex, stations])

  // Count-up timer for run segments. Stops when paused.
  useEffect(() => {
    if (!isRunSegment || state.isPaused) return
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1
        if (next % 30 === 0) saveElapsed(currentIndex, next)
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunSegment, state.isPaused, currentIndex, saveElapsed])

  // Goal pace for run segments — only shown for running events with a goal time.
  const paceZones = useMemo(() => {
    if (!profile?.event_type || !profile?.goal_time_minutes) return null
    if (!(RUNNING_EVENT_TYPES as readonly string[]).includes(profile.event_type)) return null
    return calculateGoalPace(profile.event_type as RunningEventType, profile.goal_time_minutes)
  }, [profile?.event_type, profile?.goal_time_minutes])

  const distanceM = parseSegmentDistanceM(currentStation?.distance_or_reps ?? '')
  const targetSeconds =
    paceZones && distanceM
      ? Math.round(paceZones.goal_pace_min_per_km * (distanceM / 1000) * 60)
      : null

  // Coaching cue from exercise library for the current station.
  const coachingCue = useMemo(() => {
    if (!isStation || !currentStation) return null
    const libraryName = STATION_LIBRARY_MAP[currentStation.name]
    if (!libraryName) return null
    const entry = EXERCISE_LIBRARY.find((e) => e.name === libraryName)
    return entry?.coaching_cues[0] ?? null
  }, [isStation, currentStation])

  const completedStations = stations.filter((s) => s.type === 'station' && s.status === 'completed').length
  const totalStations = stations.filter((s) => s.type === 'station').length

  function handleCompleteRun() {
    pulseVibration()
    onCompleteRunSegment(currentIndex, elapsed)
  }

  function handleCompleteStation() {
    onLogStation(
      currentIndex,
      isLoadable && weight.trim() !== '' ? Number(weight) : null,
      isLoadable && weight.trim() !== '' ? 1 : null,
      rpe ?? 6,
    )
  }

  const elapsedMins = Math.floor(elapsed / 60)
  const elapsedSecs = elapsed % 60

  return (
    <div className="relative flex min-h-svh flex-col bg-background px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit session"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
        >
          <X size={22} />
        </button>
        <span className="text-sm font-semibold text-text-secondary">
          Segment {currentIndex + 1} of {stations.length}
        </span>
        <button
          type="button"
          onClick={onCompleteSimulation}
          aria-label="Skip to cooldown"
          title="Skip remaining stations"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Progress strip — alternating blue (run) / orange (station) dots */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {stations.map((s, i) => {
          const done = s.status === 'completed' || s.status === 'skipped'
          const current = i === currentIndex
          const isRun = s.type === 'run'
          const baseColor = isRun ? 'bg-blue-400' : 'bg-brand-orange'
          const pendingColor = isRun ? 'border border-blue-900 bg-blue-950' : 'border border-border bg-elevated'
          return (
            <div
              key={s.order}
              className={[
                'h-2 w-2 rounded-full transition-all duration-200',
                done ? baseColor : current ? `${baseColor} ring-2 ring-offset-1 ring-offset-background ${isRun ? 'ring-blue-400' : 'ring-brand-orange'}` : pendingColor,
              ].join(' ')}
            />
          )
        })}
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
        {!currentStation && (
          <p className="text-text-secondary">All segments complete — tap Skip to proceed.</p>
        )}

        {isRunSegment && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Run</p>
            <h1 className="text-5xl font-extrabold text-text-primary">{currentStation.distance_or_reps}</h1>

            <TimerRing
              remainingSeconds={elapsed}
              totalSeconds={targetSeconds ?? 3600}
              label="Elapsed"
              color="#3B82F6"
            >
              <span className="text-4xl font-bold text-text-primary">
                {elapsedMins}:{elapsedSecs.toString().padStart(2, '0')}
              </span>
              <span className="mt-1 text-sm font-semibold uppercase tracking-wide text-text-secondary">Elapsed</span>
            </TimerRing>

            {targetSeconds !== null && (
              <p className="text-sm text-text-secondary">
                Target: {Math.floor(targetSeconds / 60)}:{(targetSeconds % 60).toString().padStart(2, '0')} for this segment
              </p>
            )}

            <div className="w-full max-w-sm">
              <Button onClick={handleCompleteRun}>Complete Run Segment</Button>
            </div>
          </>
        )}

        {isStation && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Station</p>
            <h1 className="text-3xl font-bold text-text-primary">{currentStation.name}</h1>
            <p className="text-xl font-semibold text-text-secondary">{currentStation.distance_or_reps}</p>

            {coachingCue && <p className="max-w-xs text-sm text-text-secondary">{coachingCue}</p>}

            <div className="w-full max-w-sm space-y-4">
              {isLoadable && (
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Weight (kg)
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-xl border border-border bg-elevated px-3 py-2 text-lg font-semibold text-text-primary focus:border-brand-orange focus:outline-none"
                    placeholder="0"
                  />
                </label>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">RPE</p>
                <div className="grid grid-cols-5 gap-2">
                  {RPE_SCALE.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRpe(value)}
                      aria-pressed={rpe === value}
                      className={`flex h-10 items-center justify-center rounded-xl border text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
                        rpe === value
                          ? 'border-brand-orange bg-brand-orange text-white'
                          : 'border-border bg-elevated text-text-primary hover:border-text-secondary'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleCompleteStation} disabled={rpe === null}>
                Complete Station
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 flex items-center gap-3 border-t border-border bg-background pt-4 pb-2">
        <Button variant="outline" onClick={togglePause} className="flex-1">
          {state.isPaused ? <Play size={18} /> : <Pause size={18} />}
          {state.isPaused ? 'Resume' : 'Pause'}
        </Button>
        <span className="text-xs font-medium text-text-secondary">
          {completedStations}/{totalStations} stations
        </span>
      </div>
    </div>
  )
}
