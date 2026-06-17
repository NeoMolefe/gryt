import type { BadgeId } from '@/types/progress.types'

export type XpEventType = 'workout_complete' | 'readiness_checkin' | 'personal_best' | 'phase_complete' | 'streak_7'

export const XP_VALUES: Record<XpEventType, number> = {
  workout_complete: 100,
  readiness_checkin: 10,
  personal_best: 50,
  phase_complete: 200,
  streak_7: 150,
}

export interface UnlockedBadge {
  id: BadgeId
  name: string
  description: string
  trigger: string
}
