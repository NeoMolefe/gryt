import type { Workout } from '@/types/plan.types'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function dayDiff(from: Date, to: Date): number {
  return Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY)
}

/** 0-indexed offset of `now` within the current 7-day cycle since `startDate`. */
export function getDayOffsetInWeek(startDate: string, now: Date = new Date()): number {
  const diff = dayDiff(new Date(startDate), now)
  return ((diff % 7) + 7) % 7
}

export function getDayOfYear(now: Date = new Date()): number {
  const start = new Date(now.getFullYear(), 0, 0)
  return dayDiff(start, now)
}

export function getCurrentWeekNumber(startDate: string, totalWeeks: number, now: Date = new Date()): number {
  const diff = dayDiff(new Date(startDate), now)
  const week = Math.floor(diff / 7) + 1
  return Math.min(Math.max(week, 1), totalWeeks)
}

export interface ScheduleDay {
  date: Date
  dayNumber: number
  isToday: boolean
  isRestDay: boolean
  workout: Workout | null
}

/** Builds the 7-day strip for the current week, starting from the plan's anchor weekday. */
export function getWeekSchedule(
  workouts: Workout[],
  weekNumber: number,
  startDate: string,
  availabilityDays: number,
  now: Date = new Date(),
): ScheduleDay[] {
  const todayOffset = getDayOffsetInWeek(startDate, now)
  const weekStart = addDays(startOfDay(now), -todayOffset)

  return Array.from({ length: 7 }, (_, offset) => {
    const dayNumber = offset + 1
    const isRestDay = dayNumber > availabilityDays
    const workout = isRestDay
      ? null
      : (workouts.find((w) => w.week_number === weekNumber && w.day_number === dayNumber) ?? null)

    return {
      date: addDays(weekStart, offset),
      dayNumber,
      isToday: offset === todayOffset,
      isRestDay,
      workout,
    }
  })
}

export function findTodaysWorkout(
  workouts: Workout[],
  weekNumber: number,
  availabilityDays: number,
  startDate: string,
  now: Date = new Date(),
): Workout | null {
  const todayDayNumber = getDayOffsetInWeek(startDate, now) + 1
  if (todayDayNumber > availabilityDays) return null
  return workouts.find((w) => w.week_number === weekNumber && w.day_number === todayDayNumber) ?? null
}

/** Counts consecutive training days ending today (today inclusive). */
export function countConsecutiveTrainingDays(startDate: string, availabilityDays: number, now: Date = new Date()): number {
  let count = 0
  let offset = getDayOffsetInWeek(startDate, now)

  for (let i = 0; i < 7; i++) {
    const dayNumber = offset + 1
    if (dayNumber > availabilityDays) break
    count += 1
    offset = ((offset - 1) % 7 + 7) % 7
  }

  return count
}

/** Given calendar weekday indices (e.g. [1,3,5] for Mon/Wed/Fri), returns today's
 * 1-indexed day_number within the training week. Returns null on rest days. */
export function getTodayDayNumberFromIndices(trainingDayIndices: number[], now: Date = new Date()): number | null {
  const today = now.getDay()
  const sorted = [...trainingDayIndices].sort((a, b) => a - b)
  const pos = sorted.indexOf(today)
  return pos === -1 ? null : pos + 1
}

/** Builds a 7-day strip for the current calendar week (Sun–Sat) using trainingDayIndices.
 * Training days map their sorted position to day_number; rest days have no workout. */
export function getWeekScheduleFromIndices(
  workouts: Workout[],
  weekNumber: number,
  trainingDayIndices: number[],
  now: Date = new Date(),
): ScheduleDay[] {
  const today = now.getDay()
  const sorted = [...trainingDayIndices].sort((a, b) => a - b)

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - today)
  weekStart.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, offset) => {
    const dayOfWeek = offset
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + offset)

    const isTrainingDay = sorted.includes(dayOfWeek)
    const dayNumber = isTrainingDay ? sorted.indexOf(dayOfWeek) + 1 : 0
    const workout = isTrainingDay
      ? (workouts.find((w) => w.week_number === weekNumber && w.day_number === dayNumber) ?? null)
      : null

    return {
      date,
      dayNumber,
      isToday: dayOfWeek === today,
      isRestDay: !isTrainingDay,
      workout,
    }
  })
}

/** Finds the most recently completed training day's workout, looking back up to 7 days. */
export function findPreviousTrainingWorkout(
  workouts: Workout[],
  totalWeeks: number,
  availabilityDays: number,
  startDate: string,
  now: Date = new Date(),
): Workout | null {
  const todayOffset = getDayOffsetInWeek(startDate, now)

  for (let back = 1; back <= 7; back++) {
    const offset = ((todayOffset - back) % 7 + 7) % 7
    const dayNumber = offset + 1
    if (dayNumber > availabilityDays) continue

    const diffDays = dayDiff(new Date(startDate), addDays(now, -back))
    let week = Math.floor(diffDays / 7) + 1
    week = Math.min(Math.max(week, 1), totalWeeks)

    const workout = workouts.find((w) => w.week_number === week && w.day_number === dayNumber)
    if (workout) return workout
  }

  return null
}
