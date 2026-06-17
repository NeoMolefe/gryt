import { supabase } from '@/lib/supabase'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badgeDefinitions'
import { createNotificationIfEnabled } from '@/lib/notifications/queries'
import { XP_VALUES } from '@/types/gamification.types'
import type { XpEventType } from '@/types/gamification.types'
import type { BadgeId } from '@/types/progress.types'

export async function recordXpEvents(userId: string, eventTypes: XpEventType[]): Promise<void> {
  if (eventTypes.length === 0) return

  const rows = eventTypes.map((eventType) => ({
    user_id: userId,
    event_type: eventType,
    amount: XP_VALUES[eventType],
  }))

  const { error } = await supabase.from('xp_events').insert(rows)
  if (error) {
    console.error('Failed to record XP events:', error.message)
  }
}

export async function applyXpDelta(userId: string, currentXp: number, delta: number): Promise<number> {
  const newTotal = currentXp + delta

  const { error } = await supabase.from('profiles').update({ xp_total: newTotal }).eq('id', userId)
  if (error) {
    throw new Error(error.message)
  }

  return newTotal
}

export async function hasEarnedBadge(userId: string, badgeId: BadgeId): Promise<boolean> {
  const { data, error } = await supabase
    .from('badges_earned')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .maybeSingle()

  if (error) {
    console.error('Failed to check badge award:', error.message)
    return false
  }

  return !!data
}

/** Inserts a badge award row if the user hasn't earned this badge before. Returns true if newly awarded. */
export async function awardBadge(userId: string, badgeId: BadgeId, trigger: string): Promise<boolean> {
  if (await hasEarnedBadge(userId, badgeId)) return false

  const { error } = await supabase.from('badges_earned').insert({ user_id: userId, badge_id: badgeId, trigger })
  if (error) {
    console.error('Failed to award badge:', error.message)
    return false
  }

  const definition = BADGE_DEFINITIONS[badgeId]
  await createNotificationIfEnabled(userId, 'badge_unlocked', `Badge unlocked: ${definition.name}`, definition.description)

  return true
}

export async function hasAnyPriorPb(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from('progress_logs').select('id').eq('user_id', userId).eq('is_pb', true).limit(1)

  if (error) {
    console.error('Failed to check prior PBs:', error.message)
    return false
  }

  return (data ?? []).length > 0
}
