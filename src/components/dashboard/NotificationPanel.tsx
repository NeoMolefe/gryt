import { Award, Bell, Flame, Moon, AlertTriangle, CheckCircle2, TrendingUp, Bot } from 'lucide-react'
import { BottomSheet } from '@/components/dashboard/BottomSheet'
import type { DashboardNotification, NotificationType } from '@/types/dashboard.types'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  notifications: DashboardNotification[]
  onSelect: (notification: DashboardNotification) => void
}

const ICON_BY_TYPE: Record<NotificationType, typeof Bell> = {
  daily_reminder: Bell,
  daily_summary_evening: Moon,
  streak_reminder: Flame,
  deload_trigger: AlertTriangle,
  personal_best: TrendingUp,
  badge_unlocked: Award,
  phase_complete: CheckCircle2,
  weekly_kwazi_review: Bot,
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function NotificationPanel({ isOpen, onClose, notifications, onSelect }: NotificationPanelProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Notifications">
      {notifications.length === 0 ? (
        <p className="text-sm text-text-secondary">You're all caught up.</p>
      ) : (
        <ul className="max-h-[60vh] space-y-3 overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = ICON_BY_TYPE[notification.type] ?? Bell
            return (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => onSelect(notification)}
                  className="flex w-full items-start gap-3 rounded-xl bg-elevated p-3 text-left"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
                      {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-orange" />}
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{notification.body}</p>
                    <p className="mt-2 text-xs text-text-muted">{formatTimestamp(notification.created_at)}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </BottomSheet>
  )
}
