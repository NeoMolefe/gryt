import type { PrimaryGoal } from '@/types/onboarding'
import type { Archetype, Focus } from '@/types/plan.types'
import type { ConditioningType } from './exerciseLibrary'

export interface SessionTemplate {
  session_name: string
  focus: Focus[]
  conditioning_type_constraint?: ConditioningType[]
}

const FUNCTIONAL_ATHLETIC_TEMPLATES: SessionTemplate[] = [
  { session_name: 'Power & Explosiveness', focus: ['power', 'lower', 'plyometric'] },
  { session_name: 'Strength & Carries', focus: ['lower', 'upper_push', 'upper_pull', 'loaded_carry'] },
  { session_name: 'Conditioning & VO2 Max', focus: ['conditioning', 'vo2max', 'sprint'] },
  { session_name: 'Lateral Movement & Agility', focus: ['lateral', 'agility', 'core'] },
  { session_name: 'Full Athletic Circuit', focus: ['power', 'conditioning', 'loaded_carry'] },
  { session_name: 'Mobility & Regeneration', focus: ['mobility', 'core'] },
]

const ARCHETYPE_TEMPLATES: Record<Archetype, SessionTemplate[]> = {
  Bodybuilder: [
    { session_name: 'Push Day', focus: ['upper_push', 'core'] },
    { session_name: 'Pull Day', focus: ['upper_pull', 'core'] },
    { session_name: 'Leg Day', focus: ['lower', 'core'] },
    { session_name: 'Push Day II', focus: ['upper_push', 'core'] },
    { session_name: 'Pull Day II', focus: ['upper_pull', 'core'] },
    { session_name: 'Leg Day II', focus: ['lower', 'core'] },
    { session_name: 'Full Body', focus: ['upper_push', 'upper_pull', 'lower'] },
  ],
  'Strength Athlete': [
    { session_name: 'Upper Body Strength', focus: ['upper_push', 'upper_pull'] },
    { session_name: 'Lower Body Strength', focus: ['lower', 'core'] },
    { session_name: 'Upper Body Strength II', focus: ['upper_push', 'upper_pull'] },
    { session_name: 'Lower Body Strength II', focus: ['lower', 'core'] },
    { session_name: 'Upper Body Strength III', focus: ['upper_push', 'upper_pull'] },
    { session_name: 'Lower Body Strength III', focus: ['lower', 'core'] },
    { session_name: 'Full Body Strength', focus: ['upper_push', 'upper_pull', 'lower'] },
  ],
  'Endurance Athlete': [
    { session_name: 'Easy Run', focus: ['conditioning'], conditioning_type_constraint: ['steady_state'] },
    { session_name: 'Strength Session', focus: ['lower', 'core'] },
    { session_name: 'Tempo Run', focus: ['conditioning', 'vo2max'], conditioning_type_constraint: ['steady_state'] },
    { session_name: 'Long Run', focus: ['conditioning'], conditioning_type_constraint: ['steady_state'] },
    { session_name: 'Easy Run II', focus: ['conditioning'], conditioning_type_constraint: ['steady_state'] },
    { session_name: 'Strength Session II', focus: ['upper_push', 'upper_pull', 'core'] },
    { session_name: 'Tempo Run II', focus: ['conditioning', 'vo2max'], conditioning_type_constraint: ['steady_state'] },
  ],
  'Hybrid Performer': [
    { session_name: 'Strength Session', focus: ['lower', 'core'] },
    { session_name: 'Conditioning Session', focus: ['conditioning', 'vo2max', 'core'] },
    { session_name: 'Strength Session II', focus: ['upper_push', 'upper_pull'] },
    { session_name: 'Conditioning Session II', focus: ['conditioning', 'vo2max'] },
    { session_name: 'Strength Session III', focus: ['lower', 'upper_push', 'upper_pull'] },
    { session_name: 'Conditioning Session III', focus: ['conditioning', 'vo2max', 'core'] },
    { session_name: 'Full Body Hybrid', focus: ['upper_push', 'upper_pull', 'lower', 'conditioning'] },
  ],
  'General Fitness': [
    { session_name: 'Upper Body', focus: ['upper_push', 'upper_pull', 'core'] },
    { session_name: 'Lower Body', focus: ['lower', 'core'] },
    { session_name: 'Upper Body II', focus: ['upper_push', 'upper_pull', 'core'] },
    { session_name: 'Lower Body II', focus: ['lower', 'core'] },
    { session_name: 'Upper Body III', focus: ['upper_push', 'upper_pull', 'core'] },
    { session_name: 'Lower Body III', focus: ['lower', 'core'] },
    { session_name: 'Full Body Finisher', focus: ['upper_push', 'upper_pull', 'lower', 'conditioning'] },
  ],
  'Mobility Focus': [
    { session_name: 'Mobility Flow', focus: ['mobility', 'core'] },
    { session_name: 'Strength Support', focus: ['lower', 'upper_push', 'mobility'] },
    { session_name: 'Mobility Flow II', focus: ['mobility', 'lateral', 'core'] },
    { session_name: 'Strength Support II', focus: ['upper_pull', 'lower', 'mobility'] },
    { session_name: 'Mobility Flow III', focus: ['mobility', 'core'] },
    { session_name: 'Full Body Mobility', focus: ['mobility', 'upper_push', 'upper_pull', 'lower'] },
    { session_name: 'Active Recovery', focus: ['mobility', 'core'] },
  ],
  'Fat Loss': [
    { session_name: 'Strength & Conditioning', focus: ['upper_push', 'lower', 'conditioning'] },
    { session_name: 'Strength & Conditioning II', focus: ['upper_pull', 'lower', 'conditioning'] },
    { session_name: 'Metabolic Circuit', focus: ['conditioning', 'core', 'lower'] },
    { session_name: 'Strength & Conditioning III', focus: ['upper_push', 'upper_pull', 'conditioning'] },
    { session_name: 'Metabolic Circuit II', focus: ['conditioning', 'core', 'lower'] },
    { session_name: 'Full Body Burn', focus: ['upper_push', 'upper_pull', 'lower', 'conditioning'] },
    { session_name: 'Active Recovery Circuit', focus: ['conditioning', 'core'] },
  ],
  'Functional Strength & Conditioning': [
    { session_name: 'Strength Dominant', focus: ['lower', 'core'] },
    { session_name: 'Conditioning Dominant', focus: ['conditioning', 'core', 'lower'] },
    { session_name: 'Strength & Carries', focus: ['lower', 'loaded_carry', 'upper_pull'] },
    { session_name: 'Conditioning & Core', focus: ['conditioning', 'core', 'agility'] },
    { session_name: 'Strength Dominant II', focus: ['upper_push', 'upper_pull'] },
    { session_name: 'Full Functional Circuit', focus: ['upper_push', 'lower', 'conditioning', 'loaded_carry'] },
    { session_name: 'Conditioning Dominant II', focus: ['conditioning', 'core', 'lower'] },
  ],
  'Athletic Performance': [
    { session_name: 'Power Session', focus: ['power', 'plyometric', 'lower'] },
    { session_name: 'Strength Session', focus: ['lower', 'core'] },
    { session_name: 'Conditioning Session', focus: ['conditioning', 'vo2max', 'sprint'] },
    { session_name: 'Movement & Agility', focus: ['agility', 'lateral', 'mobility', 'core'] },
    { session_name: 'Power Session II', focus: ['power', 'plyometric', 'lower'] },
    { session_name: 'Strength Session II', focus: ['upper_push', 'upper_pull'] },
    { session_name: 'Conditioning Session II', focus: ['conditioning', 'vo2max', 'sprint'] },
  ],
  // selectExercises.ts has a dedicated branch for this archetype that ignores
  // `focus` entirely — running + station exercises + 2-3 supporting lifts on
  // every day. `focus` here only documents intent and keeps names readable.
  'HYROX Competitor': [
    { session_name: 'HYROX Stations + Run', focus: ['conditioning', 'loaded_carry', 'plyometric'] },
    { session_name: 'Strength Support', focus: ['lower'] },
    { session_name: 'HYROX Stations + Run II', focus: ['conditioning', 'loaded_carry', 'plyometric'] },
    { session_name: 'HYROX Simulation', focus: ['conditioning', 'vo2max'] },
    { session_name: 'Strength Support II', focus: ['lower'] },
    { session_name: 'HYROX Stations + Run III', focus: ['conditioning', 'loaded_carry', 'plyometric'] },
    { session_name: 'Full Hybrid Session', focus: ['conditioning', 'loaded_carry', 'lower'] },
  ],
}

export function selectSplit(
  archetype: Archetype,
  availabilityDays: number,
  primaryGoal: PrimaryGoal,
): SessionTemplate[] {
  const templates =
    primaryGoal === 'functional_athletic' ? FUNCTIONAL_ATHLETIC_TEMPLATES : ARCHETYPE_TEMPLATES[archetype]

  const result: SessionTemplate[] = []
  for (let day = 0; day < availabilityDays; day++) {
    const template = templates[day % templates.length]
    const cycleNumber = Math.floor(day / templates.length)
    if (cycleNumber === 0) {
      result.push(template)
    } else {
      result.push({
        session_name: `${template.session_name} (Week Cycle ${cycleNumber + 1})`,
        focus: template.focus,
      })
    }
  }
  return result
}
