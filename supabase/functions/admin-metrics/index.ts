import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Neo's user ID — only this account may call this function.
const ADMIN_USER_ID = 'e99714c7-763c-4179-9b5c-a4e259e19abb'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace('Bearer ', '')

  const authClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  )

  const { data: callerData, error: callerError } = await authClient.auth.getUser(jwt)
  if (callerError || !callerData.user || callerData.user.id !== ADMIN_USER_ID) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const currentMonth = now.toISOString().slice(0, 7)

  // ── Subscriber metrics ──
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, email, subscription_status, plan_type, is_complimentary, trial_ends_at, created_at')

  const { count: foundingCount } = await supabase
    .from('founding_members')
    .select('*', { count: 'exact', head: true })

  const planBreakdown = (profiles ?? []).reduce((acc: Record<string, number>, p) => {
    if (p.plan_type) acc[p.plan_type] = (acc[p.plan_type] ?? 0) + 1
    return acc
  }, {})

  const subscribers = {
    total: (profiles ?? []).length,
    paying: (profiles ?? []).filter((p) => p.subscription_status === 'active' && !p.is_complimentary).length,
    trial: (profiles ?? []).filter((p) => p.subscription_status === 'trial').length,
    expired: (profiles ?? []).filter((p) => p.subscription_status === 'expired').length,
    complimentary: (profiles ?? []).filter((p) => p.is_complimentary).length,
    newToday: (profiles ?? []).filter((p) => p.created_at.startsWith(today)).length,
    newThisWeek: (profiles ?? []).filter((p) => p.created_at > weekStart).length,
    foundingMembers: foundingCount ?? 0,
    planBreakdown,
  }

  // ── Active plans / archetypes ──
  const { data: userPlans } = await supabase
    .from('plans')
    .select('user_id, archetype')
    .eq('active', true)

  const archetypeByUser = Object.fromEntries(
    (userPlans ?? []).map((p) => [p.user_id, p.archetype]),
  )

  const archetypeCounts = Object.values(archetypeByUser).reduce((acc: Record<string, number>, arch) => {
    if (arch) acc[arch as string] = (acc[arch as string] ?? 0) + 1
    return acc
  }, {})

  // ── Kwazi usage (last 7 days) ──
  const { data: kwaziRows } = await supabase
    .from('kwazi_usage')
    .select('user_id, usage_date, message_count')
    .gte('usage_date', weekStart.slice(0, 10))
    .order('usage_date', { ascending: false })

  const kwaziByUser = (kwaziRows ?? []).reduce((acc: Record<string, {
    total: number
    days: Array<{ date: string; count: number }>
  }>, row) => {
    if (!acc[row.user_id]) acc[row.user_id] = { total: 0, days: [] }
    acc[row.user_id].total += row.message_count
    acc[row.user_id].days.push({ date: row.usage_date, count: row.message_count })
    return acc
  }, {})

  const kwazi = {
    totalMessagesThisWeek: (kwaziRows ?? []).reduce((sum, r) => sum + (r.message_count ?? 0), 0),
    activeUsersThisWeek: new Set((kwaziRows ?? []).map((r) => r.user_id)).size,
  }

  // ── Regenerations ──
  const { data: regenHistory } = await supabase
    .from('regenerate_usage')
    .select('user_id, month, count, from_archetype, to_archetype, regenerated_at')
    .order('regenerated_at', { ascending: false })
    .limit(50)

  const { data: regenThisMonth } = await supabase
    .from('regenerate_usage')
    .select('count')
    .eq('month', currentMonth)

  const regenerations = {
    totalThisMonth: (regenThisMonth ?? []).reduce((sum, r) => sum + (r.count ?? 0), 0),
  }

  // ── App activity (workouts, check-ins) ──
  const { data: completedWorkouts } = await supabase
    .from('session_logs')
    .select('user_id, started_at')
    .eq('status', 'completed')
    .gte('started_at', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString())

  const { data: checkins } = await supabase
    .from('readiness_checkins')
    .select('user_id, created_at')
    .gte('created_at', weekStart)

  const activity = {
    workoutsToday: (completedWorkouts ?? []).filter((w) => w.started_at.startsWith(today)).length,
    workoutsThisWeek: (completedWorkouts ?? []).filter((w) => w.started_at > weekStart).length,
    checkInsToday: (checkins ?? []).filter((c) => c.created_at.startsWith(today)).length,
    checkInsThisWeek: (checkins ?? []).length,
  }

  // ── Trends (last 14 days) ──
  const { data: dailySignups } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString())

  const signupsByDay = (dailySignups ?? []).reduce((acc: Record<string, number>, row) => {
    const day = row.created_at.slice(0, 10)
    acc[day] = (acc[day] ?? 0) + 1
    return acc
  }, {})

  const workoutsByDay = (completedWorkouts ?? []).reduce((acc: Record<string, number>, row) => {
    const day = row.started_at.slice(0, 10)
    acc[day] = (acc[day] ?? 0) + 1
    return acc
  }, {})

  // ── Anonymised activity feed (no names/emails) ──
  const activityFeed = [
    ...(completedWorkouts ?? []).map((w) => ({
      type: 'workout_completed',
      timestamp: w.started_at,
      label: 'Workout completed',
    })),
    ...(checkins ?? []).map((c) => ({
      type: 'checkin',
      timestamp: c.created_at,
      label: 'Check-in logged',
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30)

  // ── Per-user detail table ──
  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.first_name ?? 'Unknown',
    email: p.email,
    subscriptionStatus: p.subscription_status,
    planType: p.plan_type,
    isComplimentary: p.is_complimentary,
    trialEndsAt: p.trial_ends_at,
    joinedAt: p.created_at,
    archetype: archetypeByUser[p.id] ?? null,
    kwaziThisWeek: kwaziByUser[p.id]?.total ?? 0,
  }))

  return jsonResponse({
    subscribers,
    activity,
    kwazi,
    regenerations,
    activityFeed,
    users,
    kwaziPerUser: kwaziByUser,
    regenHistory: regenHistory ?? [],
    trends: { signupsByDay, workoutsByDay },
    archetypeCounts,
    generatedAt: now.toISOString(),
  })
})
