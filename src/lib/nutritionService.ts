import type { Gender, PrimaryGoal } from '@/types/onboarding'

export interface NutritionInput {
  age: number
  heightCm: number
  weightKg: number
  gender: Gender
  availabilityDays: number
  primaryGoal: PrimaryGoal
}

export interface NutritionResult {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  tdee: number
}

const HIGH_PROTEIN_GOALS: PrimaryGoal[] = ['hypertrophy', 'fat_loss', 'strength_conditioning', 'functional_athletic']

function calculateBmr(input: NutritionInput): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age

  switch (input.gender) {
    case 'male':
      return base + 5
    case 'female':
      return base - 161
    case 'prefer_not_to_say':
    default:
      return base - 78
  }
}

function activityMultiplier(availabilityDays: number): number {
  if (availabilityDays <= 2) return 1.2
  if (availabilityDays <= 4) return 1.375
  if (availabilityDays <= 6) return 1.55
  return 1.725
}

function calorieAdjustment(primaryGoal: PrimaryGoal): number {
  switch (primaryGoal) {
    case 'fat_loss':
      return -500
    case 'hypertrophy':
      return 300
    default:
      return 0
  }
}

export function calculateNutrition(input: NutritionInput): NutritionResult {
  const bmr = calculateBmr(input)
  const tdee = bmr * activityMultiplier(input.availabilityDays)
  const calories = tdee + calorieAdjustment(input.primaryGoal)

  const proteinPerKg = HIGH_PROTEIN_GOALS.includes(input.primaryGoal) ? 2.2 : 1.8
  const protein_g = proteinPerKg * input.weightKg
  const proteinCalories = protein_g * 4

  const fatCalories = calories * 0.25
  const fat_g = fatCalories / 9

  const carbCalories = calories - proteinCalories - fatCalories
  const carbs_g = carbCalories / 4

  return {
    calories: Math.round(calories),
    protein_g: Math.round(protein_g),
    carbs_g: Math.round(Math.max(0, carbs_g)),
    fat_g: Math.round(fat_g),
    tdee: Math.round(tdee),
  }
}
