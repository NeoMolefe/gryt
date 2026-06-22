import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/Button'

interface RestartModalProps {
  isOpen: boolean
  isRestarting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function RestartModal({ isOpen, isRestarting, onConfirm, onCancel }: RestartModalProps) {
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

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
            <h2 className="mb-2 text-lg font-semibold text-text-primary">Restart conversation?</h2>
            <p className="mb-6 text-sm text-text-secondary">
              This will save your current chat to history and start a fresh conversation with Kwazi.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={onConfirm} isLoading={isRestarting}>
                Restart
              </Button>
              <Button variant="text" onClick={onCancel} disabled={isRestarting}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
