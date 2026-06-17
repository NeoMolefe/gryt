export type ReadinessColor = 'green' | 'amber' | 'red'

export function calculateReadinessScore(sleep: number, energy: number, soreness: number): number {
  const score = (sleep + energy) * 15 + (6 - soreness) * 10
  return Math.min(100, Math.max(0, score))
}

export function readinessColor(score: number): ReadinessColor {
  if (score >= 80) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

export const READINESS_COLOR_HEX: Record<ReadinessColor, string> = {
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
}
