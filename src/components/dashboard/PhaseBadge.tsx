import type { Phase } from '@/types/plan.types'
import { PHASE_BADGE_CLASSES, PHASE_LABELS } from '@/lib/dashboard/phaseStyles'

interface PhaseBadgeProps {
  phase: Phase
  className?: string
}

export function PhaseBadge({ phase, className = '' }: PhaseBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${PHASE_BADGE_CLASSES[phase]} ${className}`}>
      {PHASE_LABELS[phase]}
    </span>
  )
}
