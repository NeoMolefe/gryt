import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const STATUS_MESSAGES = [
  'Analysing your profile…',
  'Building your training blocks…',
  'Calibrating progression…',
  'Finalising plan…',
]

const MESSAGE_INTERVAL_MS = 1800

interface LoadingOverlayProps {
  onCancel: () => void
}

export function LoadingOverlay({ onCancel }: LoadingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((index) =>
        index < STATUS_MESSAGES.length - 1 ? index + 1 : index,
      )
    }, MESSAGE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [])

  const percent = ((messageIndex + 1) / STATUS_MESSAGES.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background px-6">
      <div className="flex w-full max-w-xs flex-col items-center gap-6 text-center">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-semibold text-text-primary"
        >
          {STATUS_MESSAGES[messageIndex]}
        </motion.p>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
          <motion.div
            className="h-full rounded-full bg-brand-orange"
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-text-secondary hover:text-text-primary"
      >
        Cancel
      </button>
    </div>
  )
}
