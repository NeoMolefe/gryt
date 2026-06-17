import type { BadgeId } from '@/types/progress.types'

export const BADGE_DEFINITIONS: Record<BadgeId, { name: string; description: string }> = {
  phase_complete: {
    name: 'Phase Complete',
    description: 'Complete every workout in a training phase.',
  },
  streak_7: {
    name: '7-Day Streak',
    description: 'Log your readiness check-in for 7 consecutive days.',
  },
  first_pb: {
    name: 'First PB',
    description: 'Set your first personal best on any exercise.',
  },
  recovery_warrior: {
    name: 'Recovery Warrior',
    description: 'Log your readiness check-in for 14 consecutive days.',
  },
  deload_discipline: {
    name: 'Deload Discipline',
    description: 'Complete every workout in a deload week.',
  },
  hybrid_ready: {
    name: 'Hybrid Ready',
    description: 'Complete sessions across 3+ different training styles in one week.',
  },
}
