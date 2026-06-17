import type { Phase } from '@/types/plan.types'

export const PHASE_LABELS: Record<Phase, string> = {
  foundation: 'Foundation',
  build: 'Build',
  peak: 'Peak',
  deload: 'Deload',
}

export const PHASE_BADGE_CLASSES: Record<Phase, string> = {
  foundation: 'bg-phase-foundation/15 text-phase-foundation',
  build: 'bg-phase-build/15 text-phase-build',
  peak: 'bg-phase-peak/15 text-phase-peak',
  deload: 'bg-phase-deload/15 text-phase-deload',
}

export function phaseDotClass(phase: Phase): string {
  switch (phase) {
    case 'foundation':
      return 'bg-phase-foundation'
    case 'build':
      return 'bg-phase-build'
    case 'peak':
      return 'bg-phase-peak'
    case 'deload':
      return 'bg-phase-deload'
  }
}

export function phaseTextClass(phase: Phase): string {
  switch (phase) {
    case 'foundation':
      return 'text-phase-foundation'
    case 'build':
      return 'text-phase-build'
    case 'peak':
      return 'text-phase-peak'
    case 'deload':
      return 'text-phase-deload'
  }
}
