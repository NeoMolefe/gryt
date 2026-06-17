import { Bell } from 'lucide-react'

interface DashboardHeaderProps {
  initials: string
  hasNotifications: boolean
  onBellClick: () => void
}

export function DashboardHeader({ initials, hasNotifications, onBellClick }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xl font-extrabold tracking-wide text-text-primary">GRYT</span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          onClick={onBellClick}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
        >
          <Bell size={22} />
          {hasNotifications && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-orange" />
          )}
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-sm font-semibold text-text-primary">
          {initials}
        </div>
      </div>
    </div>
  )
}
