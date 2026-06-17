# GRYT — Plan Quality Fix: General Health Archetype Split
## Claude Code Executable Patch
**Scope:** `src/lib/planGeneration/classifyArchetype.ts` and `src/lib/planGeneration/selectSplit.ts` ONLY
**Do not touch:** Any other file. Do not modify Bodybuilder, Strength Athlete, Endurance Athlete, Hybrid Performer, or Athletic Performance templates — those are confirmed working correctly.

---

## THE BUG

Four distinct primary goals — `general_fitness`, `mobility`, `fat_loss`, and `functional_strength_conditioning` — all classify into a single archetype, `General Health`, via the `default` case in `classifyArchetype.ts`. That archetype's template in `selectSplit.ts` is seven nearly-identical entries, all named "Full Body" with Roman numeral suffixes, all sharing the identical focus array `['upper_push', 'upper_pull', 'lower', 'core']`. This produces a flat, undifferentiated programme regardless of which of the four goals the user actually selected — confirmed by testing both Functional Strength & Conditioning and General Fitness, which produced identical output.

## THE FIX

Split `General Health` into four distinct archetypes, each with its own dedicated session template set. This requires changes in both files: the `Archetype` type itself gains new members, `classifyArchetype` routes each goal to its correct new archetype instead of the shared default, and `selectSplit` gets four new template arrays replacing the single flat one.

---

## PART 1 — UPDATE THE ARCHETYPE TYPE

Find wherever `Archetype` is defined (likely `src/types/plan.types.ts` — confirm the exact location before editing) and update it.

**Current (assumed):**
```ts
export type Archetype =
  | 'Bodybuilder'
  | 'Strength Athlete'
  | 'Endurance Athlete'
  | 'Hybrid Performer'
  | 'General Health'
  | 'Athletic Performance'
```

**New:**
```ts
export type Archetype =
  | 'Bodybuilder'
  | 'Strength Athlete'
  | 'Endurance Athlete'
  | 'Hybrid Performer'
  | 'General Fitness'
  | 'Mobility Focus'
  | 'Fat Loss'
  | 'Functional Strength & Conditioning'
  | 'Athletic Performance'
```

`General Health` is removed entirely — it's replaced by four specific archetypes. Search the codebase for any other reference to the literal string `'General Health'` (e.g. in Dashboard phase badges, Kwazi context injection, or anywhere else an `Archetype` value might be displayed or branched on) and update those references to handle the four new values instead. Run this check before considering this part done:

```bash
grep -rn "'General Health'\|\"General Health\"" src/
```

Every result needs to be addressed — do not leave a dangling reference to a value that no longer exists in the type.

---

## PART 2 — UPDATE `classifyArchetype.ts`

Replace the current `default` fallthrough with explicit routing for each goal:

```ts
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
      if (eventType === 'hyrox') return 'Hybrid Performer'
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
```

Note: the `event_specific` case with no matching event type now falls back to `General Fitness` instead of the removed `General Health` — this is a reasonable default and keeps that branch's behaviour equivalent to what it was, just renamed.

---

## PART 3 — UPDATE `selectSplit.ts`

Remove the single `'General Health'` entry from `ARCHETYPE_TEMPLATES` and replace it with four new entries. Each is described below with its design rationale — implement exactly as specified, do not substitute generic "Full Body" templates for any of these.

### General Fitness — Upper/Lower split (2-day rotation)

Balanced, sustainable, recoverable. The right default for someone with no specialised goal.

```ts
'General Fitness': [
  { session_name: 'Upper Body', focus: ['upper_push', 'upper_pull', 'core'] },
  { session_name: 'Lower Body', focus: ['lower', 'core'] },
  { session_name: 'Upper Body II', focus: ['upper_push', 'upper_pull', 'core'] },
  { session_name: 'Lower Body II', focus: ['lower', 'core'] },
  { session_name: 'Upper Body III', focus: ['upper_push', 'upper_pull', 'core'] },
  { session_name: 'Lower Body III', focus: ['lower', 'core'] },
  { session_name: 'Full Body Finisher', focus: ['upper_push', 'upper_pull', 'lower', 'conditioning'] },
],
```

### Mobility Focus — mobility and core-led, light strength support

For someone whose primary goal is movement quality and flexibility — not a strength split with stretching added on.

```ts
'Mobility Focus': [
  { session_name: 'Mobility Flow', focus: ['mobility', 'core'] },
  { session_name: 'Strength Support', focus: ['lower', 'upper_push', 'mobility'] },
  { session_name: 'Mobility Flow II', focus: ['mobility', 'lateral', 'core'] },
  { session_name: 'Strength Support II', focus: ['upper_pull', 'lower', 'mobility'] },
  { session_name: 'Mobility Flow III', focus: ['mobility', 'core'] },
  { session_name: 'Full Body Mobility', focus: ['mobility', 'upper_push', 'upper_pull', 'lower'] },
  { session_name: 'Active Recovery', focus: ['mobility', 'core'] },
],
```

### Fat Loss — conditioning-forward full body, every session pairs strength with a metabolic finisher

Resistance work preserves muscle during a deficit; the conditioning component drives work capacity and supports the deficit itself. Neither pure strength days nor pure cardio days alone serve this goal as well as the combination.

```ts
'Fat Loss': [
  { session_name: 'Strength & Conditioning', focus: ['upper_push', 'lower', 'conditioning'] },
  { session_name: 'Strength & Conditioning II', focus: ['upper_pull', 'lower', 'conditioning'] },
  { session_name: 'Metabolic Circuit', focus: ['conditioning', 'core', 'lower'] },
  { session_name: 'Strength & Conditioning III', focus: ['upper_push', 'upper_pull', 'conditioning'] },
  { session_name: 'Metabolic Circuit II', focus: ['conditioning', 'core', 'lower'] },
  { session_name: 'Full Body Burn', focus: ['upper_push', 'upper_pull', 'lower', 'conditioning'] },
  { session_name: 'Active Recovery Circuit', focus: ['conditioning', 'core'] },
],
```

### Functional Strength & Conditioning — full body, varied daily focus combination (not the same four categories repeated)

Per explicit confirmation: stays full-body in character, but each day emphasises a different combination so back-to-back sessions don't feel interchangeable.

```ts
'Functional Strength & Conditioning': [
  { session_name: 'Strength Dominant', focus: ['upper_push', 'upper_pull', 'lower'] },
  { session_name: 'Conditioning Dominant', focus: ['conditioning', 'core', 'lower'] },
  { session_name: 'Strength & Carries', focus: ['lower', 'loaded_carry', 'upper_pull'] },
  { session_name: 'Conditioning & Core', focus: ['conditioning', 'core', 'agility'] },
  { session_name: 'Strength Dominant II', focus: ['upper_push', 'upper_pull', 'lower'] },
  { session_name: 'Full Functional Circuit', focus: ['upper_push', 'lower', 'conditioning', 'loaded_carry'] },
  { session_name: 'Conditioning Dominant II', focus: ['conditioning', 'core', 'lower'] },
],
```

### Update the `Record<Archetype, SessionTemplate[]>` type

The `ARCHETYPE_TEMPLATES` constant is typed as `Record<Archetype, SessionTemplate[]>`. Since `Archetype` now has four new members replacing one, TypeScript will require all four to be present with no `'General Health'` key remaining. After pasting in the four new template arrays above and removing the old `'General Health'` entry, run `pnpm tsc --noEmit` — if any key is missing or misnamed, TypeScript will fail to compile with a clear "missing property" error pointing at exactly which archetype key is absent. Use that compiler error as your verification rather than manually re-checking the object by eye.

---

## PART 4 — VERIFICATION

After implementing both files:

```bash
grep -rn "'General Health'\|\"General Health\"" src/
```
Must return zero results anywhere in the codebase.

```bash
pnpm tsc --noEmit
```
Must pass with zero errors — this is the strongest signal that every archetype key is correctly accounted for.

Then test in the browser, for real, not just by reading code:

1. Regenerate a plan with primary goal **General Fitness** → confirm sessions alternate Upper Body / Lower Body, not flat full-body
2. Regenerate with **Mobility** → confirm mobility-led sessions, not a strength split
3. Regenerate with **Fat Loss** → confirm each session pairs strength with a conditioning component
4. Regenerate with **Functional Strength & Conditioning** → confirm session names and focus combinations vary day to day (Strength Dominant ≠ Conditioning Dominant ≠ Strength & Carries)
5. Spot-check that **Bodybuilder**, **Strength Athlete**, **Endurance Athlete**, **Hybrid Performer**, and **Athletic Performance** templates are byte-for-byte unchanged from before this patch — this confirms the fix was scoped correctly and didn't disturb working archetypes

For each of the four regenerated plans, open the actual `workouts` rows in Supabase and confirm `session_name` differs across days within the same week, and that `main_lifts`/`accessories` focus genuinely reflects what each day's `focus` array specifies — don't just trust that the session name looks right without checking the underlying exercise selection actually matches.
