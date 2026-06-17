import type { StepProps } from '../types'

export function Step8InjuryHistory({ data, updateData }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Any injuries or limitations?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Optional — this helps Kwazi avoid risky movements for you.
        </p>
      </div>

      <textarea
        value={data.injuryHistory}
        onChange={(event) => updateData('injuryHistory', event.target.value)}
        placeholder="E.g. lower back pain, previous shoulder injury…"
        rows={5}
        className="min-h-[120px] rounded-xl border border-border bg-elevated px-4 py-3 text-text-primary placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
      />
    </div>
  )
}
