const FIRST_VISIT_KEY = 'gryt_a2hs_first_visit'
const IOS_DISMISSED_KEY = 'gryt_a2hs_ios_dismissed'
const IOS_SNOOZE_UNTIL_KEY = 'gryt_a2hs_ios_snooze_until'
const ANDROID_SNOOZE_UNTIL_KEY = 'gryt_a2hs_android_snooze_until'

const PROMPT_DELAY_MS = 60_000
const SNOOZE_DAYS = 3

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
}

export function detectPlatform(): 'ios' | 'android' | null {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return null
}

export function getFirstVisitTimestamp(): number {
  const stored = localStorage.getItem(FIRST_VISIT_KEY)
  if (stored) return Number(stored)

  const now = Date.now()
  localStorage.setItem(FIRST_VISIT_KEY, String(now))
  return now
}

export function getPromptDelayMs(): number {
  const elapsed = Date.now() - getFirstVisitTimestamp()
  return Math.max(0, PROMPT_DELAY_MS - elapsed)
}

function isSnoozed(key: string): boolean {
  const until = localStorage.getItem(key)
  return until !== null && Date.now() < Number(until)
}

function snooze(key: string): void {
  const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000
  localStorage.setItem(key, String(until))
}

export function isIosPromptEligible(): boolean {
  return localStorage.getItem(IOS_DISMISSED_KEY) !== 'true' && !isSnoozed(IOS_SNOOZE_UNTIL_KEY)
}

export function dismissIosPromptPermanently(): void {
  localStorage.setItem(IOS_DISMISSED_KEY, 'true')
}

export function snoozeIosPrompt(): void {
  snooze(IOS_SNOOZE_UNTIL_KEY)
}

export function isAndroidPromptEligible(): boolean {
  return !isSnoozed(ANDROID_SNOOZE_UNTIL_KEY)
}

export function snoozeAndroidPrompt(): void {
  snooze(ANDROID_SNOOZE_UNTIL_KEY)
}
