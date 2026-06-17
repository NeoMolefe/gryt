interface NutritionCardProps {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export function NutritionCard({ calories, protein_g, carbs_g, fat_g }: NutritionCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">Daily Nutrition Targets</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-elevated p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Calories</p>
          <p className="text-lg font-bold text-text-primary">{calories} kcal</p>
        </div>
        <div className="rounded-xl bg-elevated p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Protein</p>
          <p className="text-lg font-bold text-text-primary">{protein_g} g</p>
        </div>
        <div className="rounded-xl bg-elevated p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Carbs</p>
          <p className="text-lg font-bold text-text-primary">{carbs_g} g</p>
        </div>
        <div className="rounded-xl bg-elevated p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Fat</p>
          <p className="text-lg font-bold text-text-primary">{fat_g} g</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-text-muted">Estimated targets. Not medical nutrition advice.</p>
    </div>
  )
}
