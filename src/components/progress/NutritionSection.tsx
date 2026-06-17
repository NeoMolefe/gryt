import { MacroBar } from '@/components/progress/MacroBar'
import { goalContextLine, macroSplit } from '@/lib/progress/nutrition'
import type { PrimaryGoal } from '@/types/onboarding'
import type { Plan } from '@/types/plan.types'

interface NutritionSectionProps {
  plan: Plan
  primaryGoal: PrimaryGoal | null | undefined
}

export function NutritionSection({ plan, primaryGoal }: NutritionSectionProps) {
  const split = macroSplit(plan)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-1 text-lg font-semibold text-text-primary">Daily Nutrition Targets</h2>
      <p className="mb-4 text-sm text-text-secondary">{goalContextLine(primaryGoal)}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-elevated p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Calories</p>
          <p className="text-lg font-bold text-text-primary">{plan.daily_calories} kcal</p>
        </div>
        <div className="rounded-xl bg-elevated p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Protein</p>
          <p className="text-lg font-bold text-text-primary">{plan.daily_protein_g} g</p>
        </div>
        <div className="rounded-xl bg-elevated p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Carbs</p>
          <p className="text-lg font-bold text-text-primary">{plan.daily_carbs_g} g</p>
        </div>
        <div className="rounded-xl bg-elevated p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Fat</p>
          <p className="text-lg font-bold text-text-primary">{plan.daily_fat_g} g</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Macro Split</p>
        <MacroBar split={split} />
      </div>

      <p className="mt-4 text-xs text-text-muted">Estimated targets. Not medical nutrition advice.</p>
    </div>
  )
}
