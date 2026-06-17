import { AnimatePresence, motion } from 'framer-motion'

interface XpFloatProps {
  amount: number | null
}

export function XpFloat({ amount }: XpFloatProps) {
  return (
    <AnimatePresence>
      {amount !== null && (
        <motion.div
          key={amount}
          initial={{ opacity: 0, y: 0, scale: 0.9 }}
          animate={{ opacity: 1, y: -36, scale: 1 }}
          exit={{ opacity: 0, y: -56 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="pointer-events-none absolute -top-2 right-3 text-lg font-extrabold text-brand-orange"
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  )
}
