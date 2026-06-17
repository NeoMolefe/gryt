import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/Button'
import { BADGE_ICONS } from '@/components/progress/badgeIcons'
import { shareBadge } from '@/lib/gamification/shareBadge'
import type { UnlockedBadge } from '@/types/gamification.types'

interface BadgeUnlockOverlayProps {
  badge: UnlockedBadge | null
  onDismiss: () => void
}

interface BadgeUnlockContentProps {
  badge: UnlockedBadge
  onDismiss: () => void
}

function BadgeUnlockContent({ badge, onDismiss }: BadgeUnlockContentProps) {
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'copied'>('idle')
  const Icon = BADGE_ICONS[badge.id]

  async function handleShare() {
    setShareState('sharing')
    try {
      const result = await shareBadge(badge.name, badge.description)
      setShareState(result === 'copied' ? 'copied' : 'idle')
    } catch {
      setShareState('idle')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Badge Unlocked</p>
        <div className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-orange text-white">
          <Icon size={40} />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-text-primary">{badge.name}</h2>
        <p className="mt-2 text-sm text-text-secondary">{badge.description}</p>
        <p className="mt-4 text-sm text-text-muted">{badge.trigger}</p>
      </motion.div>

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Button onClick={handleShare} isLoading={shareState === 'sharing'}>
          {shareState === 'copied' ? 'Copied to clipboard' : 'Share'}
        </Button>
        <Button variant="outline" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </motion.div>
  )
}

export function BadgeUnlockOverlay({ badge, onDismiss }: BadgeUnlockOverlayProps) {
  return (
    <AnimatePresence>
      {badge && <BadgeUnlockContent key={badge.id} badge={badge} onDismiss={onDismiss} />}
    </AnimatePresence>
  )
}
