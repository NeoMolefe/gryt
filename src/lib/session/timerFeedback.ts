export function playRestEndBeep(): void {
  try {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4)

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.4)
    oscillator.onended = () => void ctx.close()
  } catch {
    // Web Audio not available — fail silently
  }
}

export function pulseVibration(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(200)
  }
}
