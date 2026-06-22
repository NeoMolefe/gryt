import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { History, RotateCcw } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { ChatBubble } from '@/components/kwazi/ChatBubble'
import { EscalationCard } from '@/components/kwazi/EscalationCard'
import { HistorySheet } from '@/components/kwazi/HistorySheet'
import { MessageInput } from '@/components/kwazi/MessageInput'
import { RestartModal } from '@/components/kwazi/RestartModal'
import { Toast } from '@/components/Toast'
import { loadActiveChat, saveActiveChat, clearActiveChat } from '@/lib/kwazi/chatStorage'
import {
  archiveChat,
  deleteChatHistoryEntry,
  fetchChatHistory,
  fetchKwaziRemaining,
  sendKwaziMessage,
  unwrapDoubleEncodedReply,
} from '@/lib/kwazi/queries'
import {
  applyWorkoutAdaptation,
  kwaziOverrideKey,
  parseWorkoutAdaptation,
  stripWorkoutAdaptationBlock,
  type KwaziOverridePayload,
} from '@/lib/kwazi/workoutAdaptation'
import { fetchActivePlan, fetchWorkouts } from '@/lib/dashboard/queries'
import { findTodaysWorkout, getCurrentWeekNumber } from '@/lib/dashboard/schedule'
import type { ChatMessage, KwaziChatState } from '@/types/kwazi.types'

const REMAINING_WARNING_THRESHOLD = 3

function createGreeting(firstName: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: `I'm Kwazi. Your Intelligent Training Coach. Welcome back, ${firstName}. How are you feeling today?`,
    timestamp: new Date().toISOString(),
  }
}

function createFreshChat(userId: string, firstName: string): KwaziChatState {
  return {
    userId,
    messages: [createGreeting(firstName)],
    pendingSwap: null,
    startedAt: new Date().toISOString(),
  }
}

// Both idempotent — safe to re-run on already-clean text. Applied at load
// time (repairs any chat persisted before this content was always cleaned
// at creation, e.g. from an earlier app version) and again at send time
// (defensive — guarantees the array forwarded to the edge function is never
// the raw double-encoded JSON envelope or an un-stripped adaptation block,
// regardless of how it ended up in `chat.messages`).
function sanitizeMessageContent(content: string): string {
  return stripWorkoutAdaptationBlock(unwrapDoubleEncodedReply(content))
}

function sanitizeChatState(state: KwaziChatState): KwaziChatState {
  return {
    ...state,
    messages: state.messages.map((m) => (m.role === 'assistant' ? { ...m, content: sanitizeMessageContent(m.content) } : m)),
  }
}

export function Kwazi() {
  const session = useAuthStore((state) => state.session)
  const profile = useAuthStore((state) => state.profile)
  const userId = session?.user.id ?? null
  const location = useLocation()
  const navigate = useNavigate()
  const injuryMessage = (location.state as { injuryMessage?: string } | null)?.injuryMessage ?? null
  const firstName = profile?.first_name ?? 'there'
  const queryClient = useQueryClient()

  const [chat, setChat] = useState<KwaziChatState | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [remaining, setRemaining] = useState(10)
  const [blocked, setBlocked] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [restartOpen, setRestartOpen] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const historyQuery = useQuery({
    queryKey: ['kwazi-history', userId],
    queryFn: () => fetchChatHistory(userId!),
    enabled: !!userId && historyOpen,
  })

  // Same query keys used on the Dashboard/WorkoutSession — React Query
  // dedupes these, so this isn't an extra fetch in practice. Needed so Kwazi
  // can be told which workout is actually today's, not just the edge
  // function's previous fallback of "the first workout in the plan".
  const planQuery = useQuery({
    queryKey: ['plan', userId],
    queryFn: () => fetchActivePlan(userId!),
    enabled: !!userId,
  })
  const plan = planQuery.data ?? null

  const workoutsQuery = useQuery({
    queryKey: ['workouts', plan?.id],
    queryFn: () => fetchWorkouts(plan!.id),
    enabled: !!plan?.id,
  })

  const todaysWorkout = (() => {
    if (!plan) return null
    const now = new Date()
    const weekNumber = getCurrentWeekNumber(plan.start_date, plan.total_weeks, now)
    const availabilityDays = profile?.availability_days ?? 0
    return findTodaysWorkout(workoutsQuery.data ?? [], weekNumber, availabilityDays, plan.start_date, now)
  })()

  useEffect(() => {
    if (!userId) return

    void (async () => {
      const existing = loadActiveChat(userId)
      if (existing) {
        const cleaned = sanitizeChatState(existing)
        setChat(cleaned)
        // Repair persisted storage too, so a stale corrupted message doesn't
        // keep getting reloaded raw on every future visit.
        saveActiveChat(cleaned)
      } else {
        const fresh = createFreshChat(userId, firstName)
        setChat(fresh)
        saveActiveChat(fresh)
      }

      const value = await fetchKwaziRemaining(userId)
      setRemaining(value)
      setBlocked(value <= 0)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Auto-send a pre-loaded injury message (e.g. after updating injury info in Settings).
  useEffect(() => {
    if (!chat || !injuryMessage) return
    navigate('.', { replace: true, state: null })
    void handleSendText(injuryMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat, injuryMessage])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat?.messages.length])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  async function handleSendText(text: string) {
    if (!chat || !userId || !text.trim() || isSending || blocked) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }

    const nextMessages = [...chat.messages, userMessage]
    const optimistic: KwaziChatState = { ...chat, messages: nextMessages }
    setChat(optimistic)
    saveActiveChat(optimistic)
    setInputValue('')
    setIsSending(true)

    try {
      const response = await sendKwaziMessage({
        userId,
        messages: nextMessages.map((m) => ({
          role: m.role,
          content: m.role === 'assistant' ? sanitizeMessageContent(m.content) : m.content,
        })),
        pendingSwap: chat.pendingSwap,
        currentWorkoutId: todaysWorkout?.id ?? null,
      })

      setRemaining(response.remaining)
      setBlocked(response.blocked)

      if (response.blocked) {
        const reverted: KwaziChatState = { ...optimistic, messages: chat.messages }
        setChat(reverted)
        saveActiveChat(reverted)
        return
      }

      const rawReply = response.reply ?? "Kwazi's listening."
      const workoutAdaptation = parseWorkoutAdaptation(rawReply)

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        // Always strip the <WORKOUT_ADAPTATION> block — users see Kwazi's
        // conversational text only, never the raw JSON. No-op when no block
        // is present, so this is safe to call unconditionally.
        content: stripWorkoutAdaptationBlock(rawReply),
        timestamp: new Date().toISOString(),
        chips: response.chips ?? null,
        escalate: response.escalate ?? false,
        workoutAdaptation,
      }

      const updated: KwaziChatState = {
        ...optimistic,
        messages: [...optimistic.messages, assistantMessage],
        pendingSwap: response.pendingSwap ?? null,
      }
      setChat(updated)
      saveActiveChat(updated)

      if (response.swapApplied) {
        void queryClient.invalidateQueries({ queryKey: ['plan'] })
        void queryClient.invalidateQueries({ queryKey: ['workouts'] })
        void queryClient.invalidateQueries({ queryKey: ['workout'] })
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Kwazi's having trouble connecting right now — give it a moment and try again.",
        timestamp: new Date().toISOString(),
      }
      const updated: KwaziChatState = { ...optimistic, messages: [...optimistic.messages, errorMessage] }
      setChat(updated)
      saveActiveChat(updated)
    } finally {
      setIsSending(false)
    }
  }

  function handleSend() {
    void handleSendText(inputValue)
  }

  function handleChipSelect(value: string) {
    void handleSendText(value)
  }

  // Resolving the card (either button) clears workoutAdaptation from the
  // message so it stops rendering, matching "Keep original" dismissing with
  // no further action and "Apply" persisting the override then dismissing.
  function resolveWorkoutAdaptation(messageId: string) {
    if (!chat) return
    const updated: KwaziChatState = {
      ...chat,
      messages: chat.messages.map((m) => (m.id === messageId ? { ...m, workoutAdaptation: null } : m)),
    }
    setChat(updated)
    saveActiveChat(updated)
  }

  function showAppliedToast() {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage("✓ Today's session has been updated")
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000)
  }

  function handleApplyWorkoutAdaptation(message: ChatMessage) {
    if (!todaysWorkout || !message.workoutAdaptation) {
      resolveWorkoutAdaptation(message.id)
      return
    }
    const adapted = applyWorkoutAdaptation(todaysWorkout, message.workoutAdaptation)
    const today = new Date().toISOString().slice(0, 10)
    const key = kwaziOverrideKey(todaysWorkout.id, today)
    const payload: KwaziOverridePayload = { workout: adapted, reason: message.workoutAdaptation.reason }
    console.log('[Kwazi] applying workout adaptation — key:', key, 'workoutId:', todaysWorkout.id, 'date:', today, 'payload:', payload)
    try {
      localStorage.setItem(key, JSON.stringify(payload))
    } catch {
      // ignore storage failures (e.g. private browsing, quota exceeded)
    }

    // Hardcoded — not another edge function call. This is a fixed
    // confirmation, not a fresh model response, so there's nothing to ask
    // Claude for here.
    const nameForGreeting = profile?.first_name ?? 'Neo'
    const followUp: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Done — I've updated today's session for you. The changes are live when you're ready to start. Go get it, ${nameForGreeting}. 💪`,
      timestamp: new Date().toISOString(),
    }

    if (chat) {
      const updated: KwaziChatState = {
        ...chat,
        messages: [
          ...chat.messages.map((m) => (m.id === message.id ? { ...m, workoutAdaptation: null } : m)),
          followUp,
        ],
      }
      setChat(updated)
      saveActiveChat(updated)
    }

    showAppliedToast()
  }

  function handleKeepOriginalWorkout(message: ChatMessage) {
    resolveWorkoutAdaptation(message.id)
  }

  async function handleRestartConfirm() {
    if (!chat || !userId) return
    setIsRestarting(true)
    await archiveChat(userId, chat.messages, chat.startedAt)
    clearActiveChat(userId)
    const fresh = createFreshChat(userId, firstName)
    setChat(fresh)
    saveActiveChat(fresh)
    setIsRestarting(false)
    setRestartOpen(false)
    void queryClient.invalidateQueries({ queryKey: ['kwazi-history', userId] })
  }

  async function handleDeleteHistory(id: string) {
    await deleteChatHistoryEntry(id)
    void queryClient.invalidateQueries({ queryKey: ['kwazi-history', userId] })
  }

  if (!chat) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-text-secondary">Loading Kwazi...</p>
      </div>
    )
  }

  const lastMessageId = chat.messages[chat.messages.length - 1]?.id

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex min-h-svh flex-col bg-background"
    >
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-lg font-extrabold tracking-widest text-text-primary">KWAZI</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            aria-label="Chat history"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
          >
            <History size={20} />
          </button>
          <button
            type="button"
            onClick={() => setRestartOpen(true)}
            aria-label="Restart conversation"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {chat.messages.map((message) => (
          <div key={message.id}>
            <ChatBubble
              message={message}
              onChipSelect={handleChipSelect}
              chipsDisabled={isSending || blocked || message.id !== lastMessageId}
              onApplyWorkoutAdaptation={() => handleApplyWorkoutAdaptation(message)}
              onKeepOriginalWorkout={() => handleKeepOriginalWorkout(message)}
            />
            {message.escalate && (
              <div className="mt-2">
                <EscalationCard />
              </div>
            )}
          </div>
        ))}
        {isSending && <p className="px-1 text-xs text-text-muted">Kwazi is typing...</p>}
      </div>

      {blocked && (
        <div className="border-t border-phase-peak/40 bg-phase-peak/10 px-4 py-3 text-center text-sm text-phase-peak">
          You've reached your 10 message limit for today. Your Kwazi resets at midnight.
        </div>
      )}

      <div className="border-t border-border px-4 py-3 pb-[calc(64px_+_env(safe-area-inset-bottom))]">
        <MessageInput value={inputValue} onChange={setInputValue} onSend={handleSend} disabled={isSending || blocked} />
        {!blocked && remaining <= REMAINING_WARNING_THRESHOLD && (
          <p className="mt-2 text-center text-xs text-text-muted">
            {remaining} Kwazi message{remaining === 1 ? '' : 's'} remaining today
          </p>
        )}
      </div>

      <RestartModal
        isOpen={restartOpen}
        isRestarting={isRestarting}
        onConfirm={() => void handleRestartConfirm()}
        onCancel={() => setRestartOpen(false)}
      />

      <HistorySheet
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        entries={historyQuery.data ?? []}
        onDelete={(id) => void handleDeleteHistory(id)}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </motion.div>
  )
}
