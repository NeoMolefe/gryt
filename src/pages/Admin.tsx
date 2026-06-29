import { useState } from 'react'
import { useAdminMetrics } from '@/hooks/useAdminMetrics'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const BRAND_ORANGE = '#FF5C1A'
const CHART_COLORS = [
  '#FF5C1A', '#FF8C5A', '#FFB899', '#E04D10',
  '#C43D00', '#FF6B35', '#FF9B6B', '#FFD0B5',
]

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  trial: '#FF5C1A',
  expired: '#ef4444',
  cancelled: '#6b7280',
  past_due: '#f59e0b',
}

function StatCard({
  label, value, sub, accent, small,
}: {
  label: string
  value: number | string
  sub?: string
  accent?: boolean
  small?: boolean
}) {
  return (
    <div style={{
      background: 'var(--color-card)',
      border: `1px solid ${accent ? 'rgba(255,92,26,0.5)' : 'var(--color-border)'}`,
      borderRadius: 14,
      padding: small ? '14px 16px' : '18px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 2, background: BRAND_ORANGE,
        }} />
      )}
      <p style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--color-text-muted)',
        marginBottom: 6,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: small ? 28 : 36, fontWeight: 500,
        letterSpacing: '-0.04em', lineHeight: 1,
        color: accent ? BRAND_ORANGE : 'var(--color-text-primary)',
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {sub}
        </p>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'var(--color-text-muted)',
      margin: '28px 0 12px', paddingBottom: 8,
      borderBottom: '1px solid var(--color-border)',
    }}>
      {children}
    </h2>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      background: `${STATUS_COLORS[status] ?? '#6b7280'}20`,
      color: STATUS_COLORS[status] ?? '#6b7280',
      borderRadius: 20, padding: '2px 8px',
      fontSize: 11, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {status}
    </span>
  )
}

// Build last N days array for trend charts
function buildDayArray(dayCount: number, data: Record<string, number>) {
  return Array.from({ length: dayCount }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (dayCount - 1 - i))
    const key = d.toISOString().slice(0, 10)
    return {
      date: key.slice(5), // MM-DD
      value: data[key] ?? 0,
    }
  })
}

export function Admin() {
  const { data: metrics, isLoading, error, dataUpdatedAt, refetch } = useAdminMetrics()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'kwazi' | 'activity'>('overview')

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100svh', flexDirection: 'column', gap: 12,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: `3px solid ${BRAND_ORANGE}`,
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
          Loading metrics...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100svh',
      }}>
        <p style={{ color: '#ef4444' }}>Failed to load. Check Edge Function logs.</p>
      </div>
    )
  }

  const signupTrend = buildDayArray(14, metrics.trends?.signupsByDay ?? {})
  const workoutTrend = buildDayArray(14, metrics.trends?.workoutsByDay ?? {})

  const archetypePieData = Object.entries(metrics.archetypeCounts ?? {}).map(([name, value]) => ({
    name, value,
  }))

  const planPieData = Object.entries(metrics.subscribers.planBreakdown ?? {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }))

  return (
    <div style={{
      minHeight: '100svh',
      background: 'var(--color-bg)',
      maxWidth: 680,
      margin: '0 auto',
      padding: '0 0 80px',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        padding: '16px 20px 12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: 20, fontWeight: 700, letterSpacing: '-0.04em',
              color: 'var(--color-text-primary)', margin: 0,
            }}>
              GRYT <span style={{ color: BRAND_ORANGE }}>Admin</span>
            </h1>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
              {new Date(dataUpdatedAt).toLocaleTimeString()} · auto-refresh 30s
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              background: 'rgba(34,197,94,0.15)', color: '#22c55e',
              borderRadius: 20, padding: '3px 10px',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            }}>
              ● LIVE
            </div>
            <button
              onClick={() => refetch()}
              style={{
                background: 'var(--color-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '6px 12px',
                fontSize: 12, color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, marginTop: 12,
          background: 'var(--color-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 10, padding: 3,
        }}>
          {(['overview', 'users', 'kwazi', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                background: activeTab === tab ? BRAND_ORANGE : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--color-text-secondary)',
                border: 'none', borderRadius: 8,
                padding: '6px 4px', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <SectionTitle>Subscribers</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <StatCard label="Total" value={metrics.subscribers.total} accent />
              <StatCard label="Paying" value={metrics.subscribers.paying} accent />
              <StatCard label="Trial" value={metrics.subscribers.trial} small />
              <StatCard label="Expired" value={metrics.subscribers.expired} small />
              <StatCard label="Comp" value={metrics.subscribers.complimentary} small />
              <StatCard
                label="Founding"
                value={metrics.subscribers.foundingMembers}
                sub={`${100 - metrics.subscribers.foundingMembers} left`}
                small
              />
            </div>

            {/* Founding progress bar */}
            <div style={{
              marginTop: 12,
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Founding spots claimed
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: BRAND_ORANGE, margin: 0 }}>
                  {metrics.subscribers.foundingMembers} / 100
                </p>
              </div>
              <div style={{
                height: 6, background: 'var(--color-elevated)',
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${metrics.subscribers.foundingMembers}%`,
                  background: BRAND_ORANGE,
                  borderRadius: 999,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>

            {/* New users */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <StatCard label="New Today" value={metrics.subscribers.newToday} small />
              <StatCard label="New This Week" value={metrics.subscribers.newThisWeek} small />
            </div>

            {/* Archetype pie */}
            {archetypePieData.length > 0 && (
              <>
                <SectionTitle>Archetype Breakdown</SectionTitle>
                <div style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14, padding: '16px 8px',
                }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={archetypePieData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${(name ?? '').split(' ')[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {archetypePieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 8, fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Plan type pie */}
            {planPieData.length > 0 && (
              <>
                <SectionTitle>Plan Type Breakdown</SectionTitle>
                <div style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14, padding: '16px 8px',
                }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={planPieData}
                        cx="50%" cy="50%"
                        innerRadius={40} outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {planPieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 8, fontSize: 12,
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Signup trend */}
            <SectionTitle>New Signups — Last 14 Days</SectionTitle>
            <div style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 14, padding: '16px 8px 8px',
            }}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={signupTrend} barSize={16}>
                  <XAxis
                    dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                    axisLine={false} tickLine={false}
                    interval={1}
                  />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8, fontSize: 12,
                    }}
                    formatter={(v) => [v, 'Signups']}
                  />
                  <Bar dataKey="value" fill={BRAND_ORANGE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Workout trend */}
            <SectionTitle>Workout Completions — Last 14 Days</SectionTitle>
            <div style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 14, padding: '16px 8px 8px',
            }}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={workoutTrend} barSize={16}>
                  <XAxis
                    dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                    axisLine={false} tickLine={false}
                    interval={1}
                  />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8, fontSize: 12,
                    }}
                    formatter={(v) => [v, 'Workouts']}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Activity metrics */}
            <SectionTitle>App Activity</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatCard label="Workouts Today" value={metrics.activity.workoutsToday} small />
              <StatCard label="Workouts / Week" value={metrics.activity.workoutsThisWeek} small />
              <StatCard label="Check-ins Today" value={metrics.activity.checkInsToday} small />
              <StatCard label="Check-ins / Week" value={metrics.activity.checkInsThisWeek} small />
            </div>
          </>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <>
            <SectionTitle>{`All Users (${metrics.users?.length ?? 0})`}</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(metrics.users ?? []).map((user) => (
                <div
                  key={user.id}
                  style={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 14, padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                        {user.name}
                        {user.isComplimentary && (
                          <span style={{
                            marginLeft: 6, fontSize: 10, background: 'rgba(255,92,26,0.15)',
                            color: BRAND_ORANGE, borderRadius: 20, padding: '1px 6px', fontWeight: 600,
                          }}>
                            COMP
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                        {user.email}
                      </p>
                    </div>
                    <StatusBadge status={user.subscriptionStatus} />
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Archetype
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: 0, fontWeight: 500 }}>
                        {user.archetype ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Plan
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: 0, fontWeight: 500 }}>
                        {user.planType?.replace(/_/g, ' ') ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Kwazi / Week
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: 0, fontWeight: 500 }}>
                        {user.kwaziThisWeek}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Joined
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: 0, fontWeight: 500 }}>
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan regenerations */}
            {(metrics.regenHistory ?? []).length > 0 && (
              <>
                <SectionTitle>Plan Regenerations</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(metrics.regenHistory ?? []).map((regen, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12, padding: '12px 14px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: 0, fontWeight: 500 }}>
                          {regen.from_archetype ?? '?'}{' '}
                          <span style={{ color: BRAND_ORANGE }}>→</span>{' '}
                          {regen.to_archetype ?? 'In progress'}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                          {regen.month} · {regen.count}× this month
                        </p>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, flexShrink: 0 }}>
                        {regen.regenerated_at
                          ? new Date(regen.regenerated_at).toLocaleDateString()
                          : regen.month}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* KWAZI TAB */}
        {activeTab === 'kwazi' && (
          <>
            <SectionTitle>Kwazi Overview</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatCard
                label="Messages / Week"
                value={metrics.kwazi.totalMessagesThisWeek}
                accent
              />
              <StatCard
                label="Active Users"
                value={metrics.kwazi.activeUsersThisWeek}
                sub="used Kwazi this week"
              />
              <StatCard
                label="Regenerations"
                value={metrics.regenerations.totalThisMonth}
                sub="this month"
              />
            </div>

            <SectionTitle>Per-User Kwazi Usage (This Week)</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(metrics.users ?? [])
                .filter((u) => u.kwaziThisWeek > 0)
                .sort((a, b) => b.kwaziThisWeek - a.kwaziThisWeek)
                .map((user) => (
                  <div
                    key={user.id}
                    style={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 12, padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                          {user.name}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                          {user.email}
                        </p>
                      </div>
                      <p style={{ fontSize: 22, fontWeight: 500, color: BRAND_ORANGE, margin: 0 }}>
                        {user.kwaziThisWeek}
                      </p>
                    </div>
                    {/* Mini bar showing usage vs 70 (10/day x 7 days max) */}
                    <div style={{
                      height: 4, background: 'var(--color-elevated)',
                      borderRadius: 999, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (user.kwaziThisWeek / 70) * 100)}%`,
                        background: user.kwaziThisWeek >= 50 ? '#ef4444' : BRAND_ORANGE,
                        borderRadius: 999,
                      }} />
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '4px 0 0', textAlign: 'right' }}>
                      of 70 weekly max
                    </p>
                  </div>
                ))}
              {(metrics.users ?? []).filter((u) => u.kwaziThisWeek > 0).length === 0 && (
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', padding: '16px 0' }}>
                  No Kwazi usage this week.
                </p>
              )}
            </div>
          </>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <>
            <SectionTitle>Recent Activity Feed</SectionTitle>
            <div style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 14, overflow: 'hidden',
            }}>
              {(metrics.activityFeed ?? []).length === 0 ? (
                <p style={{ padding: 20, color: 'var(--color-text-muted)', fontSize: 14 }}>
                  No recent activity.
                </p>
              ) : (
                (metrics.activityFeed ?? []).map((event, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '13px 16px',
                      borderBottom: i < metrics.activityFeed.length - 1
                        ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: event.type === 'workout_completed'
                          ? 'rgba(255,92,26,0.15)'
                          : 'rgba(59,130,246,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, flexShrink: 0,
                      }}>
                        {event.type === 'workout_completed' ? '💪' : '✅'}
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--color-text-primary)', margin: 0 }}>
                        {event.label}
                      </p>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, flexShrink: 0, marginLeft: 12 }}>
                      {new Date(event.timestamp).toLocaleString([], {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
