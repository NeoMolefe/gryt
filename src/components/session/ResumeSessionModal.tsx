import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/Button'

interface ResumeSessionModalProps {
  isOpen: boolean
  sessionName: string
  onResume: () => void
  onStartNew: () => void
  onCancel: () => void
}

export function ResumeSessionModal({ isOpen, sessionName, onResume, onStartNew, onCancel }: ResumeSessionModalProps) {
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
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card p-6"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <h2 className="mb-2 text-lg font-semibold text-text-primary">Unfinished session</h2>
            <p className="mb-6 text-sm text-text-secondary">
              You have an in-progress session for {sessionName}. What would you like to do?
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={onResume}>Resume {sessionName}</Button>
              <Button variant="outline" onClick={onStartNew}>
                Start New Session
              </Button>
              <Button variant="text" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
