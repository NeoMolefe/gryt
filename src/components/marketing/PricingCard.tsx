import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchFoundingMemberCount } from '@/lib/pricing/foundingCount'

const FEATURES = [
  'Full programme access',
  'Unlimited workout logging',
  '10 Kwazi messages/day',
  'Progress metrics and analytics',
  'Phase overview and calendar',
]

const FOUNDING_LIMIT = 100

type BillingPeriod = 'monthly' | 'annual'

export function PricingCard() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly')

  const { data: foundingCount = 0 } = useQuery({
    queryKey: ['founding-member-count'],
    queryFn: fetchFoundingMemberCount,
    staleTime: 60_000,
  })

  const spotsRemaining = Math.max(0, FOUNDING_LIMIT - foundingCount)
  const isFoundingActive = spotsRemaining > 0

  const foundingPrice = billing === 'monthly' ? 'R79' : 'R632'
  const standardPrice = billing === 'monthly' ? 'R99' : 'R890'
  const foundingStrike = billing === 'monthly' ? 'R99' : 'R890'
  const period = billing === 'monthly' ? '/month' : '/year'

  return (
    <section style={{ padding: '100px 0', background: 'var(--color-bg)' }}>
      <div className="mkt-inner">
        {/* Section tag */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 40,
              background: 'var(--color-card)',
              boxShadow: '0px 4px 12px var(--color-shadow)',
              fontSize: 14,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-secondary)',
            }}
          >
            Pricing
          </span>
        </div>

        {/* H2 */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(34px, 4vw, 48px)',
            fontWeight: 500,
            letterSpacing: '-0.05em',
            lineHeight: 1.2,
            color: 'var(--color-text-primary)',
            margin: '0 0 12px',
          }}
        >
          Simple plans, clear value.
        </motion.h2>

        {/* Scarcity line — only when spots remain */}
        {isFoundingActive && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              textAlign: 'center',
              fontSize: 14,
              color: 'var(--color-text-muted)',
              letterSpacing: '-0.02em',
              margin: '0 0 40px',
            }}
          >
            {spotsRemaining} of 100 founding spots remaining
          </motion.p>
        )}

        {!isFoundingActive && (
          <div style={{ marginBottom: 40 }} />
        )}

        {/* Single centred card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            maxWidth: 380,
            margin: '0 auto',
          }}
        >
          {/* Gradient border wrapper (the "highlight" treatment) */}
          <div
            style={{
              background: 'linear-gradient(125deg, #FF5C1A 0%, #E04D10 66%)',
              borderRadius: 25,
              padding: 1,
            }}
          >
            <div
              style={{
                background: 'var(--color-card)',
                borderRadius: 23,
                padding: 32,
              }}
            >
              {/* Founding badge */}
              {isFoundingActive && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(255,92,26,0.15)',
                      color: '#FF5C1A',
                      borderRadius: 40,
                      padding: '4px 12px',
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Founding Member Price
                  </span>
                </div>
              )}

              {/* Plan name */}
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '-0.02em',
                  margin: '0 0 4px',
                  textAlign: 'center',
                }}
              >
                Premium
              </p>

              {/* Billing toggle */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 4,
                  margin: '16px 0 24px',
                  background: 'var(--color-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 40,
                  padding: 4,
                }}
              >
                {(['monthly', 'annual'] as BillingPeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setBilling(period)}
                    aria-pressed={billing === period}
                    style={{
                      flex: 1,
                      background: billing === period ? '#FF5C1A' : 'transparent',
                      color: billing === period ? '#fff' : 'var(--color-text-secondary)',
                      border: 'none',
                      borderRadius: 40,
                      padding: '8px 16px',
                      fontSize: 14,
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease, color 0.2s ease',
                    }}
                  >
                    {period === 'monthly' ? 'Monthly' : 'Annual'}
                    {period === 'annual' && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          color: billing === 'annual' ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)',
                        }}
                      >
                        2 months free
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Price display */}
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 52,
                    fontWeight: 500,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {isFoundingActive ? foundingPrice : standardPrice}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '-0.02em',
                    marginLeft: 4,
                  }}
                >
                  {period}
                </span>
              </div>

              {/* Strikethrough standard price — only when founding active */}
              {isFoundingActive && (
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: 14,
                    color: 'var(--color-text-muted)',
                    letterSpacing: '-0.02em',
                    margin: '0 0 4px',
                  }}
                >
                  <span
                    style={{
                      textDecoration: 'line-through',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {foundingStrike}
                  </span>{' '}
                  regular price
                </p>
              )}

              {/* Locked in line */}
              {isFoundingActive && (
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#FF5C1A',
                    letterSpacing: '-0.02em',
                    margin: '0 0 24px',
                  }}
                >
                  Locked in for life as a founding member.
                </p>
              )}

              {!isFoundingActive && <div style={{ marginBottom: 24 }} />}

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: 'var(--color-border)',
                  margin: '0 0 24px',
                }}
              />

              {/* Feature list */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {FEATURES.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 15,
                      color: 'var(--color-text-primary)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(255,92,26,0.12)',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={12} strokeWidth={2.5} color="#FF5C1A" aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/sign-up"
                style={{
                  display: 'block',
                  background: '#FF5C1A',
                  color: '#fff',
                  borderRadius: 40,
                  padding: '14px 24px',
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxShadow: '0px 4px 16px rgba(255,92,26,0.25)',
                  marginBottom: 12,
                }}
              >
                Start Free Trial
              </Link>

              <p
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  color: 'var(--color-text-muted)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                7 days free. Cancel anytime before your trial ends.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
