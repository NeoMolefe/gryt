import { BADGE_ICONS } from '@/components/progress/badgeIcons'
import type { BadgeStatus } from '@/types/progress.types'

interface BadgeCardProps {
  badge: BadgeStatus
  onSelect: (badge: BadgeStatus) => void
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

export function BadgeCard({ badge, onSelect }: BadgeCardProps) {
  const Icon = BADGE_ICONS[badge.id]

  return (
    <button
      type="button"
      onClick={() => onSelect(badge)}
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors duration-150 ${
        badge.earned ? 'border-brand-orange/40 bg-brand-orange/10' : 'border-border bg-card'
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          badge.earned ? 'bg-brand-orange text-white' : 'bg-elevated text-text-muted'
        }`}
      >
        <Icon size={22} />
      </div>
      <p className={`text-sm font-semibold ${badge.earned ? 'text-text-primary' : 'text-text-secondary'}`}>{badge.name}</p>
      {badge.earned ? (
        <p className="text-xs text-text-secondary">{badge.earnedDate ? formatDate(badge.earnedDate) : 'Earned'}</p>
      ) : (
        <p className="text-xs text-text-muted">
          {badge.progressCurrent}/{badge.progressTarget}
        </p>
      )}
    </button>
  )
}
