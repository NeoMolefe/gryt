export type RpeColor = 'green' | 'amber' | 'red'

export function rpeColor(rpe: number): RpeColor {
  if (rpe <= 7) return 'green'
  if (rpe <= 8.5) return 'amber'
  return 'red'
}

export const RPE_COLOR_TEXT_CLASS: Record<RpeColor, string> = {
  green: 'text-phase-deload',
  amber: 'text-phase-build',
  red: 'text-phase-peak',
}
