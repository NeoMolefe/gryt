import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/Button'
import { PhaseBadge } from '@/components/dashboard/PhaseBadge'
import { flagsForExercise } from '@/lib/injuries/bodyAreas'
import { secondaryGoalLabel } from '@/lib/onboarding/options'
import type { Workout } from '@/types/plan.types'
import type { InjuryFlag } from '@/types/profile'
import type { SecondaryGoal } from '@/types/onboarding'
import { ExerciseBlockRow } from './ExerciseBlockRow'

interface DayCardProps {
  workout: Workout
  eventBadgeLabel: string | null
  injuryFlags?: InjuryFlag[] | null
  // Secondary goals live on the user's profile, not the plan row — despite
  // what some internal docs assume, `plans` has no secondary_goals column.
  secondaryGoals?: SecondaryGoal[] | null
  isExpanded: boolean
  onToggle: () => void
  onStart: () => void
}

export function DayCard({ workout, eventBadgeLabel, injuryFlags, secondaryGoals, isExpanded, onToggle, onStart }: DayCardProps) {
  const isHyroxSimulation = Boolean(workout.hyrox_simulation?.length)
  // applySecondaryGoals() never injects goal work into deload weeks or HYROX
  // simulation days — match that here so the note doesn't claim goal work
  // happened on a day it didn't.
  const showSecondaryGoals = workout.phase !== 'deload' && !isHyroxSimulation && secondaryGoals && secondaryGoals.length > 0

  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
      >
        <div>
          <p className="font-semibold text-text-primary">
            Day {workout.day_number} — {workout.session_name}
          </p>
          <p className="mt-1 text-sm text-text-secondary">~{workout.estimated_duration_minutes} min</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PhaseBadge phase={workout.phase} />
            {eventBadgeLabel && (
              <span className="inline-flex items-center rounded-full bg-brand-orange/15 px-3 py-1 text-xs font-semibold text-brand-orange">
                TRAINING FOR: {eventBadgeLabel.toUpperCase()}
              </span>
            )}
          </div>
          {showSecondaryGoals && (
            <p className="mt-2 text-xs text-text-secondary">
              Includes: {secondaryGoals!.map((goal) => secondaryGoalLabel(goal)).join(' · ')}
            </p>
          )}
        </div>
        <ChevronDown className={`shrink-0 text-text-secondary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="space-y-4 border-t border-border p-4">
          {workout.warm_up.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Warm-up</h4>
              <ul className="space-y-2">
                {workout.warm_up.map((block) => (
                  <ExerciseBlockRow key={block.name} block={block} injuryFlags={flagsForExercise(block.name, injuryFlags)} />
                ))}
              </ul>
            </section>
          )}

          {isHyroxSimulation ? (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">HYROX Simulation</h4>
              <ol className="space-y-1.5">
                {workout.hyrox_simulation!.map((entry) => (
                  <li
                    key={entry.order}
                    className={`flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm ${
                      entry.type === 'run' ? 'bg-card text-text-secondary' : 'bg-elevated text-text-primary font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{entry.type === 'run' ? '🏃' : '⚡'}</span>
                      {entry.name}
                    </span>
                    <span className="text-text-secondary">{entry.distance_or_reps}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <>
              {workout.main_lifts.length > 0 && (
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Main Lifts</h4>
                  <ul className="space-y-2">
                    {workout.main_lifts.map((block) => (
                      <ExerciseBlockRow key={block.name} block={block} injuryFlags={flagsForExercise(block.name, injuryFlags)} />
                    ))}
                  </ul>
                </section>
              )}

              {workout.accessories.length > 0 && (
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Accessories</h4>
                  <ul className="space-y-2">
                    {workout.accessories.map((block) => (
                      <ExerciseBlockRow key={block.name} block={block} injuryFlags={flagsForExercise(block.name, injuryFlags)} />
                    ))}
                  </ul>
                </section>
              )}

              {(workout.core_stability ?? []).length > 0 && (
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Core Stability</h4>
                  <ul className="space-y-2">
                    {(workout.core_stability ?? []).map((block) => (
                      <ExerciseBlockRow key={block.name} block={block} injuryFlags={flagsForExercise(block.name, injuryFlags)} />
                    ))}
                  </ul>
                </section>
              )}

              {workout.conditioning && (
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Conditioning</h4>
                  <ul className="space-y-2">
                    <ExerciseBlockRow block={workout.conditioning} injuryFlags={flagsForExercise(workout.conditioning.name, injuryFlags)} />
                  </ul>
                </section>
              )}
            </>
          )}

          {workout.cooldown.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Cooldown</h4>
              <ul className="space-y-2">
                {workout.cooldown.map((block) => (
                  <ExerciseBlockRow key={block.name} block={block} injuryFlags={flagsForExercise(block.name, injuryFlags)} />
                ))}
              </ul>
            </section>
          )}

          <Button onClick={onStart}>Start Workout</Button>
        </div>
      )}
    </div>
  )
}
