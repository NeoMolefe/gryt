export type ReadinessColor = 'green' | 'amber' | 'red'

export function calculateReadinessScore(sleep: number, energy: number, soreness: number): number {
  const sorenessScore = 6 - soreness
  const weighted = (sleep * 0.40) + (energy * 0.35) + (sorenessScore * 0.25)
  return Math.round(Math.min(100, Math.max(0, ((weighted - 1) / 4) * 100)))
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
