import type { NotificationType } from '@/types/dashboard.types'

export type NotificationPreferenceKey =
  | 'daily_workout_reminder'
  | 'evening_summary'
  | 'streak_reminders'
  | 'weekly_kwazi_review'
  | 'deload_alerts'
  | 'personal_bests'
  | 'badges_achievements'

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>

export const NOTIFICATION_PREFERENCE_LABELS: Record<NotificationPreferenceKey, string> = {
  daily_workout_reminder: 'Daily Workout Reminder',
  evening_summary: 'Evening Summary',
  streak_reminders: 'Streak Reminders',
  weekly_kwazi_review: 'Weekly Kwazi Review',
  deload_alerts: 'Deload Alerts',
  personal_bests: 'Personal Bests',
  badges_achievements: 'Badges & Achievements',
}

const PREFERENCE_KEY_ORDER: NotificationPreferenceKey[] = [
  'daily_workout_reminder',
  'evening_summary',
  'streak_reminders',
  'weekly_kwazi_review',
  'deload_alerts',
  'personal_bests',
  'badges_achievements',
]

const DEFAULT_PREFERENCES: NotificationPreferences = {
  daily_workout_reminder: true,
  evening_summary: true,
  streak_reminders: true,
  weekly_kwazi_review: true,
  deload_alerts: true,
  personal_bests: true,
  badges_achievements: true,
}

/** Maps each notification trigger type onto the preference toggle that gates it. `phase_complete` is always on. */
const PREFERENCE_FOR_TYPE: Partial<Record<NotificationType, NotificationPreferenceKey>> = {
  daily_reminder: 'daily_workout_reminder',
  daily_summary_evening: 'evening_summary',
  streak_reminder: 'streak_reminders',
  weekly_kwazi_review: 'weekly_kwazi_review',
  deload_trigger: 'deload_alerts',
  personal_best: 'personal_bests',
  badge_unlocked: 'badges_achievements',
}

const STORAGE_PREFIX = 'gryt_notification_prefs_'

export function getNotificationPreferences(userId: string): NotificationPreferences {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    if (!raw) return { ...DEFAULT_PREFERENCES }
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>
    return { ...DEFAULT_PREFERENCES, ...parsed }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export function setNotificationPreferences(userId: string, prefs: NotificationPreferences): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(prefs))
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
}

export function isNotificationTypeEnabled(userId: string, type: NotificationType): boolean {
  const key = PREFERENCE_FOR_TYPE[type]
  if (!key) return true
  return getNotificationPreferences(userId)[key]
}

export { PREFERENCE_KEY_ORDER }
