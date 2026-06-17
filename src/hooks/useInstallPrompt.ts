import { useCallback, useEffect, useState } from 'react'
import {
  detectPlatform,
  dismissIosPromptPermanently,
  getPromptDelayMs,
  isAndroidPromptEligible,
  isIosPromptEligible,
  isStandalone,
  snoozeAndroidPrompt,
  snoozeIosPrompt,
} from '@/lib/pwa/installPrompt'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

function getEligiblePlatform(): 'ios' | 'android' | null {
  if (isStandalone()) return null

  const detected = detectPlatform()
  if (!detected) return null

  if (detected === 'ios' && !isIosPromptEligible()) return null
  if (detected === 'android' && !isAndroidPromptEligible()) return null

  return detected
}

export function useInstallPrompt() {
  const [platform] = useState<'ios' | 'android' | null>(getEligiblePlatform)
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (!platform) return

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredEvent(event as BeforeInstallPromptEvent)
    }

    if (platform === 'android') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }

    const timer = setTimeout(() => setShowPrompt(true), getPromptDelayMs())

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [platform])

  const dismissIos = useCallback((permanent: boolean) => {
    if (permanent) {
      dismissIosPromptPermanently()
    } else {
      snoozeIosPrompt()
    }
    setShowPrompt(false)
  }, [])

  const dismissAndroid = useCallback(() => {
    snoozeAndroidPrompt()
    setShowPrompt(false)
  }, [])

  const triggerAndroidInstall = useCallback(async () => {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    setDeferredEvent(null)
    setShowPrompt(false)
  }, [deferredEvent])

  const isVisible = showPrompt && platform !== null && (platform === 'ios' || deferredEvent !== null)

  return {
    platform,
    isVisible,
    dismissIos,
    dismissAndroid,
    triggerAndroidInstall,
  }
}
