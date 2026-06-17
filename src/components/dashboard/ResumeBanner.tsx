import { useState } from 'react'
import { Button } from '@/components/Button'
import type { SessionLog } from '@/types/dashboard.types'

interface ResumeBannerProps {
  sessionLog: SessionLog
  onResume: () => void
  onAbandon: () => Promise<unknown>
}

export function ResumeBanner({ sessionLog, onResume, onAbandon }: ResumeBannerProps) {
  const [confirming, setConfirming] = useState(false)
  const [isAbandoning, setIsAbandoning] = useState(false)

  async function handleConfirmAbandon() {
    setIsAbandoning(true)
    try {
      await onAbandon()
    } finally {
      setIsAbandoning(false)
      setConfirming(false)
    }
  }

  return (
    <div className="rounded-2xl border border-brand-orange/40 bg-brand-orange/10 p-4">
      {confirming ? (
        <div>
          <p className="mb-3 text-sm text-text-primary">
            Abandon this session? Your logged sets will be saved.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirming(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirmAbandon} isLoading={isAbandoning} className="flex-1">
              Abandon
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-text-primary">
            You have an unfinished session — {sessionLog.session_name}
          </p>
          <div className="flex items-center gap-2">
            <Button onClick={onResume} className="px-4">
              Resume
            </Button>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setConfirming(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
