import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/Button'

interface RegeneratePlanModalProps {
  isOpen: boolean
  isRegenerating: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function RegeneratePlanModal({ isOpen, isRegenerating, onConfirm, onCancel }: RegeneratePlanModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card p-6 pb-[calc(24px_+_env(safe-area-inset-bottom))]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <h2 className="mb-2 text-lg font-semibold text-text-primary">Regenerate your plan?</h2>
            <p className="mb-6 text-sm text-text-secondary">
              This will re-run your onboarding. Your progress logs will be kept but your active plan will be
              replaced.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={onConfirm} isLoading={isRegenerating}>
                Continue
              </Button>
              <Button variant="text" onClick={onCancel} disabled={isRegenerating}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
