import { supabase } from '@/lib/supabase'

export interface SubscriberMetrics {
  total: number
  paying: number
  trial: number
  expired: number
  complimentary: number
  newThisWeek: number
  newToday: number
  foundingMembers: number
}

export interface ActivityEvent {
  type: 'checkin' | 'workout' | 'kwazi' | 'regenerate'
  userId: string
  timestamp: string
  detail?: string
}

export interface KwaziMetrics {
  totalMessagesToday: number
  totalMessagesThisWeek: number
  uniqueUsersToday: number
  uniqueUsersThisWeek: number
}

export interface DailyCount {
  date: string
  count: number
}

// ── Subscriber metrics ──────────────────────────────────────────
export async function fetchSubscriberMetrics(): Promise<SubscriberMetrics> {
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_status, is_complimentary, created_at')

  if (error || !data) throw error

  const { count: foundingCount } = await supabase
    .from('founding_members')
    .select('*', { count: 'exact', head: true })

  return {
    total: data.length,
    paying: data.filter((p) => p.subscription_status === 'active' && !p.is_complimentary).length,
    trial: data.filter((p) => p.subscription_status === 'trial').length,
    expired: data.filter((p) => p.subscription_status === 'expired').length,
    complimentary: data.filter((p) => p.is_complimentary).length,
    newThisWeek: data.filter((p) => p.created_at > weekAgo).length,
    newToday: data.filter((p) => p.created_at.startsWith(today)).length,
    foundingMembers: foundingCount ?? 0,
  }
}

// ── Kwazi metrics ────────────────────────────────────────────────
export async function fetchKwaziMetrics(): Promise<KwaziMetrics> {
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Real columns are usage_date/message_count, not date/count — the latter
  // don't exist on this table (confirmed via information_schema). The edge
  // function's writes silently fail using those names, which is a separate,
  // bigger bug (Kwazi's daily rate limit isn't actually enforced) — not
  // fixed here, just not repeating the same wrong names in this new code.
  const { data: todayData } = await supabase
    .from('kwazi_usage')
    .select('user_id, message_count')
    .eq('usage_date', today)

  const { data: weekData } = await supabase
    .from('kwazi_usage')
    .select('user_id, message_count, usage_date')
    .gte('usage_date', weekAgo.slice(0, 10))

  const totalToday = (todayData ?? []).reduce((sum, r) => sum + (r.message_count ?? 0), 0)
  const totalWeek = (weekData ?? []).reduce((sum, r) => sum + (r.message_count ?? 0), 0)

  return {
    totalMessagesToday: totalToday,
    totalMessagesThisWeek: totalWeek,
    uniqueUsersToday: new Set((todayData ?? []).map((r) => r.user_id)).size,
    uniqueUsersThisWeek: new Set((weekData ?? []).map((r) => r.user_id)).size,
  }
}

// ── Recent activity feed ──────────────────────────────────────────
export async function fetchRecentActivity(limit = 20): Promise<ActivityEvent[]> {
  const events: ActivityEvent[] = []

  // Check-ins
  const { data: checkins } = await supabase
    .from('readiness_checkins')
    .select('user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  for (const c of checkins ?? []) {
    events.push({ type: 'checkin', userId: c.user_id, timestamp: c.created_at })
  }

  // Workout completions
  const { data: workouts } = await supabase
    .from('session_logs')
    .select('user_id, started_at, status')
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(limit)

  for (const w of workouts ?? []) {
    events.push({ type: 'workout', userId: w.user_id, timestamp: w.started_at })
  }

  // Kwazi messages (today)
  const today = new Date().toISOString().slice(0, 10)
  const { data: kwazi } = await supabase
    .from('kwazi_usage')
    .select('user_id, usage_date, message_count')
    .eq('usage_date', today)
    .order('usage_date', { ascending: false })
    .limit(limit)

  for (const k of kwazi ?? []) {
    events.push({
      type: 'kwazi',
      userId: k.user_id,
      timestamp: `${k.usage_date}T00:00:00Z`,
      detail: `${k.message_count} messages`,
    })
  }

  // Plan regenerations
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: regens } = await supabase
    .from('regenerate_usage')
    .select('user_id, month, count')
    .eq('month', currentMonth)
    .order('count', { ascending: false })
    .limit(limit)

  for (const r of regens ?? []) {
    events.push({
      type: 'regenerate',
      userId: r.user_id,
      timestamp: `${r.month}-01T00:00:00Z`,
      detail: `${r.count} regenerations this month`,
    })
  }

  // Sort all events by timestamp, most recent first
  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

// ── Daily signups for chart (last 14 days) ────────────────────────
export async function fetchDailySignups(): Promise<DailyCount[]> {
  const { data } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  const counts: Record<string, number> = {}
  for (const p of data ?? []) {
    const date = p.created_at.slice(0, 10)
    counts[date] = (counts[date] ?? 0) + 1
  }

  return Object.entries(counts).map(([date, count]) => ({ date, count }))
}
