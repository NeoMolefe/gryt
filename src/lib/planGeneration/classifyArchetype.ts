import type { EventType, PrimaryGoal } from '@/types/onboarding'
import type { Archetype } from '@/types/plan.types'

const ENDURANCE_EVENTS: EventType[] = ['marathon', 'half_marathon', 'race_15k', 'triathlon', 'cycling']
const ATHLETIC_EVENTS: EventType[] = ['race_5k', 'race_10k']

export function classifyArchetype(primaryGoal: PrimaryGoal, eventType: EventType | null): Archetype {
  switch (primaryGoal) {
    case 'hypertrophy':
      return 'Bodybuilder'
    case 'strength_conditioning':
      return 'Strength Athlete'
    case 'cardio_endurance':
      return 'Endurance Athlete'
    case 'functional_athletic':
    case 'athletic_performance':
      return 'Athletic Performance'
    case 'hybrid_training':
      return 'Hybrid Performer'
    case 'event_specific': {
      if (eventType && ENDURANCE_EVENTS.includes(eventType)) return 'Endurance Athlete'
      if (eventType && ATHLETIC_EVENTS.includes(eventType)) return 'Athletic Performance'
      if (eventType === 'hyrox') return 'HYROX Competitor'
      return 'General Fitness'
    }
    case 'general_fitness':
      return 'General Fitness'
    case 'mobility':
      return 'Mobility Focus'
    case 'fat_loss':
      return 'Fat Loss'
    case 'functional_strength_conditioning':
      return 'Functional Strength & Conditioning'
    default:
      return 'General Fitness'
  }
}
