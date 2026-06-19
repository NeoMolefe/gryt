import type { OnboardingData } from '@/types/onboarding'
import type { Archetype, ExerciseBlock, WorkoutSession } from '@/types/plan.types'
import { applySecondaryGoals, estimateSessionDuration } from './applySecondaryGoals'
import { buildEventTimeline } from './buildEventTimeline'
import type { EventTimeline } from './buildEventTimeline'
import { buildStructure, expandPhases } from './buildStructure'
import type { PlanStructure } from './buildStructure'
import { calculateGoalPace, RUNNING_EVENT_TYPES } from './calculateGoalPace'
import type { RunningEventType } from './calculateGoalPace'
import { buildHyroxSimulation } from './buildHyroxSimulation'
import { calculateLongRunDuration } from './calculateLongRunDuration'
import { classifyArchetype } from './classifyArchetype'
import { prescribe } from './prescribe'
import { selectExercises } from './selectExercises'
import { selectSplit } from './selectSplit'

export interface GeneratedPlan {
  archetype: Archetype
  totalWeeks: number
  sessions: WorkoutSession[]
}

function eventTimelineToStructure(timeline: EventTimeline): PlanStructure {
  return {
    totalWeeks: timeline.total_weeks,
    phases: timeline.phases.map((p) => ({ phase: p.phase, weeks: p.week_count })),
  }
}

export function generatePlan(data: OnboardingData): GeneratedPlan {
  const availabilityDays = data.availabilityDays ?? 3
  const sessionDuration = data.sessionDuration ?? 45
  const equipment = data.equipment ?? 'bodyweight'
  const experience = data.experience ?? 'beginner'
  const primaryGoal = data.primaryGoal ?? 'general_fitness'

  const archetype = classifyArchetype(primaryGoal, data.eventType)

  // Event-specific plans use backward timeline from event date; all other goals use forward structure.
  const structure =
    primaryGoal === 'event_specific' && data.eventDate
      ? eventTimelineToStructure(buildEventTimeline(data.eventDate))
      : buildStructure(availabilityDays)

  const weeks = expandPhases(structure)
  const templates = selectSplit(archetype, availabilityDays, primaryGoal)

  // Pace zones apply only to running events when goal time was provided.
  const isRunningEvent = (RUNNING_EVENT_TYPES as readonly string[]).includes(data.eventType ?? '')
  const paceZones =
    isRunningEvent && data.eventType && data.goalTimeMinutes
      ? calculateGoalPace(data.eventType as RunningEventType, data.goalTimeMinutes)
      : null

  // Long run progressive duration applies only to marathon/half_marathon event plans.
  const isMarathonEvent =
    primaryGoal === 'event_specific' &&
    (data.eventType === 'marathon' || data.eventType === 'half_marathon')

  // HYROX simulation block replaces the conditioning slot for simulation sessions.
  const isHyroxEvent = primaryGoal === 'event_specific' && data.eventType === 'hyrox'

  const sessions: WorkoutSession[] = []
  let previousAccessoryNames: string[] = []
  let previousMainLiftNames: string[] = []

  for (const week of weeks) {
    for (let dayIndex = 0; dayIndex < templates.length; dayIndex++) {
      const template = templates[dayIndex]
      const selected = selectExercises({
        template,
        archetype,
        equipment,
        phase: week.phase,
        dayIndex,
        previousAccessoryNames,
        previousMainLiftNames,
      })

      const buildBlock = (exercise: (typeof selected.main_lifts)[number]): ExerciseBlock =>
        prescribe({
          exercise,
          phase: week.phase,
          weekInPhase: week.weekInPhase,
          totalWeeksInPhase: week.totalWeeksInPhase,
          experience,
          sessionName: template.session_name,
          paceZones,
        })

      // For marathon/half_marathon, override the Long Run conditioning exercise
      // duration with phase- and week-aware progression.
      let conditioningExercise = selected.conditioning
      if (isMarathonEvent && conditioningExercise && template.session_name.startsWith('Long Run')) {
        const weeksUntilEventThisWeek = structure.totalWeeks - week.week_number + 1
        const longRunMinutes = calculateLongRunDuration(
          data.eventType as 'marathon' | 'half_marathon',
          week.phase,
          week.weekInPhase,
          week.totalWeeksInPhase,
          weeksUntilEventThisWeek,
        )
        conditioningExercise = { ...conditioningExercise, default_reps: `${longRunMinutes}min` }
      }

      const isSimulationSession = isHyroxEvent && template.session_name === 'HYROX Simulation'

      // A simulation day IS the race rehearsal — no strength work or extra
      // conditioning gets layered on top of it. warm_up/cooldown still apply.
      const main_lifts = isSimulationSession ? [] : selected.main_lifts.map(buildBlock)
      const accessories = isSimulationSession ? [] : selected.accessories.map(buildBlock)
      const conditioning = isSimulationSession ? null : conditioningExercise ? buildBlock(conditioningExercise) : null

      sessions.push({
        session_name: template.session_name,
        phase: week.phase,
        week_number: week.week_number,
        day_number: dayIndex + 1,
        estimated_duration_minutes: 0,
        warm_up: selected.warm_up.map(buildBlock),
        main_lifts,
        accessories,
        conditioning,
        cooldown: selected.cooldown.map(buildBlock),
        hyrox_simulation: isSimulationSession ? buildHyroxSimulation(week.phase) : undefined,
      })

      // Track what the session actually contains (empty for simulation days),
      // not what selectExercises computed before the simulation override —
      // a simulation day doesn't fatigue any specific lift, so the next day
      // shouldn't treat it as having "used" any main lift or accessory.
      previousAccessoryNames = accessories.map((exercise) => exercise.name)
      previousMainLiftNames = main_lifts.map((exercise) => exercise.name)
    }
  }

  const finalSessions = applySecondaryGoals(
    sessions,
    data.secondaryGoals,
    equipment,
    archetype,
    experience,
    sessionDuration,
  ).map((session) => ({
    ...session,
    estimated_duration_minutes: estimateSessionDuration(session),
  }))

  return { archetype, totalWeeks: structure.totalWeeks, sessions: finalSessions }
}
