import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchFoundingMemberCount } from '@/lib/pricing/foundingCount'
import type { SubscriptionState, PlanType } from '@/types/subscription.types'
import { trialDaysRemaining } from '@/types/subscription.types'
import { initiateCheckout } from '@/lib/payment/checkout'

interface PaywallProps {
  userId: string
  userEmail: string
  subscription: SubscriptionState
}

const FOUNDING_LIMIT = 100

export function Paywall({ userId, userEmail, subscription }: PaywallProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: foundingCount = 0 } = useQuery({
    queryKey: ['founding-member-count'],
    queryFn: fetchFoundingMemberCount,
    staleTime: 60_000,
  })

  const spotsRemaining = Math.max(0, FOUNDING_LIMIT - foundingCount)
  const isFoundingActive = spotsRemaining > 0
  const daysLeft = trialDaysRemaining(subscription)
  const isExpired = subscription.status === 'expired' ||
    (subscription.status === 'trial' && daysLeft === 0)

  const planType: PlanType = isFoundingActive
    ? billing === 'monthly' ? 'founding_monthly' : 'founding_annual'
    : billing === 'monthly' ? 'standard_monthly' : 'standard_annual'

  async function handleSubscribe() {
    setIsLoading(true)
    setError(null)
    try {
      await initiateCheckout({ userId, userEmail, planType })
    } catch {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      overflowY: 'auto',
    }}>
      {/* GRYT wordmark */}
      <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 32 }}>
        GRYT
      </p>

      {/* Heading */}
      <h1 style={{
        fontSize: 'clamp(24px, 5vw, 36px)',
        fontWeight: 500,
        letterSpacing: '-0.04em',
        textAlign: 'center',
        marginBottom: 8,
        color: 'var(--color-text-primary)',
      }}>
        {isExpired ? 'Your trial has ended.' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your trial.`}
      </h1>
      <p style={{
        fontSize: 16,
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
        marginBottom: 40,
        maxWidth: 320,
      }}>
        Subscribe to keep training with GRYT.
      </p>

      {/* Founding scarcity */}
      {isFoundingActive && (
        <div style={{
          background: 'rgba(255,92,26,0.1)',
          border: '1px solid rgba(255,92,26,0.3)',
          borderRadius: 12,
          padding: '10px 16px',
          marginBottom: 24,
          fontSize: 14,
          color: '#FF5C1A',
          textAlign: 'center',
        }}>
          🔥 {spotsRemaining} founding member spot{spotsRemaining === 1 ? '' : 's'} remaining
        </div>
      )}

      {/* Billing toggle */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: 'var(--color-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 40,
        padding: 4,
        marginBottom: 24,
        width: '100%',
        maxWidth: 320,
      }}>
        {(['monthly', 'annual'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setBilling(period)}
            style={{
              flex: 1,
              background: billing === period ? '#FF5C1A' : 'transparent',
              color: billing === period ? '#fff' : 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 40,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {period === 'monthly' ? 'Monthly' : 'Annual — 2 months free'}
          </button>
        ))}
      </div>

      {/* Price */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 52, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--color-text-primary)' }}>
          {isFoundingActive
            ? billing === 'monthly' ? 'R79' : 'R632'
            : billing === 'monthly' ? 'R99' : 'R890'}
        </span>
        <span style={{ fontSize: 16, color: 'var(--color-text-secondary)', marginLeft: 4 }}>
          {billing === 'monthly' ? '/month' : '/year'}
        </span>
      </div>

      {isFoundingActive && (
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4, textDecoration: 'line-through' }}>
          {billing === 'monthly' ? 'R99' : 'R890'} regular price
        </p>
      )}
      {isFoundingActive && (
        <p style={{ fontSize: 13, color: '#FF5C1A', marginBottom: 32 }}>
          Locked in for life as a founding member.
        </p>
      )}
      {!isFoundingActive && <div style={{ marginBottom: 32 }} />}

      {/* Subscribe button */}
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        style={{
          width: '100%',
          maxWidth: 320,
          background: '#FF5C1A',
          color: '#fff',
          border: 'none',
          borderRadius: 40,
          padding: '16px 24px',
          fontSize: 16,
          fontWeight: 500,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          marginBottom: 12,
        }}
      >
        {isLoading ? 'Loading...' : 'Subscribe now'}
      </button>

      {error && (
        <p style={{ fontSize: 13, color: 'var(--color-phase-peak)', textAlign: 'center', marginBottom: 8 }}>
          {error}
        </p>
      )}

      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
        Secure payment via Paystack. Cancel anytime.
      </p>
    </div>
  )
}
