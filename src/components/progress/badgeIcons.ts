import { Flag, Flame, HeartPulse, Layers, ShieldCheck, Trophy } from 'lucide-react'
import type { BadgeId } from '@/types/progress.types'

export const BADGE_ICONS: Record<BadgeId, typeof Flag> = {
  phase_complete: Flag,
  streak_7: Flame,
  first_pb: Trophy,
  recovery_warrior: HeartPulse,
  deload_discipline: ShieldCheck,
  hybrid_ready: Layers,
}
