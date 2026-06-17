import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { ChatHistoryEntry } from '@/types/kwazi.types'

interface HistorySheetProps {
  isOpen: boolean
  onClose: () => void
  entries: ChatHistoryEntry[]
  onDelete: (id: string) => void
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

function preview(entry: ChatHistoryEntry): string {
  const first = entry.messages.find((m) => m.role === 'user') ?? entry.messages[0]
  const text = first?.content ?? ''
  return text.length > 60 ? `${text.slice(0, 60)}...` : text
}

function HistoryRow({ entry, onDelete }: { entry: ChatHistoryEntry; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_event, info) => {
          if (info.offset.x < -80) onDelete(entry.id)
        }}
        className="relative flex items-center justify-between bg-card px-4 py-3"
      >
        <button type="button" onClick={() => setExpanded((e) => !e)} className="flex-1 text-left">
          <p className="text-sm font-medium text-text-primary">{formatDate(entry.started_at)}</p>
          <p className="mt-0.5 text-xs text-text-secondary">{preview(entry)}</p>
          <p className="mt-0.5 text-xs text-text-muted">{entry.messages.length} messages</p>
        </button>
        <button type="button" onClick={() => onDelete(entry.id)} aria-label="Delete conversation" className="ml-3 text-text-muted hover:text-phase-peak">
          <Trash2 size={18} />
        </button>
      </motion.div>

      {expanded && (
        <div className="max-h-64 space-y-2 overflow-y-auto border-t border-border bg-background px-4 py-3">
          {entry.messages.map((message) => (
            <div key={message.id} className={`text-xs ${message.role === 'user' ? 'text-right text-text-primary' : 'text-left text-text-secondary'}`}>
              <span className="font-semibold">{message.role === 'user' ? 'You' : 'Kwazi'}: </span>
              {message.content}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function HistorySheet({ isOpen, onClose, entries, onDelete }: HistorySheetProps) {
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
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-6"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Chat history</h2>
            {entries.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-secondary">No chat history yet.</p>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <HistoryRow key={entry.id} entry={entry} onDelete={onDelete} />
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
