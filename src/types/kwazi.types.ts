export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: string
  chips?: string[] | null
  escalate?: boolean
}

export type SwapScope = 'single_session' | 'this_week' | 'permanent'

export interface SwapPair {
  original: string
  replacement: string
}

export interface PendingSwap {
  stage: 'diagnostic' | 'confirm'
  kind: 'injury' | 'equipment'
  bodyPart?: string
  workoutId: string
  targets: string[]
  swaps: SwapPair[]
  scope?: SwapScope
}

export interface KwaziChatState {
  userId: string
  messages: ChatMessage[]
  pendingSwap: PendingSwap | null
  startedAt: string
}

export interface KwaziRequest {
  userId: string
  messages: { role: ChatRole; content: string }[]
  pendingSwap?: PendingSwap | null
  currentWorkoutId?: string | null
}

export interface KwaziResponse {
  reply: string | null
  chips?: string[] | null
  blocked: boolean
  remaining: number
  reason?: string
  escalate?: boolean
  pendingSwap?: PendingSwap | null
  swapApplied?: { swaps: SwapPair[]; scope: SwapScope } | null
}

export interface ChatHistoryEntry {
  id: string
  user_id: string
  messages: ChatMessage[]
  started_at: string
  ended_at: string
  created_at: string
}
