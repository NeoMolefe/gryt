import type { PrimaryGoal } from '@/types/onboarding'

export function goalContextLine(goal: PrimaryGoal | null | undefined): string {
  switch (goal) {
    case 'hypertrophy':
      return "You're in a calorie surplus to support muscle growth."
    case 'fat_loss':
      return "You're in a moderate deficit to support fat loss while preserving muscle."
    case 'strength_conditioning':
    case 'functional_strength_conditioning':
      return 'Your targets balance fuel for strength work with recovery between sessions.'
    case 'cardio_endurance':
      return 'Your targets prioritise carbohydrates to fuel endurance training.'
    case 'mobility':
      return 'Your targets support steady energy and recovery for mobility-focused training.'
    case 'functional_athletic':
    case 'athletic_performance':
    case 'hybrid_training':
    case 'event_specific':
      return 'Your targets are set to fuel performance and support recovery between sessions.'
    case 'general_fitness':
    default:
      return 'Your targets are balanced to support consistent training and recovery.'
  }
}

export interface MacroSplit {
  proteinPct: number
  carbsPct: number
  fatPct: number
}

interface MacroInput {
  daily_protein_g: number
  daily_carbs_g: number
  daily_fat_g: number
}

export function macroSplit({ daily_protein_g, daily_carbs_g, daily_fat_g }: MacroInput): MacroSplit {
  const proteinKcal = daily_protein_g * 4
  const carbsKcal = daily_carbs_g * 4
  const fatKcal = daily_fat_g * 9
  const total = proteinKcal + carbsKcal + fatKcal

  if (total <= 0) {
    return { proteinPct: 0, carbsPct: 0, fatPct: 0 }
  }

  return {
    proteinPct: Math.round((proteinKcal / total) * 100),
    carbsPct: Math.round((carbsKcal / total) * 100),
    fatPct: Math.round((fatKcal / total) * 100),
  }
}
