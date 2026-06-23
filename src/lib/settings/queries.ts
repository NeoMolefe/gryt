import { supabase } from '@/lib/supabase'
import type { InjuryFlag } from '@/types/profile'

export const MONTHLY_REGENERATE_LIMIT = 2

/** Current month key in the same 'YYYY-MM' format stored in regenerate_usage.month. */
export function currentRegenerateMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

/** Remaining plan regenerations for the current month, for display only. */
export async function fetchRegenerateRemaining(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('regenerate_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('month', currentRegenerateMonth())
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch regenerate usage:', error.message)
    return MONTHLY_REGENERATE_LIMIT
  }

  return Math.max(0, MONTHLY_REGENERATE_LIMIT - (data?.count ?? 0))
}

/** Deactivates all of the user's active plans without deleting them, ahead of plan regeneration. */
export async function deactivateActivePlans(userId: string): Promise<void> {
  const { error } = await supabase.from('plans').update({ active: false }).eq('user_id', userId).eq('active', true)

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateInjuryProfile(userId: string, injuryHistory: string, injuryFlags: InjuryFlag[]): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      injury_history: injuryHistory.trim() || null,
      injury_flags: injuryFlags.length > 0 ? injuryFlags : null,
    })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }
}
