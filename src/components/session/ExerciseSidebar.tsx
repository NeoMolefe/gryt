import { AnimatePresence, motion } from 'framer-motion'
import type { ActiveSessionState, FlatExercise } from '@/types/session.types'

interface ExerciseSidebarProps {
  isOpen: boolean
  onClose: () => void
  exercises: FlatExercise[]
  state: ActiveSessionState
}

function isExerciseDone(exerciseIndex: number, state: ActiveSessionState): boolean {
  return exerciseIndex < state.currentExerciseIndex
}

export function ExerciseSidebar({ isOpen, onClose, exercises, state }: ExerciseSidebarProps) {
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
            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-card p-4"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <h2 className="mb-4 text-sm font-semibold text-text-primary">Exercises</h2>
            <ul className="flex-1 space-y-2 overflow-y-auto">
              {exercises.map((fe, index) => {
                const done = isExerciseDone(index, state)
                const active = index === state.currentExerciseIndex
                return (
                  <li
                    key={`${fe.section}-${fe.block.name}-${index}`}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                      active ? 'border-brand-orange bg-brand-orange/10' : 'border-border bg-elevated'
                    }`}
                  >
                    <span className={done ? 'text-text-secondary line-through' : 'text-text-primary'}>{fe.block.name}</span>
                    {done && <span className="text-phase-deload">✓</span>}
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
