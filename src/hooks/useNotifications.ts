import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications, markNotificationRead } from '@/lib/notifications/queries'

export function useNotifications(userId: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId!),
    enabled: !!userId,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })

  const notifications = query.data ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markRead: (id: string) => markReadMutation.mutate(id),
  }
}
