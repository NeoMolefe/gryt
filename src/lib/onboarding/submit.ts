import { supabase } from '@/lib/supabase'
import { generatePlan } from '@/lib/planGeneration/generatePlan'
import { calculateNutrition } from '@/lib/nutritionService'
import type { OnboardingData } from '@/types/onboarding'

export async function submitOnboarding(
  userId: string,
  data: OnboardingData,
): Promise<void> {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: data.firstName,
      age: Number(data.age),
      height_cm: Number(data.heightCm),
      weight_kg: Number(data.weightKg),
      gender: data.gender,
      experience: data.experience,
      primary_goal: data.primaryGoal,
      secondary_goals: data.secondaryGoals,
      availability_days: data.availabilityDays,
      session_duration_minutes: data.sessionDuration,
      equipment: data.equipment,
     training_styles: data.trainingStyle,
      injury_history: data.injuryHistory.trim() || null,
      event_type: data.eventType,
      event_date: data.eventDate,
      goal_time_minutes: data.goalTimeMinutes,
      onboarding_completed: true,
    })
    .eq('id', userId)

  if (profileError) {
    throw new Error(profileError.message)
  }

  const generated = generatePlan(data)

  const nutrition = calculateNutrition({
    age: Number(data.age),
    heightCm: Number(data.heightCm),
    weightKg: Number(data.weightKg),
    gender: data.gender ?? 'prefer_not_to_say',
    availabilityDays: data.availabilityDays ?? 3,
    primaryGoal: data.primaryGoal ?? 'general_fitness',
  })

  const { error: deactivateError } = await supabase
    .from('plans')
    .update({ active: false })
    .eq('user_id', userId)
    .eq('active', true)

  if (deactivateError) {
    throw new Error(deactivateError.message)
  }

  const { data: planRow, error: planError } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      archetype: generated.archetype,
      total_weeks: generated.totalWeeks,
      active: true,
      current_week: 1,
      current_day: 1,
      start_date: new Date().toISOString().slice(0, 10),
      daily_calories: nutrition.calories,
      daily_protein_g: nutrition.protein_g,
      daily_carbs_g: nutrition.carbs_g,
      daily_fat_g: nutrition.fat_g,
      tdee: nutrition.tdee,
    })
    .select('id')
    .single()

  if (planError) {
    throw new Error(planError.message)
  }

  const workoutRows = generated.sessions.map((session) => ({
    plan_id: planRow.id,
    user_id: userId,
    session_name: session.session_name,
    phase: session.phase,
    week_number: session.week_number,
    day_number: session.day_number,
    estimated_duration_minutes: session.estimated_duration_minutes,
    warm_up: session.warm_up,
    main_lifts: session.main_lifts,
    accessories: session.accessories,
    conditioning: session.conditioning,
    cooldown: session.cooldown,
    notes: session.notes ?? null,
    hyrox_simulation: session.hyrox_simulation ?? null,
  }))

  const { error: workoutsError } = await supabase.from('workouts').insert(workoutRows)

  if (workoutsError) {
    throw new Error(workoutsError.message)
  }
}
