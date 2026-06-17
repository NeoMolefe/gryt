import { createNotificationIfEnabled, hasNotificationToday } from '@/lib/notifications/queries'

interface AppOpenNotificationParams {
  userId: string
  now: Date
  hasLoggedActivityToday: boolean
  deloadAlert: boolean
  isDayAfterLastTrainingDay: boolean
}

/** Evaluates the app-open notification triggers (daily reminders, streak risk, deload, weekly review). */
export async function evaluateAppOpenNotifications(params: AppOpenNotificationParams): Promise<void> {
  const { userId, now, hasLoggedActivityToday, deloadAlert, isDayAfterLastTrainingDay } = params
  const hour = now.getHours()

  if (hour >= 5 && hour < 11 && !(await hasNotificationToday(userId, 'daily_reminder'))) {
    await createNotificationIfEnabled(
      userId,
      'daily_reminder',
      'Time to train',
      "Your workout is ready when you are. Let's get after it.",
    )
  }

  if (hour >= 18 && hour < 23 && !(await hasNotificationToday(userId, 'daily_summary_evening'))) {
    await createNotificationIfEnabled(
      userId,
      'daily_summary_evening',
      'Evening summary',
      "Here's how today went. Tap to review your progress.",
    )
  }

  if (hour >= 18 && !hasLoggedActivityToday && !(await hasNotificationToday(userId, 'streak_reminder'))) {
    await createNotificationIfEnabled(
      userId,
      'streak_reminder',
      "Don't lose your streak",
      'Log a check-in or complete a workout today to keep your streak alive.',
    )
  }

  if (deloadAlert && !(await hasNotificationToday(userId, 'deload_trigger'))) {
    await createNotificationIfEnabled(
      userId,
      'deload_trigger',
      'Time to dial it back',
      'Your readiness has been low for 3 days in a row. Consider a deload to let your body recover.',
    )
  }

  if (isDayAfterLastTrainingDay && !(await hasNotificationToday(userId, 'weekly_kwazi_review'))) {
    await createNotificationIfEnabled(
      userId,
      'weekly_kwazi_review',
      'Weekly review with Kwazi',
      'Your training block wrapped up. Chat with Kwazi about how the week went.',
    )
  }
}
