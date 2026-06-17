const LEG_EXERCISE_KEYWORDS = [
  'squat',
  'deadlift',
  'lunge',
  'leg press',
  'leg curl',
  'leg extension',
  'hip thrust',
  'calf raise',
  'step up',
  'step-up',
  'glute',
  'hamstring',
  'quad',
]

export const FATIGUE_TAX_MULTIPLIER = 0.85

export function isLegExercise(exerciseName: string): boolean {
  const name = exerciseName.toLowerCase()
  return LEG_EXERCISE_KEYWORDS.some((keyword) => name.includes(keyword))
}

/** Parses a distance in km from text like "5km Run" or "8 km row", or null if none found. */
export function parseDistanceKm(text: string | number): number | null {
  if (typeof text === 'number') return null

  const match = text.match(/(\d+(?:\.\d+)?)\s*km/i)
  if (!match) return null

  return parseFloat(match[1]!)
}
