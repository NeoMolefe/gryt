import { supabase } from '@/lib/supabase'

export async function fetchFoundingMemberCount(): Promise<number> {
  const { count, error } = await supabase
    .from('founding_members')
    .select('*', { count: 'exact', head: true })

  if (error) {
    // Table may not exist yet during development; treat as 0 rather than throwing
    return 0
  }
  return count ?? 0
}
