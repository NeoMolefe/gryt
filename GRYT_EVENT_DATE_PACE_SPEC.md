# GRYT — Event Date & Goal Pace Engine
## Claude Code Executable Specification
**Scope:** Onboarding conditional step, plan timeline calculation, pace-zone prescription
**Depends on:** Existing Event Specific onboarding flow (event_type field, conditional step)
**Do not touch:** Exercise library content, HYROX-specific exercises — that's a separate spec
**This spec does NOT fix the "Assault Bike in Easy Run" bug** — that's also a separate spec, see note at the end

---

## WHY THIS IS HARDER THAN IT SOUNDS — READ BEFORE IMPLEMENTING

Two real engineering problems are being solved here, not one cosmetic addition.

**Problem 1 — Backward timeline calculation.** The existing plan generator (`buildStructure.ts` per the master build prompt) currently sizes the programme FORWARD from availability_days: more days available → longer programme, with phase splits as fixed percentages (Foundation 30%, Build 40%, Peak 20%, Deload 10%). This spec inverts that logic for event-specific goals: the programme is now sized BACKWARD from a fixed end date (the event), and the percentages still apply but to whatever total duration exists between today and the event — which could be as short as 6 weeks or as long as 40+. The math is straightforward; the part that requires care is making sure this new backward-calculation path doesn't silently corrupt the existing forward-calculation path used by every non-event goal. These must be two clearly separated code paths, not one function with a conditional patched into the middle of it.

**Problem 2 — Goal pace doesn't reduce to one number for every event type.** A marathon goal time converts cleanly to a single pace (minutes per km). HYROX, Triathlon, and Cycling do not work this way — HYROX is eight stations of mixed strength and running with no single "pace," Triathlon has three separate disciplines each with their own pace/effort profile, and Cycling has its own speed metric that isn't directly comparable to running pace. Building a fake unified formula that pretends otherwise would produce confidently wrong training targets, which is worse than no targets at all. This spec handles running events (Marathon, Half Marathon, 5km, 10km, 15km) with real Riegel-based pace zones, and handles HYROX, Triathlon, and Cycling with a goal-time-aware EFFORT framework instead of a fabricated pace — explained fully in Part 4. Do not deviate from this split; do not invent a HYROX "pace" or a Triathlon single pace number.

---

## PART 1 — ONBOARDING: ADD EVENT DATE AND GOAL TIME FIELDS

These are added to the existing conditional "What are you training for?" step (the one that already appears when primary goal is Event Specific). Do not create a new step — extend the existing one.

After the event type chip selection, and after the existing Triathlon swim-coaching notice (if applicable), add:

**Event date field:**
```
Label: "When is your event?"
Input type: date picker
Required: yes — block progression until a valid future date is entered
Validation: must be at least 1 day in the future. If a past or today's date is
entered, show inline error: "Your event date needs to be in the future."
```

**Goal finish time field — only shown for these event types:**
`marathon`, `half_marathon`, `race_5k`, `race_10k`, `race_15k`, `hyrox`, `triathlon`, `cycling`

```
Label: "What's your goal finish time?" (running events)
       "What's your goal HYROX time?" (hyrox)
       "What's your goal triathlon time?" (triathlon)
       "What's your goal ride time?" (cycling)

Input: two number fields side by side — Hours / Minutes
       (no seconds field needed at this precision level)
Required: NO — this field is optional. Add a "Skip — I don't have a goal time yet"
text link beneath it.
Validation if entered: must be greater than 0. Sanity-check against event type —
e.g. a goal time of "12 minutes" for a Marathon is implausible; show a soft
inline warning (not blocking): "That seems fast for a marathon — double check
the hours/minutes." Do not hard-block on this, since elite times exist and you
don't want to incorrectly prevent a legitimate fast goal — just prompt a
second look.
```

**Data model — add to `profiles` table:**

```sql
alter table public.profiles
  add column if not exists event_date date,
  add column if not exists goal_time_minutes integer;

NOTIFY pgrst, 'reload schema';
```

`goal_time_minutes` stores the total goal time in minutes (convert hours+minutes to a single integer at submission time) — simpler to do pace math against one number than two separate fields downstream. Store `null` if the user skipped it.

**Update `OnboardingData` type and `submit.ts`** to include `eventDate: string | null` and `goalTimeMinutes: number | null`, following the exact same pattern as every other onboarding field already in that file — read from form state, write to the matching real column name. Given today's history with field-name mismatches, triple-check the column name written in `submit.ts` literally matches `event_date` and `goal_time_minutes` as just defined above, character for character, before considering this done.

**Update onboarding summary review step** to display both new fields with Edit buttons, consistent with every other field already shown there.

---

## PART 2 — BACKWARD TIMELINE CALCULATION

Create a new file: `src/lib/planGeneration/buildEventTimeline.ts`

This is a SEPARATE function from the existing `buildStructure.ts`. Do not modify `buildStructure.ts` — it continues to handle every non-event goal exactly as it does today. The plan generation entry point (`generatePlan.ts`) decides which of the two to call based on whether `primary_goal === 'event_specific'` and `event_date` is present.

```ts
// src/lib/planGeneration/buildEventTimeline.ts

import type { Phase } from '@/types/plan.types'

export interface PhaseWeekRange {
  phase: Phase
  start_week: number
  end_week: number
  week_count: number
}

export interface EventTimeline {
  total_weeks: number
  phases: PhaseWeekRange[]
  weeks_until_event: number
}

/**
 * Calculates phase boundaries working backward from a fixed event date.
 * Peak phase always ends on the week containing the event.
 * Deload (taper) is the final 1-2 weeks directly before the event.
 * Foundation and Build fill the remaining time proportionally.
 */
export function buildEventTimeline(eventDate: string, today: Date = new Date()): EventTimeline {
  const event = new Date(eventDate)
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksUntilEvent = Math.max(1, Math.ceil((event.getTime() - today.getTime()) / msPerWeek))

  const totalWeeks = weeksUntilEvent

  // Taper/deload: always the final week before the event. If 2+ weeks remain
  // after accounting for a minimum 1-week Foundation and Build, use a 2-week
  // taper for events 10+ weeks out; otherwise a 1-week taper.
  const taperWeeks = totalWeeks >= 10 ? 2 : 1

  const trainingWeeks = Math.max(1, totalWeeks - taperWeeks)

  // Apply existing percentage split (Foundation 30% / Build 40% / Peak 20%)
  // to whatever trainingWeeks exists, then append taper as Deload.
  // Minimum 1 week per phase, regardless of how short the total is —
  // this satisfies "compress proportionally even if very short."
  const foundationWeeks = Math.max(1, Math.round(trainingWeeks * 0.3))
  const peakWeeks = Math.max(1, Math.round(trainingWeeks * 0.2))
  const buildWeeks = Math.max(1, trainingWeeks - foundationWeeks - peakWeeks)

  let cursor = 1
  const phases: PhaseWeekRange[] = []

  phases.push({ phase: 'foundation', start_week: cursor, end_week: cursor + foundationWeeks - 1, week_count: foundationWeeks })
  cursor += foundationWeeks

  phases.push({ phase: 'build', start_week: cursor, end_week: cursor + buildWeeks - 1, week_count: buildWeeks })
  cursor += buildWeeks

  phases.push({ phase: 'peak', start_week: cursor, end_week: cursor + peakWeeks - 1, week_count: peakWeeks })
  cursor += peakWeeks

  phases.push({ phase: 'deload', start_week: cursor, end_week: cursor + taperWeeks - 1, week_count: taperWeeks })
  cursor += taperWeeks

  // Reconcile rounding drift: if the sum of phase weeks doesn't exactly equal
  // totalWeeks due to Math.round, adjust the Build phase (the largest, most
  // forgiving block) by the difference rather than leaving a gap or overlap.
  const computedTotal = cursor - 1
  const drift = totalWeeks - computedTotal
  if (drift !== 0) {
    const buildPhase = phases.find((p) => p.phase === 'build')!
    buildPhase.end_week += drift
    buildPhase.week_count += drift
    // Shift every phase after Build by the same drift so there's no gap
    const peakPhase = phases.find((p) => p.phase === 'peak')!
    const deloadPhase = phases.find((p) => p.phase === 'deload')!
    peakPhase.start_week += drift
    peakPhase.end_week += drift
    deloadPhase.start_week += drift
    deloadPhase.end_week += drift
  }

  return { total_weeks: totalWeeks, phases, weeks_until_event: weeksUntilEvent }
}
```

**Far-future events:** per confirmed decision, no cap is applied — if `weeksUntilEvent` is 40, Foundation will be roughly 12 weeks (30% of ~38 training weeks), which is intentional. Do not add an artificial ceiling.

**Near-term events:** per confirmed decision, if `weeksUntilEvent` is 6, every phase still gets a minimum of 1 week via the `Math.max(1, ...)` guards above, and the percentage split still applies to whatever's left — this naturally produces very short phases rather than blocking the user, exactly as decided.

---

## PART 3 — WIRE THE TIMELINE INTO PLAN GENERATION

In `generatePlan.ts`, locate where `buildStructure()` is currently called (per the original master build prompt, Phase 3.3). Add a branch:

```ts
import { buildEventTimeline } from './buildEventTimeline'
import { buildStructure } from './buildStructure'

// ...inside generatePlan, replacing the single buildStructure() call:

const timeline =
  data.primaryGoal === 'event_specific' && data.eventDate
    ? buildEventTimeline(data.eventDate)
    : buildStructure(data.availabilityDays)
```

Whatever downstream code consumes the output of `buildStructure()` today (week numbering, phase assignment per session, total_weeks written to the `plans` table) needs to consume the shape returned by `buildEventTimeline()` instead, when that branch is taken. Since both functions should return a comparable shape (`total_weeks` + a phase-to-week-range mapping), this should be a narrow adapter rather than a rewrite — but verify the exact shape `buildStructure()` currently returns before assuming the two are interchangeable, and adjust `buildEventTimeline`'s return shape to match if they differ, rather than writing two incompatible consumers.

After this change, run:
```bash
pnpm tsc --noEmit
```
and fix any type mismatches between the two timeline sources before proceeding.

---

## PART 4 — GOAL PACE / EFFORT PRESCRIPTION

### Running events (Marathon, Half Marathon, 5km, 10km, 15km) — real pace zones via Riegel

Create `src/lib/planGeneration/calculateGoalPace.ts`

```ts
// Riegel formula: T2 = T1 * (D2/D1)^1.06
// Used here to convert a goal time at the user's target event distance
// into equivalent paces at other distances/efforts, and into training zones.

const EVENT_DISTANCES_KM: Record<string, number> = {
  marathon: 42.2,
  half_marathon: 21.1,
  race_15k: 15,
  race_10k: 10,
  race_5k: 5,
}

export interface PaceZones {
  goal_pace_min_per_km: number
  easy_pace_min_per_km: number
  tempo_pace_min_per_km: number
  interval_pace_min_per_km: number
}

export function calculateGoalPace(
  eventType: keyof typeof EVENT_DISTANCES_KM,
  goalTimeMinutes: number,
): PaceZones | null {
  const distance = EVENT_DISTANCES_KM[eventType]
  if (!distance || !goalTimeMinutes) return null

  const goalPace = goalTimeMinutes / distance // min per km at goal effort

  return {
    goal_pace_min_per_km: round2(goalPace),
    // Easy runs: 20-25% slower than goal race pace — aerobic base building,
    // should feel conversational, not race effort.
    easy_pace_min_per_km: round2(goalPace * 1.22),
    // Tempo: 5-8% slower than goal pace — comfortably hard, threshold work.
    tempo_pace_min_per_km: round2(goalPace * 1.065),
    // Intervals: at or slightly faster than goal pace — builds speed reserve
    // above race requirement.
    interval_pace_min_per_km: round2(goalPace * 0.96),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
```

**Apply this in `prescribe.ts`** (the existing prescription logic per the master build prompt): when the session's archetype is Endurance Athlete or Athletic Performance AND the user has event_type in the running-events list AND `goal_time_minutes` is present, attach the relevant pace zone to each conditioning exercise's `load_guidance` field instead of the generic "Zone 2" or RPE-only guidance currently used. Display format: `"4:45/km (goal pace)"` for goal-pace work, `"5:48/km (easy)"` for easy runs, etc. — round to whole seconds for display, not the raw decimal.

If `goal_time_minutes` is null (user skipped it), fall back to the existing RPE/Zone-based guidance exactly as it works today — do not show a broken or placeholder pace value.

### HYROX, Triathlon, Cycling — effort framework, NOT a fabricated pace

Do not attempt to convert a HYROX or Triathlon goal time into a single pace number — it is not mathematically meaningful and would mislead the user. Instead:

**HYROX:** Store `goal_time_minutes` and use it only to set an overall session intensity target via Kwazi context and a simple "goal pace per station" rough guide shown as supplementary text, not as a precise prescription:
```
If goal_time_minutes is present, calculate an implied "per-station budget":
  goal_time_minutes / 8 stations = rough minutes per station
Display this once, in the Plan view header or a tooltip, as:
  "Goal: sub-[H]:[MM] — roughly [X] min per station including transitions."
Do not use this number to set sets/reps/rest for individual exercises —
it's directional context for the athlete and for Kwazi, not a prescription input.
```

**Triathlon:** If the user provides a goal time, do not attempt to split it across swim/bike/run automatically — you don't know their relative strengths across disciplines, and a wrong split is actively misleading. Store the goal time, show it as a target on the Plan view, and pass it to Kwazi's context as: `"User's goal triathlon finish time is [H]:[MM]. They have not specified a split across disciplines — if asked, help them think through a realistic split based on their training history rather than assuming an even split."`

**Cycling:** Same approach as Triathlon — store and display the goal time, do not derive a fabricated "pace," pass to Kwazi context as directional information only.

### Kwazi context update

In the Kwazi system prompt injection (per the master build prompt's Phase 6.1), add, when applicable:
```
Event: [event_type], on [event_date] ([weeks_until_event] weeks away).
Goal time: [goal_time_minutes formatted as H:MM] (if provided; omit this line
entirely if the user skipped it — do not say "no goal time set," just leave
the line out).
```

---

## PART 5 — DASHBOARD & PLAN VIEW DISPLAY

On the Dashboard, beneath the existing event badge ("TRAINING FOR: HYROX"), add a countdown:
```
"[N] weeks to event" — calculated live from event_date, not stored statically,
since this needs to count down as time passes without requiring a plan regeneration.
```

In the Plan view header, where it currently shows "12-Week HYROX Programme" (per the original event-specific spec), update the week count to reflect the ACTUAL calculated total_weeks from buildEventTimeline, not a hardcoded 12 — this was likely already a static string in the original implementation and needs to become dynamic now that plan length varies per user.

---

## VERIFICATION CHECKLIST

- [ ] Event date field appears in onboarding, blocks progression if missing or in the past
- [ ] Goal time field appears for all 8 applicable event types, is skippable, shows soft warning on implausible values without blocking
- [ ] `profiles` table has `event_date` and `goal_time_minutes` columns — confirm via Supabase Table Editor, not just by reading the migration SQL
- [ ] Submit a test Marathon event 20 weeks out → confirm generated plan's `total_weeks` ≈ 20, and Peak phase lands in the final weeks before the event date
- [ ] Submit a test event only 6 weeks out → confirm plan still generates (doesn't block), with compressed phases, each at least 1 week
- [ ] Submit a test event 40+ weeks out → confirm Foundation phase stretches long, plan still generates without a hard cap
- [ ] Submit a Marathon goal time of 4:00 (240 minutes) → confirm `calculateGoalPace` returns sensible zones (~5:41/km goal pace, ~6:56/km easy, ~6:03/km tempo, ~5:27/km interval — check your own implementation's actual output against these reference figures)
- [ ] Confirm running-event sessions show real pace values in `load_guidance`, not generic RPE-only text, when goal time was provided
- [ ] Confirm skipping goal time falls back cleanly to existing RPE guidance with no broken display
- [ ] Confirm HYROX with a goal time shows the per-station rough budget, and does NOT show a fabricated "pace"
- [ ] Confirm Triathlon and Cycling goal times are stored and displayed but never converted into a fake single pace
- [ ] Dashboard shows a live "[N] weeks to event" countdown for any user with event_date set
- [ ] Plan view header week count is dynamic, not hardcoded to 12
- [ ] `pnpm tsc --noEmit` passes
- [ ] Existing non-event goals (everything tested in the previous patch — General Fitness, Mobility, Fat Loss, Functional Strength & Conditioning, plus Bodybuilder/Strength Athlete/etc.) are completely unaffected — regenerate one of these and confirm `buildStructure()` is still the function being called, not `buildEventTimeline()`

---

## WHAT THIS SPEC DOES NOT FIX

The marathon long-run duration concern (45min long runs being too short for Build/Peak phases) and the Assault Bike Tabata appearing inside an Easy Run session are separate, distinct bugs from what's fixed here. The first is a content/prescription design fix in `prescribe.ts` and the exercise duration values themselves. The second looks like a session-assembly bug in `selectExercises.ts` — likely the exercise selection logic isn't filtering strictly enough by session focus, allowing a `conditioning` category exercise tagged for general use to be selected into a slot that should only pull from running-specific exercises. Both are real and worth fixing, but are scoped into a separate spec so this one stays testable in isolation.
