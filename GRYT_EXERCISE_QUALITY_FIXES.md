# GRYT — Exercise Quality, Experience-Level Gating & Secondary Goal Effectiveness
## Claude Code Executable Specification

**Scope:** Three interconnected improvements:
1. Add `min_experience` field to exercise library and gate exercise selection by user experience
2. Expand exercise library with beginner/intermediate appropriate variations
3. Redesign secondary goal application to meaningfully influence session structure

**Build and verify each part before starting the next. This is 3-4 days of work — do not rush.**

---

## CRITICAL RULES

- `pnpm tsc -b --force` after every meaningful change — not `--noEmit`
- Never reduce the existing exercise pool — only add to it and add gating. Removing exercises would break existing generated plans.
- After every part, regenerate real plans and paste actual session content as evidence. Do not summarise.

---

## PART 1 — EXPERIENCE-LEVEL GATING

### Step 1.1 — Add `min_experience` to the LibraryExercise type

In `src/lib/planGeneration/exerciseLibrary.ts`, add an optional field to the `LibraryExercise` interface:

```ts
interface LibraryExercise {
  // ...existing fields...
  min_experience?: ExperienceLevel  // undefined = available to all levels (default)
}
```

`undefined` means available to everyone. `'intermediate'` means beginners are excluded. `'advanced'` means only advanced users see this exercise.

### Step 1.2 — Tag existing exercises with `min_experience`

Go through every exercise in the library and add `min_experience` where appropriate. Rules:

**`min_experience: 'intermediate'`** (beginners excluded):
- Conventional Deadlift
- Trap Bar Deadlift
- Pull-Up, Chin-Up
- Bulgarian Split Squat
- Dip
- Box Jump, Broad Jump, Lateral Bound, Depth Drop, Tuck Jump, Single Leg Broad Jump, Reactive Box Jump
- Sprint Intervals 8×40m, Sprint Intervals 6×60m
- Sled Push 6×25m, Sled Pull 6×25m
- 5-10-5 Agility Drill, T-Drill
- Med Ball Slam, Rotational Med Ball Throw, Medicine Ball Overhead Slam

**`min_experience: 'advanced'`** (beginners and intermediates excluded):
- Front Squat
- Barbell Back Squat
- Overhead Press (barbell)
- VO2 Max Intervals 4×4min, Hill Sprint Repeats
- Reactive Box Jump, Reactive Drop Step
- Depth Drop
- Assault Bike Tabata 8×20s

Everything not listed gets no `min_experience` field.

### Step 1.3 — Filter by experience in `selectExercises.ts`

Add experience-level gating to the `isAvailable` function:

```ts
function isAvailable(
  exercise: LibraryExercise,
  equipment: Equipment,
  archetype: Archetype,
  phase: Phase,
  experience: ExperienceLevel,
): boolean {
  if (exercise.min_experience) {
    const levelMap: Record<ExperienceLevel, number> = {
      beginner: 0,
      intermediate: 1,
      advanced: 2,
    }
    if (levelMap[experience] < levelMap[exercise.min_experience]) return false
  }
  // existing checks below...
  return (
    exercise.equipment.includes(equipment) &&
    exercise.archetypes.includes(archetype) &&
    exercise.phases.includes(phase)
  )
}
```

Update all callers of `isAvailable` to pass `experience`. Confirm `experience` is already in scope at the call site — it's in the input object passed to `selectExercises`.

### Step 1.4 — Differentiate sets by experience in `prescribe.ts`

```ts
function prescribeSets(
  exercise: LibraryExercise,
  phase: Phase,
  weekInPhase: number,
  experience: ExperienceLevel,
): number {
  const baseSets = (() => {
    switch (phase) {
      case 'foundation': return Math.max(2, exercise.default_sets - 1)
      case 'build': return Math.min(exercise.default_sets + 2, exercise.default_sets + Math.floor((weekInPhase - 1) / 2))
      case 'peak': return exercise.default_sets
      case 'deload': return Math.max(1, Math.round(exercise.default_sets * 0.6))
    }
  })()
  if (experience === 'beginner') return Math.max(1, baseSets - 1)
  if (experience === 'advanced') return baseSets + 1
  return baseSets
}
```

### Part 1 Verification

Regenerate plans for a beginner and an advanced user with identical other settings. Paste main_lifts for both Day 1s. Confirm:
- Beginner: NO Conventional Deadlift, Trap Bar Deadlift, Pull-Up, Bulgarian Split Squat, Front Squat, Barbell Back Squat
- Advanced: DOES see all of those
- Beginner has 1 fewer set than advanced on same exercises

---

## PART 2 — EXERCISE LIBRARY EXPANSION

Add the following exercises to `exerciseLibrary.ts`. All new exercises must include `movement_pattern` field.

### Upper Push additions (6 exercises)

```ts
{
  name: 'Dumbbell Bench Press',
  category: 'upper_push',
  equipment: ['full_gym', 'home_gym'],
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 10, default_rest_seconds: 90, default_rpe: 7,
  coaching_cues: ['Control the descent', 'Press to full lockout', 'Neutral wrist throughout'],
  is_compound: true, movement_pattern: 'push',
},
{
  name: 'Incline Dumbbell Press',
  category: 'upper_push',
  equipment: ['full_gym', 'home_gym'],
  archetypes: ['Bodybuilder', 'Strength Athlete', 'General Fitness', 'Hybrid Performer', 'Athletic Performance'],
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 10, default_rest_seconds: 90, default_rpe: 7,
  coaching_cues: ['30-45 degree incline', 'Slight arc on the press', 'Avoid flaring elbows'],
  is_compound: true, movement_pattern: 'push', min_experience: 'intermediate',
},
{
  name: 'Pike Push-Up',
  category: 'upper_push',
  equipment: ALL_EQUIPMENT,
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 8, default_rest_seconds: 60, default_rpe: 7,
  coaching_cues: ['Hips high, inverted V shape', 'Lower head toward floor', 'Press back to start'],
  is_compound: false, movement_pattern: 'push',
},
{
  name: 'Dumbbell Overhead Press',
  category: 'upper_push',
  equipment: ['full_gym', 'home_gym'],
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 10, default_rest_seconds: 90, default_rpe: 7,
  coaching_cues: ['Press directly overhead', 'Avoid excessive arch', 'Control the descent'],
  is_compound: true, movement_pattern: 'push',
},
{
  name: 'Cable Chest Fly',
  category: 'upper_push',
  equipment: ['full_gym'],
  archetypes: ['Bodybuilder', 'General Fitness', 'Fat Loss', 'Functional Strength & Conditioning'],
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 12, default_rest_seconds: 60, default_rpe: 7,
  coaching_cues: ['Slight bend in elbow throughout', 'Feel the stretch at the bottom', 'Squeeze at the top'],
  is_compound: false, movement_pattern: 'push',
},
{
  name: 'Landmine Press',
  category: 'upper_push',
  equipment: ['full_gym'],
  archetypes: ['Athletic Performance', 'Hybrid Performer', 'Functional Strength & Conditioning', 'Strength Athlete'],
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 8, default_rest_seconds: 90, default_rpe: 7,
  coaching_cues: ['Single arm, staggered stance', 'Drive from the hip', 'Full lockout at the top'],
  is_compound: true, movement_pattern: 'push', min_experience: 'intermediate',
},
```

### Upper Pull additions (8 exercises)

```ts
{
  name: 'Lat Pulldown',
  category: 'upper_pull',
  equipment: ['full_gym'],
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 10, default_rest_seconds: 90, default_rpe: 7,
  coaching_cues: ['Lean back slightly', 'Pull to upper chest', 'Control the return'],
  is_compound: true, movement_pattern: 'pull',
},
{
  name: 'Seated Cable Row',
  category: 'upper_pull',
  equipment: ['full_gym'],
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 10, default_rest_seconds: 90, default_rpe: 7,
  coaching_cues: ['Drive elbows back', 'Squeeze shoulder blades', 'Avoid rounding forward'],
  is_compound: true, movement_pattern: 'pull',
},
{
  name: 'Dumbbell Row',
  category: 'upper_pull',
  equipment: ['full_gym', 'home_gym'],
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 10, default_rest_seconds: 60, default_rpe: 7,
  coaching_cues: ['Brace on the bench', 'Elbow close to body', 'Full stretch at the bottom'],
  is_compound: false, movement_pattern: 'pull',
},
{
  name: 'Inverted Row',
  category: 'upper_pull',
  equipment: ['full_gym', 'home_gym'],
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 10, default_rest_seconds: 60, default_rpe: 7,
  coaching_cues: ['Body straight like a plank', 'Pull chest to bar', 'Easier = raise bar, harder = lower it'],
  is_compound: true, movement_pattern: 'pull',
},
{
  name: 'Cable Face Pull',
  category: 'upper_pull',
  equipment: ['full_gym'],
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 15, default_rest_seconds: 45, default_rpe: 6,
  coaching_cues: ['Pull to face height', 'External rotate at the top', 'Light weight, feel the rear delt'],
  is_compound: false, movement_pattern: 'pull',
},
{
  name: 'Chest-Supported Row',
  category: 'upper_pull',
  equipment: ['full_gym'],
  archetypes: ['Bodybuilder', 'Strength Athlete', 'General Fitness', 'Athletic Performance'],
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 10, default_rest_seconds: 90, default_rpe: 7,
  coaching_cues: ['Chest on pad removes lower back', 'Full range of motion', 'Squeeze at the top'],
  is_compound: true, movement_pattern: 'pull',
},
{
  name: 'Single Arm Lat Pulldown',
  category: 'upper_pull',
  equipment: ['full_gym'],
  archetypes: ['Bodybuilder', 'General Fitness', 'Athletic Performance', 'Functional Strength & Conditioning'],
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 12, default_rest_seconds: 60, default_rpe: 7,
  coaching_cues: ['Control rotation', 'Full stretch at top', 'Drive elbow to hip'],
  is_compound: false, movement_pattern: 'pull',
},
{
  name: 'Meadows Row',
  category: 'upper_pull',
  equipment: ['full_gym'],
  archetypes: ['Bodybuilder', 'Strength Athlete', 'Athletic Performance'],
  phases: NO_DELOAD,
  default_sets: 3, default_reps: 8, default_rest_seconds: 90, default_rpe: 8,
  coaching_cues: ['Landmine setup, perpendicular stance', 'Drive elbow high and wide', 'Massive stretch at bottom'],
  is_compound: true, movement_pattern: 'pull', min_experience: 'advanced',
},
```

### Lower Body additions (6 exercises)

```ts
{
  name: 'Bodyweight Squat',
  category: 'lower',
  equipment: ALL_EQUIPMENT,
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 15, default_rest_seconds: 45, default_rpe: 5,
  coaching_cues: ['Feet shoulder-width', 'Knees track over toes', 'Chest up throughout'],
  is_compound: true, movement_pattern: 'squat',
},
{
  name: 'Step-Up',
  category: 'lower',
  equipment: ['full_gym', 'home_gym'],
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 10, default_rest_seconds: 60, default_rpe: 6,
  coaching_cues: ['Drive through the heel on the box', 'Control the descent', 'Alternate legs or complete one side'],
  is_compound: true, movement_pattern: 'squat',
},
{
  name: 'Glute Bridge',
  category: 'lower',
  equipment: ALL_EQUIPMENT,
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 15, default_rest_seconds: 45, default_rpe: 5,
  coaching_cues: ['Drive hips to ceiling', 'Squeeze glutes at top', 'Feet flat, knees at 90 degrees'],
  is_compound: false, movement_pattern: 'hinge',
},
{
  name: 'Nordic Hamstring Curl',
  category: 'lower',
  equipment: ['full_gym'],
  archetypes: ['Athletic Performance', 'Hybrid Performer', 'Strength Athlete', 'Functional Strength & Conditioning'],
  phases: NO_DELOAD,
  default_sets: 3, default_reps: 5, default_rest_seconds: 120, default_rpe: 8,
  coaching_cues: ['Anchor feet firmly', 'Lower under control — this is the work', 'Use hands to push up if needed'],
  is_compound: false, movement_pattern: 'hinge', min_experience: 'intermediate',
},
{
  name: 'Single Leg Romanian Deadlift',
  category: 'lower',
  equipment: ['full_gym', 'home_gym'],
  archetypes: ['Athletic Performance', 'Hybrid Performer', 'General Fitness', 'Functional Strength & Conditioning'],
  phases: ALL_PHASES,
  default_sets: 3, default_reps: 8, default_rest_seconds: 60, default_rpe: 7,
  coaching_cues: ['Hip hinge, not a squat', 'Keep hips level throughout', 'Soft knee on the standing leg'],
  is_compound: true, movement_pattern: 'hinge', min_experience: 'intermediate',
},
{
  name: 'Wall Sit',
  category: 'lower',
  equipment: ALL_EQUIPMENT,
  archetypes: ALL_ARCHETYPES,
  phases: ALL_PHASES,
  default_sets: 3, default_reps: '30s', default_rest_seconds: 60, default_rpe: 6,
  coaching_cues: ['90 degree knee angle', 'Back flat against wall', 'Drive through heels'],
  is_compound: false, movement_pattern: 'squat',
},
```

### Endurance/Event-Specific additions (4 exercises)

```ts
{
  name: 'Strides 6×100m',
  category: 'conditioning',
  equipment: ALL_EQUIPMENT,
  archetypes: ['Endurance Athlete'],
  phases: ALL_PHASES,
  default_sets: 1, default_reps: '6×100m', default_rest_seconds: 60, default_rpe: 7,
  coaching_cues: ['Controlled acceleration to 90% effort', 'Focus on form not speed', 'Full recovery between each'],
  is_compound: false, conditioning_type: 'interval', movement_pattern: 'conditioning',
},
{
  name: 'Fartlek Run 30min',
  category: 'conditioning',
  equipment: ALL_EQUIPMENT,
  archetypes: ['Endurance Athlete', 'Hybrid Performer'],
  phases: ['foundation', 'build'],
  default_sets: 1, default_reps: '30min', default_rest_seconds: 0, default_rpe: 7,
  coaching_cues: ['Alternate effort spontaneously', 'Hard surges of 30-60 seconds', 'Easy jog recovery between efforts'],
  is_compound: false, conditioning_type: 'steady_state', movement_pattern: 'conditioning',
},
{
  name: 'Race Pace Run 5km',
  category: 'conditioning',
  equipment: ALL_EQUIPMENT,
  archetypes: ['Endurance Athlete'],
  phases: ['build', 'peak'],
  default_sets: 1, default_reps: '5km', default_rest_seconds: 0, default_rpe: 8,
  coaching_cues: ['Sustain your goal race pace', 'Even effort throughout', 'This is race rehearsal'],
  is_compound: false, conditioning_type: 'steady_state', movement_pattern: 'conditioning',
},
{
  name: 'Open Water Swim Simulation 30min',
  category: 'conditioning',
  equipment: ['full_gym'],
  archetypes: ['Endurance Athlete'],
  phases: ALL_PHASES,
  default_sets: 1, default_reps: '30min', default_rest_seconds: 0, default_rpe: 7,
  coaching_cues: ['Sight every 10 strokes', 'Bilateral breathing practice', 'Moderate effort, focus on form'],
  is_compound: false, conditioning_type: 'steady_state', movement_pattern: 'conditioning',
},
```

### Part 2 Verification

- `grep -c "name:" src/lib/planGeneration/exerciseLibrary.ts` should show ~121 exercises
- Regenerate beginner General Fitness: confirm Lat Pulldown and Dumbbell Bench Press appear, Conventional Deadlift and Pull-Up do NOT
- Regenerate advanced Strength Athlete: confirm Barbell Back Squat, Conventional Deadlift, Pull-Up all appear
- Paste both Day 1 main_lifts as evidence

---

## PART 3 — SECONDARY GOAL EFFECTIVENESS

### Step 3.1 — Replace `GOAL_FOCUS_MAP` with richer config

```ts
interface SecondaryGoalConfig {
  inject_focuses: Focus[]
  extra_sets?: number
  inject_count?: number
}

const GOAL_CONFIG_MAP: Record<SecondaryGoal, SecondaryGoalConfig> = {
  improve_athleticism:          { inject_focuses: ['agility', 'plyometric'], inject_count: 2 },
  increase_explosiveness:       { inject_focuses: ['power', 'plyometric'], inject_count: 2 },
  improve_mobility_flexibility: { inject_focuses: ['mobility'], inject_count: 1 },
  build_mental_toughness:       { inject_focuses: ['conditioning'], extra_sets: 1, inject_count: 1 },
  improve_cardio_base:          { inject_focuses: ['conditioning'], inject_count: 2 },
  lose_body_fat:                { inject_focuses: ['conditioning'], inject_count: 2 },
  build_muscle:                 { inject_focuses: ['upper_push', 'upper_pull', 'lower'], extra_sets: 1, inject_count: 2 },
  improve_body_composition:     { inject_focuses: ['conditioning', 'lower'], inject_count: 2 },
  improve_core_strength:        { inject_focuses: ['core'], inject_count: 2 },
  improve_posture:              { inject_focuses: ['upper_pull', 'core'], inject_count: 2 },
  injury_prevention:            { inject_focuses: ['mobility', 'core'], inject_count: 2 },
  improve_balance_coordination: { inject_focuses: ['agility', 'core'], inject_count: 2 },
  increase_work_capacity:       { inject_focuses: ['conditioning'], extra_sets: 1, inject_count: 1 },
  improve_recovery:             { inject_focuses: ['mobility'], inject_count: 2 },
  build_endurance_base:         { inject_focuses: ['conditioning'], inject_count: 2 },
  increase_raw_strength:        { inject_focuses: ['lower', 'upper_push', 'upper_pull'], extra_sets: 1, inject_count: 1 },
}
```

### Step 3.2 — Update injection function to inject up to 2 exercises

Rename `injectExtraAccessory` to `injectSecondaryGoalWork` and update to:
- Inject `inject_count` exercises (not just 1)
- Apply `extra_sets` to main_lifts when configured
- Use different rotation offsets per injected exercise so the same exercise doesn't appear twice
- Never inject core exercises into accessories (they go to core_stability)
- Guard against injecting the same exercise twice in one session

### Step 3.3 — Show secondary goals in session UI

In `DayCard.tsx`, when the session has secondary goal work injected (detectable from the plan's stored `secondary_goals` array), show a subtle note below the session header:

```
"Includes: Build Muscle · Improve Core Strength"
```

Read secondary goals from the plan object — it's already stored in Supabase on the plans row. If secondary_goals is empty or null, show nothing.

### Part 3 Verification

Generate two plans — one with `secondary_goals: ['build_muscle']`, one with `[]`. Paste complete accessories arrays for Day 1 of both. Confirm:
- build_muscle plan: 2 additional accessories from upper_push/upper_pull/lower categories
- build_muscle plan: main_lifts each have 1 extra set
- Empty secondary goals plan: no additional accessories

Generate plan with `secondary_goals: ['increase_explosiveness']`. Confirm power/plyometric exercises appear in accessories.

---

## FINAL VERIFICATION

Generate four plans and paste Day 1-3 main_lifts + accessories for each:
1. Beginner, General Fitness, no secondary goals
2. Advanced, Strength Athlete, secondary_goal: `increase_raw_strength`
3. Intermediate, Hybrid Performer, secondary_goal: `improve_cardio_base`
4. Advanced, HYROX Competitor (confirm HYROX content unchanged)

Confirm for each:
- Experience-appropriate exercises only
- Secondary goals produce visible, named changes to session content
- No movement pattern violations
- `pnpm tsc -b --force` passes throughout
