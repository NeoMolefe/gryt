import { ChipRow } from '@/components/kwazi/ChipRow'
import type { ChatMessage } from '@/types/kwazi.types'

interface ChatBubbleProps {
  message: ChatMessage
  onChipSelect?: (value: string) => void
  chipsDisabled?: boolean
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function ChatBubble({ message, onChipSelect, chipsDisabled }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? 'bg-brand-orange text-white' : 'bg-card border border-border text-text-primary'
        }`}
      >
        {message.content}
      </div>
      <span className="mt-1 px-1 text-xs text-text-muted">{formatTime(message.timestamp)}</span>
      {!isUser && message.chips && message.chips.length > 0 && onChipSelect && (
        <ChipRow chips={message.chips} onSelect={onChipSelect} disabled={chipsDisabled} />
      )}
    </div>
  )
}
