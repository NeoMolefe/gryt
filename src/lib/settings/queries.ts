import { supabase } from '@/lib/supabase'
import type { InjuryFlag } from '@/types/profile'

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
