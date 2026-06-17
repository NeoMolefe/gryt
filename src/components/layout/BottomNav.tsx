import { NavLink } from 'react-router-dom'
import { Bot, Dumbbell, LayoutDashboard, Settings, TrendingUp } from 'lucide-react'

const TABS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/kwazi', label: 'Kwazi', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors duration-150 ${
                isActive ? 'text-brand-orange' : 'text-text-secondary hover:text-text-primary'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
