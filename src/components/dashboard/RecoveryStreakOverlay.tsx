import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Confetti } from '@/components/session/Confetti'

interface RecoveryStreakOverlayProps {
  show: boolean
  onDone: () => void
}

export function RecoveryStreakOverlay({ show, onDone }: RecoveryStreakOverlayProps) {
  useEffect(() => {
    if (!show) return
    const timer = setTimeout(onDone, 2600)
    return () => clearTimeout(timer)
  }, [show, onDone])

  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
          >
            <div className="text-center">
              <p className="text-5xl">🔥</p>
              <p className="mt-2 text-3xl font-extrabold text-white">Recovery Warrior</p>
              <p className="mt-1 text-sm text-white/80">7-day recovery streak!</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
