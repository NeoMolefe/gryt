import { AnimatePresence, motion } from 'framer-motion'

interface ToastProps {
  message: string | null
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 bottom-24 z-[60] flex justify-center px-6"
        >
          <button
            type="button"
            onClick={onDismiss}
            className="max-w-md rounded-xl border border-border bg-elevated px-4 py-3 text-center text-sm text-text-primary shadow-xl"
          >
            {message}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
