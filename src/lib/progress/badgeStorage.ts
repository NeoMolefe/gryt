const KEY_PREFIX = 'gryt_seen_badges_'

export function loadSeenBadges(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${userId}`)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function saveSeenBadges(userId: string, ids: Set<string>): void {
  try {
    localStorage.setItem(`${KEY_PREFIX}${userId}`, JSON.stringify(Array.from(ids)))
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
}
