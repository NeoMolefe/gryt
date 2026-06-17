import { supabase } from '@/lib/supabase'
import { isNotificationTypeEnabled } from '@/lib/notifications/preferences'
import type { DashboardNotification, NotificationType } from '@/types/dashboard.types'

export async function fetchNotifications(userId: string, limit = 30): Promise<DashboardNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch notifications:', error.message)
    return []
  }

  return (data ?? []) as DashboardNotification[]
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
  if (error) console.error('Failed to mark notification read:', error.message)
}

/** Checks whether a notification of the given type has already been created for the user today. */
export async function hasNotificationToday(userId: string, type: NotificationType): Promise<boolean> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .gte('created_at', todayStart.toISOString())
    .limit(1)

  if (error) {
    console.error('Failed to check existing notifications:', error.message)
    return true
  }

  return (data ?? []).length > 0
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
): Promise<void> {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body,
    read: false,
  })

  if (error) console.error('Failed to create notification:', error.message)
}

/** Creates a notification only if the user has the relevant preference toggle enabled. */
export async function createNotificationIfEnabled(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
): Promise<void> {
  if (!isNotificationTypeEnabled(userId, type)) return
  await createNotification(userId, type, title, body)
}
