import { AnimatePresence, motion } from 'framer-motion'
import { BADGE_ICONS } from '@/components/progress/badgeIcons'
import type { BadgeStatus } from '@/types/progress.types'

interface BadgeDetailSheetProps {
  badge: BadgeStatus | null
  onClose: () => void
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

export function BadgeDetailSheet({ badge, onClose }: BadgeDetailSheetProps) {
  const Icon = badge ? BADGE_ICONS[badge.id] : null

  return (
    <AnimatePresence>
      {badge && Icon && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card p-6 pb-10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${badge.earned ? 'bg-brand-orange text-white' : 'bg-elevated text-text-muted'}`}>
                <Icon size={28} />
              </div>
              <h2 className="mt-3 text-lg font-semibold text-text-primary">{badge.name}</h2>
              <p className="mt-1 text-sm text-text-secondary">{badge.description}</p>

              {badge.earned ? (
                <p className="mt-4 text-sm font-semibold text-brand-orange">
                  Earned {badge.earnedDate ? formatDate(badge.earnedDate) : ''}
                </p>
              ) : (
                <div className="mt-4 w-full">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full bg-brand-orange"
                      style={{ width: `${Math.min(100, (badge.progressCurrent / badge.progressTarget) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">
                    {badge.progressCurrent}/{badge.progressTarget}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
