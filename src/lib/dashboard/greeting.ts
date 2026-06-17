export function getGreeting(firstName: string, now: Date = new Date()): string {
  const hour = now.getHours()
  const name = firstName.trim() || 'there'

  if (hour >= 5 && hour < 12) {
    return `Good morning, ${name}.`
  }

  return `Welcome back, ${name}.`
}

export function getMotivationalLine(streak: number): string {
  if (streak <= 0) return "Day one is the hardest. Let's go."
  if (streak < 7) return 'Streak alive. Keep it going.'
  return "On fire. Don't stop now."
}
