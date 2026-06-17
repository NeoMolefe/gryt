import { formatDateISO } from './schedule'

export function calculateStreak(checkinDates: Set<string>, today: Date): number {
  let streak = 0
  const cursor = new Date(today)

  if (!checkinDates.has(formatDateISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (checkinDates.has(formatDateISO(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
