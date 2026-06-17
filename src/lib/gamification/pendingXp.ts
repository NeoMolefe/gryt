const KEY_PREFIX = 'gryt_pending_xp_'

/** Stashes an XP amount earned off-Dashboard (e.g. during a workout session) so the Dashboard can animate it on return. */
export function setPendingXp(userId: string, amount: number): void {
  try {
    localStorage.setItem(`${KEY_PREFIX}${userId}`, String(amount))
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
}

/** Reads and clears any pending XP amount for the user. */
export function consumePendingXp(userId: string): number | null {
  try {
    const key = `${KEY_PREFIX}${userId}`
    const raw = localStorage.getItem(key)
    if (!raw) return null
    localStorage.removeItem(key)
    const amount = Number(raw)
    return Number.isFinite(amount) && amount > 0 ? amount : null
  } catch {
    return null
  }
}
