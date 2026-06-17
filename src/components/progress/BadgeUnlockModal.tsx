import { AnimatePresence, motion } from 'framer-motion'
import { BADGE_ICONS } from '@/components/progress/badgeIcons'
import { Button } from '@/components/Button'
import type { BadgeStatus } from '@/types/progress.types'

interface BadgeUnlockModalProps {
  badge: BadgeStatus | null
  onDismiss: () => void
}

export function BadgeUnlockModal({ badge, onDismiss }: BadgeUnlockModalProps) {
  const Icon = badge ? BADGE_ICONS[badge.id] : null

  return (
    <AnimatePresence>
      {badge && Icon && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="fixed inset-x-6 top-1/2 z-50 -translate-y-1/2 rounded-2xl border border-brand-orange/40 bg-card p-6 text-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 220 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Badge Unlocked</p>
            <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange text-white">
              <Icon size={28} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-text-primary">{badge.name}</h2>
            <p className="mt-1 text-sm text-text-secondary">{badge.description}</p>
            <div className="mt-5">
              <Button onClick={onDismiss}>Nice!</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
