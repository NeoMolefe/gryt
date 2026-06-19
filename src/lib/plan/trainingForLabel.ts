import type { Archetype } from '@/types/plan.types'

/**
 * Display text for the "Training for" label, derived from the active plan's
 * archetype rather than profile.event_type — the latter goes stale after a
 * goal switch (e.g. HYROX -> General Fitness) since nothing else reads it
 * once the new plan no longer needs an event type.
 */
export function getTrainingForLabel(archetype: Archetype): string | null {
  if (archetype === 'HYROX Competitor') return 'HYROX'
  if (archetype === 'Endurance Athlete') return 'ENDURANCE'
  if (archetype === 'Hybrid Performer') return 'HYBRID'
  if (archetype === 'Strength Athlete') return 'STRENGTH'
  return null
}
