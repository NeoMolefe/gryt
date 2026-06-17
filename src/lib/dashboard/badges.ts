import type { Badge } from '@/types/dashboard.types'

export const BADGES: Badge[] = [
  { threshold: 0, name: 'Getting Started' },
  { threshold: 50, name: 'Consistency Builder' },
  { threshold: 150, name: 'Momentum' },
  { threshold: 300, name: 'Dedicated' },
  { threshold: 600, name: 'Iron Will' },
  { threshold: 1000, name: 'Elite' },
  { threshold: 2000, name: 'Legend' },
]

export function getCurrentBadge(xpTotal: number): Badge {
  let current = BADGES[0]
  for (const badge of BADGES) {
    if (xpTotal >= badge.threshold) {
      current = badge
    }
  }
  return current
}
