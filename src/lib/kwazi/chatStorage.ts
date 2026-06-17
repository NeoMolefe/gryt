import type { KwaziChatState } from '@/types/kwazi.types'

const KEY_PREFIX = 'gryt_kwazi_active_chat_'

function storageKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`
}

export function loadActiveChat(userId: string): KwaziChatState | null {
  const raw = localStorage.getItem(storageKey(userId))
  if (!raw) return null

  try {
    return JSON.parse(raw) as KwaziChatState
  } catch {
    return null
  }
}

export function saveActiveChat(state: KwaziChatState): void {
  localStorage.setItem(storageKey(state.userId), JSON.stringify(state))
}

export function clearActiveChat(userId: string): void {
  localStorage.removeItem(storageKey(userId))
}
