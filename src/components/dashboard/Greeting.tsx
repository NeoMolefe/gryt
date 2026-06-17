import { getGreeting, getMotivationalLine } from '@/lib/dashboard/greeting'

interface GreetingProps {
  firstName: string
  streak: number
}

export function Greeting({ firstName, streak }: GreetingProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">{getGreeting(firstName)}</h1>
      <p className="mt-1 text-text-secondary">{getMotivationalLine(streak)}</p>
    </div>
  )
}
