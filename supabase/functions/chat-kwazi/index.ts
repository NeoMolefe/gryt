import { createClient } from 'jsr:@supabase/supabase-js@2'
import { EXERCISE_LIBRARY, type LibraryExercise } from './exerciseLibrary.ts'

const DAILY_LIMIT = 10
const ANTHROPIC_MODEL = 'claude-sonnet-4-6'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type Scope = 'single_session' | 'this_week' | 'permanent'

interface SwapPair {
  original: string
  replacement: string
}

interface PendingSwap {
  stage: 'diagnostic' | 'confirm'
  kind: 'injury' | 'equipment'
  bodyPart?: string
  workoutId: string
  targets: string[]
  swaps: SwapPair[]
  scope?: Scope
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  userId: string
  messages: ChatMessage[]
  pendingSwap?: PendingSwap | null
  currentWorkoutId?: string | null
}

interface KwaziResponse {
  reply: string | null
  chips?: string[] | null
  blocked: boolean
  remaining: number
  reason?: string
  escalate?: boolean
  pendingSwap?: PendingSwap | null
  swapApplied?: { swaps: SwapPair[]; scope: Scope } | null
}

const ESCALATION_KEYWORDS = [
  'doctor',
  'physio',
  'physiotherapist',
  'surgery',
  'surgeon',
  'diagnosis',
  'diagnose',
  'mri',
  'x-ray',
  'xray',
  'scan',
  'fracture',
  'fractured',
  'broken bone',
  'torn',
  'tear',
  'numbness',
  'numb',
  'tingling',
  'chest pain',
  'dizzy',
  'dizziness',
  'talk to a human',
  'speak to a human',
  'human coach',
  'speak to someone',
  'real person',
]

function jsonResponse(body: KwaziResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function containsEscalationKeyword(message: string): boolean {
  const lower = message.toLowerCase()
  return ESCALATION_KEYWORDS.some((kw) => lower.includes(kw))
}

// ── Swap detection ───────────────────────────────────────────────

const EQUIPMENT_PHRASES = [
  'no gym',
  'no equipment',
  'travelling',
  'traveling',
  'no access',
  'away from the gym',
  'hotel gym',
  'no barbell',
  'no dumbbell',
  'no dumbbells',
  'no machines',
  'bodyweight only',
  'don’t have a gym',
  "don't have a gym",
]

const SORENESS_REGEX = /\b([a-z][a-z\s]{1,20}?)\s+(?:hurts?|is sore|are sore|feels sore|feeling sore)\b/i
const CANT_DO_REGEX = /can'?t do (?:the |my )?([a-z0-9\-\s]{2,40}?)(?:\s+(?:today|anymore|right now))?[.!?]?$/i
const SWAP_REGEX = /\b(?:swap|replace|substitute(?: for)?)\s+(?:the |my )?([a-z0-9\-\s]{2,40}?)(?:\s+(?:for|with)\s+.+)?[.!?]?$/i

interface DetectedIntent {
  kind: 'injury' | 'equipment'
  bodyPart?: string
  exercisePhrase?: string | null
}

function detectSwapIntent(message: string): DetectedIntent | null {
  const lower = message.toLowerCase()

  for (const phrase of EQUIPMENT_PHRASES) {
    if (lower.includes(phrase)) {
      return { kind: 'equipment', exercisePhrase: null }
    }
  }

  const sorenessMatch = lower.match(SORENESS_REGEX)
  if (sorenessMatch) {
    return { kind: 'injury', bodyPart: sorenessMatch[1].trim(), exercisePhrase: sorenessMatch[1].trim() }
  }

  const cantDoMatch = lower.match(CANT_DO_REGEX)
  if (cantDoMatch) {
    return { kind: 'injury', exercisePhrase: cantDoMatch[1].trim() }
  }

  const swapMatch = lower.match(SWAP_REGEX)
  if (swapMatch) {
    return { kind: 'equipment', exercisePhrase: swapMatch[1].trim() }
  }

  return null
}

/** Best-effort match of a free-text phrase against the exercise names present in a workout. */
function matchWorkoutExercise(phrase: string, exerciseNames: string[]): string | null {
  const needle = phrase.toLowerCase().trim()
  if (!needle) return null

  for (const name of exerciseNames) {
    if (name.toLowerCase() === needle) return name
  }

  for (const name of exerciseNames) {
    const lowerName = name.toLowerCase()
    if (lowerName.includes(needle) || needle.includes(lowerName)) return name
  }

  const needleWords = needle.split(/\s+/).filter((w) => w.length > 2)
  for (const name of exerciseNames) {
    const lowerName = name.toLowerCase()
    if (needleWords.some((w) => lowerName.includes(w))) return name
  }

  return null
}

// ── Exercise replacement matching ────────────────────────────────

function findLibraryExercise(name: string): LibraryExercise | null {
  const lower = name.toLowerCase()
  return EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === lower) ?? null
}

const KNEE_EXCLUDED_CATEGORIES = ['lower', 'plyometric', 'sprint']
const SHOULDER_EXCLUDED_CATEGORIES = ['upper_push', 'upper_pull']

function findReplacement(
  original: LibraryExercise,
  opts: {
    equipment: string
    archetype: string
    phase: string
    excludeNames: string[]
    bodyPart?: string
    bodyweightOnly?: boolean
  },
): LibraryExercise {
  const excluded = new Set(opts.excludeNames.map((n) => n.toLowerCase()))
  excluded.add(original.name.toLowerCase())

  let excludedCategories: string[] = []
  if (opts.bodyPart?.includes('knee')) excludedCategories = KNEE_EXCLUDED_CATEGORIES
  else if (opts.bodyPart?.includes('shoulder')) excludedCategories = SHOULDER_EXCLUDED_CATEGORIES

  const candidates = EXERCISE_LIBRARY.filter((e) => {
    if (excluded.has(e.name.toLowerCase())) return false
    if (e.category !== original.category) return false
    if (excludedCategories.includes(e.category)) return false
    if (opts.bodyweightOnly && !e.equipment.includes('bodyweight')) return false
    if (!opts.bodyweightOnly && !e.equipment.includes(opts.equipment)) return false
    if (!e.archetypes.includes(opts.archetype)) return false
    if (!e.phases.includes(opts.phase)) return false
    return true
  })

  if (candidates.length > 0) return candidates[0]

  // Fallback: mobility alternative.
  const mobilityCandidates = EXERCISE_LIBRARY.filter(
    (e) => e.category === 'mobility' && e.phases.includes(opts.phase) && !excluded.has(e.name.toLowerCase()),
  )

  return mobilityCandidates[0] ?? EXERCISE_LIBRARY.find((e) => e.category === 'mobility')!
}

// ── Workout mutation helpers ─────────────────────────────────────

const SECTION_KEYS = ['warm_up', 'main_lifts', 'accessories', 'cooldown'] as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySwapsToWorkout(workout: any, swaps: SwapPair[]): Record<string, unknown> {
  const swapMap = new Map(swaps.map((s) => [s.original.toLowerCase(), s.replacement]))
  const updates: Record<string, unknown> = {}

  for (const section of SECTION_KEYS) {
    const blocks = workout[section]
    if (!Array.isArray(blocks)) continue

    let changed = false
    const nextBlocks = blocks.map((block: Record<string, unknown>) => {
      const replacementName = swapMap.get(String(block.name).toLowerCase())
      if (!replacementName) return block

      const lib = findLibraryExercise(replacementName)
      if (!lib) return block

      changed = true
      return {
        ...block,
        name: lib.name,
        sets: lib.default_sets,
        reps: lib.default_reps,
        rest_seconds: lib.default_rest_seconds,
        rpe_target: lib.default_rpe,
        coaching_cues: lib.coaching_cues,
        home_alternative: lib.home_alternative ?? undefined,
      }
    })

    if (changed) updates[section] = nextBlocks
  }

  const conditioning = workout.conditioning
  if (conditioning && typeof conditioning === 'object') {
    const replacementName = swapMap.get(String(conditioning.name).toLowerCase())
    if (replacementName) {
      const lib = findLibraryExercise(replacementName)
      if (lib) {
        updates.conditioning = {
          ...conditioning,
          name: lib.name,
          sets: lib.default_sets,
          reps: lib.default_reps,
          rest_seconds: lib.default_rest_seconds,
          rpe_target: lib.default_rpe,
          coaching_cues: lib.coaching_cues,
          home_alternative: lib.home_alternative ?? undefined,
        }
      }
    }
  }

  return updates
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectExerciseNames(workout: any): string[] {
  const names: string[] = []
  for (const section of SECTION_KEYS) {
    const blocks = workout[section]
    if (Array.isArray(blocks)) {
      for (const block of blocks) names.push(String(block.name))
    }
  }
  if (workout.conditioning) names.push(String(workout.conditioning.name))
  return names
}

// ── System prompt ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSystemPrompt(profile: any, plan: any, workout: any, recentSessions: string, memoryText: string): string {
  const secondaryGoals = (profile.secondary_goals ?? []).join(', ') || 'None'
  const phase = workout?.phase ?? 'unknown'
  const weekNumber = workout?.week_number ?? '?'

  let eventContext = ''
  if (profile.event_type) {
    const eventDate = profile.event_date as string | null
    const goalTimeMinutes = profile.goal_time_minutes as number | null

    let weeksAway = ''
    if (eventDate) {
      const msPerWeek = 7 * 24 * 60 * 60 * 1000
      const weeks = Math.max(0, Math.ceil((new Date(eventDate).getTime() - Date.now()) / msPerWeek))
      weeksAway = `, on ${eventDate} (${weeks} weeks away)`
    }

    eventContext = `\n- Event: ${profile.event_type}${weeksAway}.`

    if (goalTimeMinutes) {
      const h = Math.floor(goalTimeMinutes / 60)
      const m = goalTimeMinutes % 60
      const formatted = `${h}:${m.toString().padStart(2, '0')}`
      if (profile.event_type === 'triathlon') {
        eventContext += `\n- Goal time: ${formatted}. User has not specified a split across disciplines — if asked, help them think through a realistic split based on their training history rather than assuming an even split.`
      } else if (profile.event_type === 'cycling') {
        eventContext += `\n- Goal ride time: ${formatted}.`
      } else {
        eventContext += `\n- Goal time: ${formatted}.`
      }
    }
  }

  const todayWorkoutContext = workout ? JSON.stringify(workout) : 'No workout scheduled today'

  return `You are Kwazi, an elite strength and conditioning coach inside the GRYT training app.
You are intense, direct, professional, and deeply encouraging.
You refer to yourself as Kwazi. Never break character.
You know the user's name, goals, injuries, training history, and current plan.

User profile:
- Name: ${profile.first_name ?? 'Athlete'}
- Goal: ${profile.primary_goal ?? 'Not set'}
- Experience: ${profile.experience_level ?? 'Not set'}
- Current phase: ${phase}, Week ${weekNumber}
- Equipment: ${profile.equipment ?? 'Not set'}
- Nutrition targets: ${plan?.daily_calories ?? '?'}kcal, ${plan?.daily_protein_g ?? '?'}g protein, ${plan?.daily_carbs_g ?? '?'}g carbs, ${plan?.daily_fat_g ?? '?'}g fat
- Injuries: ${profile.injury_history || 'None reported'}
- Secondary goals: ${secondaryGoals}${eventContext}

PROGRAMME ARCHITECTURE (how the user's plan is built — use this to give intelligent answers):
- Plans are ${plan?.total_weeks ?? 10} weeks, structured in Foundation → Build → Peak → Deload phases. The user is currently in ${phase}, Week ${weekNumber}.
- Sessions follow slot-based blueprints: Upper Body sessions always contain 1 push_horizontal + 1 pull_horizontal + 1 push_vertical + 1 pull_vertical. Lower Body sessions contain 1 squat + 2 hinge variations. Full Body sessions contain squat + hinge + push + pull.
- Every session has a dedicated Core Stability section (2 exercises) separate from Main Lifts and Accessories.
- Secondary goals inject additional work into sessions: conditioning goals add to the conditioning field, core goals add to core_stability, strength/hypertrophy goals add sets and accessories. If the user's secondary goals aren't visible in their workout, it may be because their archetype doesn't have matching exercises tagged — they can contact support or you can suggest they try a different secondary goal.
- Experience level gates exercises: beginners don't see deadlifts, pull-ups, box jumps, or barbell squats. Intermediate and advanced users unlock progressively harder movements.
- Readiness scores (from daily check-ins) adapt sessions automatically: 60-79 = reduced volume, 40-59 = recovery session suggested, below 40 = rest recommended.
- HYROX users get station-specific sessions (ski erg, sled push/pull, wall balls, farmers carry, sandbag lunges, burpee broad jumps, rowing) plus a weekly HYROX Simulation day mirroring the actual race format.
- Endurance athletes (marathon, half marathon, triathlon, cycling) get event-specific conditioning with pace zones calculated from their goal time.

WHAT KWAZI CAN DO FOR THE USER:
- Adapt today's session temporarily based on how they feel (fatigue, soreness, pain) — use the WORKOUT_ADAPTATION mechanism above
- Permanently swap exercises due to injury or equipment constraints — the app's swap flow handles this
- Explain why their programme looks the way it does based on their goals, experience, and phase
- Coach them through exercises with form cues from their plan
- Answer nutrition questions based on their daily targets
- Help them think through goal-setting, event preparation, and recovery
- Escalate to info@gryt.co.za for anything requiring a human coach

WHAT KWAZI CANNOT DO:
- Change the user's primary goal or regenerate their plan (direct them to Settings → Regenerate Plan)
- Add or remove secondary goals (direct them to Settings → Regenerate Plan)
- Change their experience level, equipment, or training days (direct them to Settings → Regenerate Plan)
- Access data outside the GRYT app

TODAY_WORKOUT: ${todayWorkoutContext}

Recent training (last 3 sessions):
${recentSessions || 'No sessions logged yet.'}

Memory from previous conversations:
${memoryText || 'None.'}

Rules:
- Only discuss fitness, training, recovery, nutrition for performance, and the user's GRYT data.
- For anything outside this scope, direct to info@gryt.co.za.
- For any injury discussion, always append: "For any pain or injury, always consult a qualified healthcare practitioner before continuing training."
- For medical/structural questions or "talk to a human": halt and show escalation UI.
- Every message must receive a response. Never go silent.
- When offering options or confirmations, use tappable chips.

WORKOUT ADAPTATION AWARENESS:
You have access to the user's planned workout for today in TODAY_WORKOUT above. This is for
a TEMPORARY, today-only adjustment to how the session feels — distinct from a permanent
exercise swap (which the app already handles separately through its own flow; if the user is
clearly asking to permanently replace a named exercise going forward, don't use this mechanism,
just respond conversationally and let the app's swap flow take it from there on their next
message).
When the user expresses any of the following, offer to adapt today's session specifically:
- Fatigue signals: "exhausted", "tired", "no energy", "drained", "burned out", "couldn't sleep"
- Pain signals: "hurts", "pain", "aching", "injury", "strain", "pulled", "tweaked"
- Soreness signals: "sore", "DOMS", "stiff", "can barely move", "legs are dead"
- General feeling: "not feeling it", "off today", "not 100%"

When you detect these signals:
1. Acknowledge how they're feeling with empathy — don't jump straight to exercise prescription.
2. Ask a clarifying question if needed ("Is it your lower back specifically, or more general fatigue?").
3. Once you understand the issue, suggest specific changes to TODAY_WORKOUT:
   - Fatigue with no specific pain: reduce sets by 1 across main lifts, lower RPE targets by 1.
   - Pain/injury in a specific area: identify which exercises in TODAY_WORKOUT target that area
     and suggest removing them.
   - Severe fatigue or injury: suggest replacing the session entirely with a recovery protocol.
4. End your suggestion with: "Want me to apply these changes to today's session?"
5. If the user says yes (any affirmative), include a <WORKOUT_ADAPTATION> block as literal text
   inside your "reply" string (properly escaped as JSON string content — keep it on as few lines
   as needed, e.g. using \\n for line breaks within the string), in exactly this shape:
<WORKOUT_ADAPTATION>
{"reason": "Brief explanation shown to user", "changes": [{"exercise_name": "exact name from TODAY_WORKOUT", "action": "remove" | "reduce_sets" | "reduce_rpe", "new_sets": 2, "new_rpe": 6}], "add_recovery_exercises": false}
</WORKOUT_ADAPTATION>
   "new_sets" only applies to "reduce_sets", "new_rpe" only applies to "reduce_rpe". Set
   "add_recovery_exercises" to true only if you're suggesting a full recovery-protocol swap
   instead of editing individual exercises — in that case "changes" can be an empty array.
   The app strips this block before showing your message to the user and renders its own
   confirmation card from the JSON, so don't also describe the JSON in your conversational text.
If the user declines changes, respect that and don't bring it up again in the same conversation.

Respond with ONLY a single JSON object (no markdown fences, no commentary) of the exact shape:
{"reply": string, "chips": string[] | null}`
}

// ── Anthropic call ───────────────────────────────────────────────

async function callClaude(systemPrompt: string, messages: ChatMessage[], apiKey: string): Promise<{ reply: string; chips: string[] | null }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Anthropic API error: ${response.status} ${text}`)
  }

  const data = await response.json()
  const text = (data.content ?? []).map((block: { type: string; text?: string }) => block.text ?? '').join('')

  try {
    const parsed = JSON.parse(text)
    return { reply: String(parsed.reply ?? text), chips: Array.isArray(parsed.chips) ? parsed.chips : null }
  } catch {
    // Outer JSON.parse failed (e.g. malformed escaping somewhere in the
    // model's output) — before giving up and returning the entire raw text
    // (which often still looks like a JSON envelope and would otherwise
    // render verbatim in the chat UI), try to pull the reply string out with
    // a regex so the conversational text survives even when the envelope
    // around it doesn't parse cleanly.
    const replyMatch = text.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/s)
    const reply = replyMatch
      ? replyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
      : text
    return { reply, chips: null }
  }
}

// ── Main handler ─────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const body = (await req.json()) as RequestBody
    const { userId, messages, currentWorkoutId } = body
    const pendingSwap = body.pendingSwap ?? null

    if (!userId || !Array.isArray(messages) || messages.length === 0) {
      return jsonResponse({ reply: null, blocked: false, remaining: DAILY_LIMIT, reason: 'Invalid request' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const lastMessage = messages[messages.length - 1]

    // ── Rate limiting ──
    const today = todayISO()
    const { data: usageRow } = await supabase
      .from('kwazi_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    const currentCount = usageRow?.count ?? 0
    if (currentCount >= DAILY_LIMIT) {
      return jsonResponse({
        reply: null,
        blocked: true,
        remaining: 0,
        reason: "You've used all 10 Kwazi messages for today. Your limit resets at midnight.",
      })
    }

    // ── Profile, plan, workout, history, memory ──
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()

    const { data: plan } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let workout = null as Record<string, unknown> | null
    if (currentWorkoutId) {
      const { data } = await supabase.from('workouts').select('*').eq('id', currentWorkoutId).maybeSingle()
      workout = data
    }
    if (!workout && plan) {
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('plan_id', plan.id)
        .order('week_number', { ascending: true })
        .order('day_number', { ascending: true })
        .limit(1)
        .maybeSingle()
      workout = data
    }

    const { data: recentLogs } = await supabase
      .from('progress_logs')
      .select('exercise_name, weight_kg, reps, rpe, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(30)

    const sessionGroups = new Map<string, string[]>()
    for (const row of recentLogs ?? []) {
      const day = String(row.completed_at).slice(0, 10)
      const list = sessionGroups.get(day) ?? []
      list.push(`${row.exercise_name} ${row.weight_kg}kg x${row.reps} @RPE${row.rpe}`)
      sessionGroups.set(day, list)
    }
    const recentSessions = Array.from(sessionGroups.entries())
      .slice(0, 3)
      .map(([day, lines]) => `- ${day}: ${lines.join(', ')}`)
      .join('\n')

    const { data: memoryRows } = await supabase.from('kwazi_memory').select('key, value').eq('user_id', userId)
    const memoryText = (memoryRows ?? [])
      .map((row) => `- ${row.key}: ${JSON.stringify(row.value)}`)
      .join('\n')
    const avoidedExercises = (memoryRows ?? [])
      .filter((row) => row.key.startsWith('avoided_exercise_'))
      .map((row) => String((row.value as { replacement?: string })?.replacement ?? row.key.replace('avoided_exercise_', '')))

    // ── Escalation ──
    if (containsEscalationKeyword(lastMessage.content) && !pendingSwap) {
      const remaining = DAILY_LIMIT - currentCount
      await supabase.from('kwazi_usage').upsert({ user_id: userId, date: today, count: currentCount + 1 }, { onConflict: 'user_id,date' })
      return jsonResponse({
        reply: 'This needs a human touch — please reach out to info@gryt.co.za and the team will help directly.',
        blocked: false,
        remaining: remaining - 1,
        escalate: true,
      })
    }

    // ── Swap flow: diagnostic stage response ──
    if (pendingSwap && pendingSwap.stage === 'diagnostic') {
      const choice = lastMessage.content.trim()
      const scopeMap: Record<string, Scope> = {
        'Just today': 'single_session',
        'Rest of this week': 'this_week',
        'A few days': 'this_week',
        'Permanent change': 'permanent',
      }
      const scope = scopeMap[choice] ?? 'single_session'

      const archetype = (plan?.archetype as string) ?? 'General Health'
      const phase = (workout?.phase as string) ?? 'foundation'
      const equipment = (profile?.equipment as string) ?? 'full_gym'

      const swaps: SwapPair[] = []
      for (const target of pendingSwap.targets) {
        const lib = findLibraryExercise(target)
        if (!lib) continue
        const replacement = findReplacement(lib, {
          equipment,
          archetype,
          phase,
          excludeNames: [...avoidedExercises, ...swaps.map((s) => s.replacement)],
          bodyPart: pendingSwap.bodyPart,
          bodyweightOnly: pendingSwap.kind === 'equipment',
        })
        swaps.push({ original: lib.name, replacement: replacement.name })
      }

      if (swaps.length === 0) {
        return jsonResponse({
          reply: "I couldn't find that exercise in your current session — want to tell me which one you mean?",
          blocked: false,
          remaining: DAILY_LIMIT - currentCount,
          pendingSwap: null,
        })
      }

      const updatedPending: PendingSwap = { ...pendingSwap, stage: 'confirm', scope, swaps }
      const summary = swaps.map((s) => `${s.original} → ${s.replacement}`).join(', ')
      const scopeLabel = scope === 'single_session' ? "today's session" : scope === 'this_week' ? 'the rest of this week' : 'permanently'

      await supabase.from('kwazi_usage').upsert({ user_id: userId, date: today, count: currentCount + 1 }, { onConflict: 'user_id,date' })

      return jsonResponse({
        reply: `Got it. ${summary}. Scope: ${scopeLabel}. Confirm this swap?`,
        chips: ['Confirm & Apply', 'Suggest another', 'Keep original'],
        blocked: false,
        remaining: DAILY_LIMIT - (currentCount + 1),
        pendingSwap: updatedPending,
      })
    }

    // ── Swap flow: confirm stage response ──
    if (pendingSwap && pendingSwap.stage === 'confirm') {
      const choice = lastMessage.content.trim()

      if (choice === 'Keep original') {
        await supabase.from('kwazi_usage').upsert({ user_id: userId, date: today, count: currentCount + 1 }, { onConflict: 'user_id,date' })
        return jsonResponse({
          reply: 'No problem — keeping your session as planned. Let me know if anything changes.',
          blocked: false,
          remaining: DAILY_LIMIT - (currentCount + 1),
          pendingSwap: null,
        })
      }

      if (choice === 'Suggest another') {
        const archetype = (plan?.archetype as string) ?? 'General Health'
        const phase = (workout?.phase as string) ?? 'foundation'
        const equipment = (profile?.equipment as string) ?? 'full_gym'

        const newSwaps: SwapPair[] = []
        for (const swap of pendingSwap.swaps) {
          const lib = findLibraryExercise(swap.original)
          if (!lib) {
            newSwaps.push(swap)
            continue
          }
          const replacement = findReplacement(lib, {
            equipment,
            archetype,
            phase,
            excludeNames: [...avoidedExercises, swap.replacement, ...newSwaps.map((s) => s.replacement)],
            bodyPart: pendingSwap.bodyPart,
            bodyweightOnly: pendingSwap.kind === 'equipment',
          })
          newSwaps.push({ original: swap.original, replacement: replacement.name })
        }

        const updatedPending: PendingSwap = { ...pendingSwap, swaps: newSwaps }
        const summary = newSwaps.map((s) => `${s.original} → ${s.replacement}`).join(', ')
        const scopeLabel = pendingSwap.scope === 'single_session' ? "today's session" : pendingSwap.scope === 'this_week' ? 'the rest of this week' : 'permanently'

        await supabase.from('kwazi_usage').upsert({ user_id: userId, date: today, count: currentCount + 1 }, { onConflict: 'user_id,date' })

        return jsonResponse({
          reply: `How about this instead. ${summary}. Scope: ${scopeLabel}. Confirm this swap?`,
          chips: ['Confirm & Apply', 'Suggest another', 'Keep original'],
          blocked: false,
          remaining: DAILY_LIMIT - (currentCount + 1),
          pendingSwap: updatedPending,
        })
      }

      if (choice === 'Confirm & Apply') {
        const scope = pendingSwap.scope ?? 'single_session'

        if (!workout) {
          return jsonResponse({
            reply: "I couldn't find your workout to update — try again from the Workouts tab.",
            blocked: false,
            remaining: DAILY_LIMIT - currentCount,
            pendingSwap: null,
          })
        }

        let targetWorkouts: Record<string, unknown>[] = [workout]
        if (scope !== 'single_session' && plan) {
          if (scope === 'this_week') {
            const { data } = await supabase
              .from('workouts')
              .select('*')
              .eq('plan_id', plan.id)
              .eq('week_number', workout.week_number)
            targetWorkouts = data ?? [workout]
          } else if (scope === 'permanent') {
            const { data } = await supabase
              .from('workouts')
              .select('*')
              .eq('plan_id', plan.id)
              .gte('week_number', workout.week_number as number)
            targetWorkouts = data ?? [workout]
          }
        }

        for (const w of targetWorkouts) {
          const updates = applySwapsToWorkout(w, pendingSwap.swaps)
          if (Object.keys(updates).length > 0) {
            await supabase.from('workouts').update(updates).eq('id', w.id)
          }
        }

        if (scope === 'permanent') {
          for (const swap of pendingSwap.swaps) {
            await supabase.from('kwazi_memory').upsert(
              {
                user_id: userId,
                key: `avoided_exercise_${swap.original.toLowerCase().replace(/\s+/g, '_')}`,
                value: { reason: pendingSwap.kind, date: today, replacement: swap.replacement },
              },
              { onConflict: 'user_id,key' },
            )
          }
        }

        if (pendingSwap.kind === 'injury' && pendingSwap.bodyPart) {
          await supabase.from('kwazi_memory').upsert(
            {
              user_id: userId,
              key: 'injury_note',
              value: { body_part: pendingSwap.bodyPart, date: today, severity: scope },
            },
            { onConflict: 'user_id,key' },
          )
        }

        await supabase.from('kwazi_usage').upsert({ user_id: userId, date: today, count: currentCount + 1 }, { onConflict: 'user_id,date' })

        const summary = pendingSwap.swaps.map((s) => `${s.original} → ${s.replacement}`).join(', ')
        let reply = `Done. ${summary} is locked in. Your plan and dashboard are updated.`
        if (pendingSwap.kind === 'injury') {
          reply += ' For any pain or injury, always consult a qualified healthcare practitioner before continuing training.'
        }

        return jsonResponse({
          reply,
          blocked: false,
          remaining: DAILY_LIMIT - (currentCount + 1),
          pendingSwap: null,
          swapApplied: { swaps: pendingSwap.swaps, scope },
        })
      }

      // Unrecognised input while a swap is pending — fall through to general chat but keep pendingSwap.
    }

    // ── Fresh swap detection ──
    if (!pendingSwap && workout) {
      const intent = detectSwapIntent(lastMessage.content)
      if (intent) {
        const exerciseNames = collectExerciseNames(workout)

        if (intent.kind === 'equipment' && intent.exercisePhrase === null) {
          const targets = exerciseNames.filter((name) => {
            const lib = findLibraryExercise(name)
            return lib && !lib.equipment.includes('bodyweight')
          })

          if (targets.length > 0) {
            const newPending: PendingSwap = { stage: 'diagnostic', kind: 'equipment', workoutId: String(workout.id), targets, swaps: [] }
            await supabase.from('kwazi_usage').upsert({ user_id: userId, date: today, count: currentCount + 1 }, { onConflict: 'user_id,date' })
            return jsonResponse({
              reply: "Got it — let's make this session work without a gym. How long will you be without equipment?",
              chips: ['Just today', 'A few days', 'Permanent change'],
              blocked: false,
              remaining: DAILY_LIMIT - (currentCount + 1),
              pendingSwap: newPending,
            })
          }
        } else if (intent.exercisePhrase) {
          const matched = matchWorkoutExercise(intent.exercisePhrase, exerciseNames)
          if (matched) {
            const newPending: PendingSwap = {
              stage: 'diagnostic',
              kind: intent.kind,
              bodyPart: intent.bodyPart,
              workoutId: String(workout.id),
              targets: [matched],
              swaps: [],
            }

            await supabase.from('kwazi_usage').upsert({ user_id: userId, date: today, count: currentCount + 1 }, { onConflict: 'user_id,date' })

            if (intent.kind === 'injury') {
              return jsonResponse({
                reply: `Noted on ${matched}. Is this affecting today's session or should we work around it longer term?`,
                chips: ['Just today', 'Rest of this week', 'Permanent change'],
                blocked: false,
                remaining: DAILY_LIMIT - (currentCount + 1),
                pendingSwap: newPending,
              })
            }

            return jsonResponse({
              reply: `Got it — ${matched} needs a substitute. How long will you be without this equipment?`,
              chips: ['Just today', 'A few days', 'Permanent change'],
              blocked: false,
              remaining: DAILY_LIMIT - (currentCount + 1),
              pendingSwap: newPending,
            })
          }
        }
      }
    }

    // ── General chat via Claude ──
    const systemPrompt = buildSystemPrompt(profile ?? {}, plan, workout, recentSessions, memoryText)
    const { reply, chips } = await callClaude(systemPrompt, messages, anthropicKey)

    await supabase.from('kwazi_usage').upsert({ user_id: userId, date: today, count: currentCount + 1 }, { onConflict: 'user_id,date' })

    return jsonResponse({
      reply,
      chips,
      blocked: false,
      remaining: DAILY_LIMIT - (currentCount + 1),
      pendingSwap: pendingSwap ?? null,
    })
  } catch (error) {
    console.error('chat-kwazi error:', error)
    return jsonResponse(
      {
        reply: "Kwazi's having trouble connecting right now — give it a moment and try again.",
        blocked: false,
        remaining: DAILY_LIMIT,
      },
      500,
    )
  }
})
