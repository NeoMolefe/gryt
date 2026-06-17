import type { ActiveSessionState } from '@/types/session.types'

const KEY_PREFIX = 'gryt_active_session_'
const MS_PER_DAY = 24 * 60 * 60 * 1000

function storageKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`
}

export function loadActiveSession(userId: string): ActiveSessionState | null {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return null
    return JSON.parse(raw) as ActiveSessionState
  } catch {
    return null
  }
}

export function saveActiveSession(state: ActiveSessionState): void {
  try {
    localStorage.setItem(storageKey(state.userId), JSON.stringify({ ...state, updatedAt: new Date().toISOString() }))
  } catch {
    // ignore storage failures (e.g. private browsing, quota exceeded)
  }
}

export function clearActiveSession(userId: string): void {
  try {
    localStorage.removeItem(storageKey(userId))
  } catch {
    // ignore storage failures
  }
}

/** Returns true if the session was started more than 24 hours ago. */
export function isSessionStale(state: ActiveSessionState, now: Date = new Date()): boolean {
  return now.getTime() - new Date(state.startedAt).getTime() > MS_PER_DAY
}

/** Auto-abandons a stale in-progress session for this user, returning it if it was abandoned. */
export function abandonStaleSession(userId: string, now: Date = new Date()): ActiveSessionState | null {
  const state = loadActiveSession(userId)
  if (!state) return null
  if (state.sessionStatus !== 'in_progress') return null
  if (!isSessionStale(state, now)) return null

  clearActiveSession(userId)
  return { ...state, sessionStatus: 'abandoned' }
}
