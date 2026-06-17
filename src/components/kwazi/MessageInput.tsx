import { useRef } from 'react'
import { Send } from 'lucide-react'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
}

export function MessageInput({ value, onChange, onSend, disabled = false }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (value.trim() && !disabled) onSend()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder="Message Kwazi..."
        className="flex-1 resize-none rounded-2xl border border-border bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange disabled:opacity-50"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white transition-colors duration-150 hover:bg-brand-orange-hover disabled:opacity-40"
      >
        <Send size={18} />
      </button>
    </div>
  )
}
