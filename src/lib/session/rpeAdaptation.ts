/** Suggests a 5-10% weight increase for the remaining sets after a low-RPE first compound set. */
export function suggestedWeightIncrease(weightKg: number): { min: number; max: number } {
  return {
    min: Math.round(weightKg * 1.05 * 2) / 2,
    max: Math.round(weightKg * 1.1 * 2) / 2,
  }
}

export function shouldSuggestWeightIncrease(rpe: number, isCompound: boolean, setIndex: number): boolean {
  return isCompound && setIndex === 0 && rpe < 7
}

export function shouldReduceRemainingVolume(rpe: number): boolean {
  return rpe >= 9
}
