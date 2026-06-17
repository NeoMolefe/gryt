import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { eventTypeLabel } from '@/lib/onboarding/options'
import { useAuthStore } from '@/store/authStore'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useNotifications } from '@/hooks/useNotifications'
import { RECOVERY_TIPS } from '@/lib/dashboard/recoveryTips'
import { getDayOfYear } from '@/lib/dashboard/schedule'
import type { ScheduleDay } from '@/lib/dashboard/schedule'
import { CheckInSheet } from '@/components/dashboard/CheckInSheet'
import { Toast } from '@/components/Toast'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Greeting } from '@/components/dashboard/Greeting'
import { NotificationPanel } from '@/components/dashboard/NotificationPanel'
import { NutritionCard } from '@/components/dashboard/NutritionCard'
import { ReadinessRing } from '@/components/dashboard/ReadinessRing'
import { RecoveryStreakOverlay } from '@/components/dashboard/RecoveryStreakOverlay'
import { ResumeBanner } from '@/components/dashboard/ResumeBanner'
import { RestDayCard } from '@/components/dashboard/RestDayCard'
import { SessionPreviewSheet } from '@/components/dashboard/SessionPreviewSheet'
import { StatsRow } from '@/components/dashboard/StatsRow'
import { WeeklyScheduleStrip } from '@/components/dashboard/WeeklyScheduleStrip'
import { WorkoutCard } from '@/components/dashboard/WorkoutCard'
import { XpFloat } from '@/components/dashboard/XpFloat'
import { BadgeUnlockOverlay } from '@/components/gamification/BadgeUnlockOverlay'

function weeksUntilEvent(eventDate: string): number {
  const event = new Date(eventDate)
  const now = new Date()
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((event.getTime() - now.getTime()) / msPerWeek))
}

function getInitials(firstName: string | null | undefined, fullName: string | null | undefined): string {
  const source = firstName || fullName || ''
  const parts = source.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

export function Dashboard() {
  const {
    isLoading,
    profile,
    plan,
    streak,
    todaysWorkout,
    weekSchedule,
    isRestDay,
    mobilityRoutine,
    badge,
    xpTotal,
    todayCheckin,
    sessionLog,
    submitCheckin,
    isSubmittingCheckin,
    abandonSession,
    xpToast,
    unlockedBadge,
    dismissUnlockedBadge,
    recoveryMilestone,
    dismissRecoveryMilestone,
  } = useDashboardData()

  const session = useAuthStore((state) => state.session)
  const { notifications, unreadCount, markRead } = useNotifications(session?.user.id ?? null)

  const location = useLocation()
  const [toastMessage, setToastMessage] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null,
  )

  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [previewDay, setPreviewDay] = useState<ScheduleDay | null>(null)

  if (isLoading || !profile || !plan) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-text-secondary">Loading your dashboard...</p>
      </div>
    )
  }

  const recoveryTip = RECOVERY_TIPS[getDayOfYear() % RECOVERY_TIPS.length]
  const currentPhase = todaysWorkout?.phase ?? weekSchedule.find((d) => d.workout)?.workout?.phase ?? 'foundation'

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="min-h-svh px-6 py-6 pb-24"
    >
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <DashboardHeader
          initials={getInitials(profile.first_name, profile.full_name)}
          hasNotifications={unreadCount > 0}
          onBellClick={() => setIsNotificationsOpen((open) => !open)}
        />

        <Greeting firstName={profile.first_name ?? 'there'} streak={streak} />

        {profile.event_type && profile.event_date && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-elevated px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-wide text-text-muted">Training for</span>
              <span className="text-sm font-semibold text-text-primary">{eventTypeLabel(profile.event_type)}</span>
            </div>
            <span className="text-sm font-medium text-brand-orange">
              {weeksUntilEvent(profile.event_date)} weeks to go
            </span>
          </div>
        )}

        {sessionLog && (
          <ResumeBanner
            sessionLog={sessionLog}
            onResume={() => {}}
            onAbandon={() => abandonSession(sessionLog.id)}
          />
        )}

        <div className="flex items-center justify-center">
          <ReadinessRing score={todayCheckin?.score ?? null} onCheckIn={() => setIsCheckInOpen(true)} />
        </div>

        {isRestDay && mobilityRoutine ? (
          <RestDayCard phase={currentPhase} routine={mobilityRoutine} recoveryTip={recoveryTip} onStart={() => {}} />
        ) : todaysWorkout ? (
          <WorkoutCard workout={todaysWorkout} onStart={() => {}} />
        ) : null}

        <WeeklyScheduleStrip days={weekSchedule} onSelectDay={setPreviewDay} />

        <div className="relative">
          <StatsRow phase={currentPhase} streak={streak} xpTotal={xpTotal} badge={badge} />
          <XpFloat amount={xpToast} />
        </div>

        <NutritionCard
          calories={plan.daily_calories}
          protein_g={plan.daily_protein_g}
          carbs_g={plan.daily_carbs_g}
          fat_g={plan.daily_fat_g}
        />
      </div>

      <CheckInSheet
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSubmit={submitCheckin}
        isSubmitting={isSubmittingCheckin}
      />

      <NotificationPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onSelect={(notification) => {
          if (!notification.read) markRead(notification.id)
        }}
      />

      <SessionPreviewSheet day={previewDay} onClose={() => setPreviewDay(null)} />

      <RecoveryStreakOverlay show={recoveryMilestone} onDone={dismissRecoveryMilestone} />

      <BadgeUnlockOverlay badge={unlockedBadge} onDismiss={dismissUnlockedBadge} />

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </motion.div>
  )
}
