import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/Button'

interface RegenerateLimitModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RegenerateLimitModal({ isOpen, onClose }: RegenerateLimitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card p-6 pb-[calc(24px_+_env(safe-area-inset-bottom))]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <h2 className="mb-2 text-lg font-semibold text-text-primary">Monthly limit reached</h2>
            <p className="mb-6 text-sm text-text-secondary">
              You&apos;ve used both plan regenerations for this month. Your limit resets on the 1st of next month.
            </p>
            <Button onClick={onClose}>Got it</Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
