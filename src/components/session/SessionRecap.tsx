import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { PhaseBadge } from '@/components/dashboard/PhaseBadge'
import { BadgeUnlockOverlay } from '@/components/gamification/BadgeUnlockOverlay'
import { shareWorkoutCard } from '@/lib/session/shareCard'
import type { Phase } from '@/types/plan.types'
import type { RecapStats } from '@/types/session.types'

interface SessionRecapProps {
  stats: RecapStats
  sessionName: string
  phase: Phase
  weekNumber: number
  totalWeeks: number
  firstName: string
  streak: number
}

export function SessionRecap({ stats, sessionName, phase, weekNumber, totalWeeks, firstName, streak }: SessionRecapProps) {
  const navigate = useNavigate()
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'copied'>('idle')
  const [badgeQueue, setBadgeQueue] = useState(stats.unlockedBadges)

  async function handleShare() {
    setShareState('sharing')
    try {
      await shareWorkoutCard({
        firstName,
        sessionName,
        phase,
        setsCompleted: stats.isHyroxSimulation ? (stats.hyroxStationsCompleted ?? 0) : stats.completedSets,
        totalSets: stats.isHyroxSimulation ? (stats.hyroxTotalStations ?? 8) : stats.totalSets,
        pbCount: stats.pbCount,
        streak,
      })
      setShareState(typeof navigator.share === 'function' ? 'idle' : 'copied')
    } catch {
      setShareState('idle')
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-10 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Session Complete</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">{sessionName}</h1>
        <div className="mt-3 flex items-center justify-center gap-2">
          <PhaseBadge phase={phase} />
          <span className="text-sm text-text-secondary">
            Week {weekNumber} of {totalWeeks}
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mt-8 flex flex-col items-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -16 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-5xl font-extrabold text-brand-orange"
        >
          +{stats.xpEarned} XP
        </motion.span>
        {stats.pbCount > 0 && (
          <p className="mt-2 text-sm text-phase-deload">
            Includes {stats.pbCount} personal best{stats.pbCount === 1 ? '' : 's'} (+{stats.pbCount * 50} XP)
          </p>
        )}
      </motion.div>

      {stats.isHyroxSimulation ? (
        <div className="mt-10 grid w-full max-w-xs grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-text-primary">
              {stats.hyroxStationsCompleted}/{stats.hyroxTotalStations}
            </p>
            <p className="text-xs text-text-secondary">Stations completed</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-text-primary">
              {((stats.hyroxTotalRunDistanceM ?? 0) / 1000).toFixed(1)}km
            </p>
            <p className="text-xs text-text-secondary">Total run distance</p>
          </div>
          {stats.hyroxSessionDurationSeconds != null && (
            <div className="col-span-2 rounded-2xl border border-border bg-card p-4">
              <p className="text-2xl font-bold text-text-primary">
                {Math.floor(stats.hyroxSessionDurationSeconds / 60)}m{' '}
                {stats.hyroxSessionDurationSeconds % 60}s
              </p>
              <p className="text-xs text-text-secondary">Session time</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10 grid w-full max-w-xs grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-text-primary">
              {stats.completedSets}/{stats.totalSets}
            </p>
            <p className="text-xs text-text-secondary">Sets completed</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-text-primary">{stats.exerciseCount}</p>
            <p className="text-xs text-text-secondary">Exercises</p>
          </div>
        </div>
      )}

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Button onClick={handleShare} isLoading={shareState === 'sharing'}>
          {shareState === 'copied' ? 'Copied to clipboard' : 'Share'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Done
        </Button>
      </div>

      <BadgeUnlockOverlay
        badge={badgeQueue[0] ?? null}
        onDismiss={() => setBadgeQueue((current) => current.slice(1))}
      />
    </div>
  )
}
