import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchSubscriberMetrics,
  fetchKwaziMetrics,
  fetchRecentActivity,
  fetchDailySignups,
  type ActivityEvent,
} from '@/lib/admin/queries'
import { supabase } from '@/lib/supabase'

function MetricCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 16,
      padding: 20,
    }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ fontSize: 36, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>{sub}</p>
      )}
    </div>
  )
}

const ACTIVITY_LABELS: Record<ActivityEvent['type'], string> = {
  checkin: '✅ Check-in',
  workout: '💪 Workout completed',
  kwazi: '🤖 Kwazi usage',
  regenerate: '🔄 Plan regenerated',
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })
}

export function Admin() {
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const { data: subscribers, refetch: refetchSubs } = useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: fetchSubscriberMetrics,
    refetchInterval: 30_000,
  })

  const { data: kwazi, refetch: refetchKwazi } = useQuery({
    queryKey: ['admin-kwazi'],
    queryFn: fetchKwaziMetrics,
    refetchInterval: 30_000,
  })

  const { data: activity, refetch: refetchActivity } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => fetchRecentActivity(30),
    refetchInterval: 15_000,
  })

  const { data: signups } = useQuery({
    queryKey: ['admin-signups'],
    queryFn: fetchDailySignups,
    refetchInterval: 60_000,
  })

  // Real-time subscription for new profiles
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        void refetchSubs()
        setLastUpdated(new Date())
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_logs' }, () => {
        void refetchActivity()
        setLastUpdated(new Date())
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'readiness_checkins' }, () => {
        void refetchActivity()
        setLastUpdated(new Date())
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kwazi_usage' }, () => {
        void refetchKwazi()
        void refetchActivity()
        setLastUpdated(new Date())
      })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [refetchSubs, refetchKwazi, refetchActivity])

  return (
    <div style={{ minHeight: '100svh', background: 'var(--color-bg)', padding: '24px 16px 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.04em', color: 'var(--color-text-primary)', margin: 0 }}>
          GRYT Admin
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
          Last updated {formatTimestamp(lastUpdated.toISOString())}
        </p>
      </div>

      {/* Subscriber metrics */}
      <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
        Subscribers
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
        <MetricCard label="Total Users" value={subscribers?.total ?? '—'} />
        <MetricCard label="Paying" value={subscribers?.paying ?? '—'} sub="Active subscriptions" />
        <MetricCard label="On Trial" value={subscribers?.trial ?? '—'} sub="7-day trial" />
        <MetricCard label="Expired" value={subscribers?.expired ?? '—'} sub="Trial ended, not subscribed" />
        <MetricCard label="Complimentary" value={subscribers?.complimentary ?? '—'} sub="Whitelisted accounts" />
        <MetricCard label="Founding Members" value={subscribers?.foundingMembers ?? '—'} sub="of 100 spots" />
        <MetricCard label="New Today" value={subscribers?.newToday ?? '—'} />
        <MetricCard label="New This Week" value={subscribers?.newThisWeek ?? '—'} />
      </div>

      {/* Kwazi metrics */}
      <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
        Kwazi Usage
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
        <MetricCard label="Messages Today" value={kwazi?.totalMessagesToday ?? '—'} />
        <MetricCard label="Messages This Week" value={kwazi?.totalMessagesThisWeek ?? '—'} />
        <MetricCard label="Active Users Today" value={kwazi?.uniqueUsersToday ?? '—'} />
        <MetricCard label="Active Users This Week" value={kwazi?.uniqueUsersThisWeek ?? '—'} />
      </div>

      {/* Daily signups chart — simple bar chart */}
      {signups && signups.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            Daily Signups (Last 14 Days)
          </h2>
          <div style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 32,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {signups.map((d) => {
                const max = Math.max(...signups.map((s) => s.count), 1)
                const height = Math.max(4, (d.count / max) * 80)
                return (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{d.count}</span>
                    <div style={{
                      width: '100%',
                      height,
                      background: '#FF5C1A',
                      borderRadius: 4,
                      opacity: 0.8,
                    }} />
                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)', transform: 'rotate(-45deg)', transformOrigin: 'top left', marginTop: 8 }}>
                      {d.date.slice(5)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Activity feed */}
      <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
        Recent Activity
      </h2>
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {(activity ?? []).length === 0 && (
          <p style={{ padding: 20, fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center' }}>
            No activity yet
          </p>
        )}
        {(activity ?? []).map((event, i) => (
          <div
            key={`${event.userId}-${event.timestamp}-${i}`}
            style={{
              padding: '14px 16px',
              borderBottom: i < (activity?.length ?? 0) - 1 ? '1px solid var(--color-border)' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ fontSize: 14, color: 'var(--color-text-primary)', margin: 0 }}>
                {ACTIVITY_LABELS[event.type]}
              </p>
              {event.detail && (
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  {event.detail}
                </p>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, flexShrink: 0, marginLeft: 12 }}>
              {formatTimestamp(event.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
