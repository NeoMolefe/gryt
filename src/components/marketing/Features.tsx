import { motion } from 'framer-motion'
import {
  ListChecks,
  Bot,
  Activity,
  Trophy,
  TrendingUp,
  HeartPulse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: ListChecks,
    title: 'A programme built around you',
    description:
      '8–12 week adaptive plans built around your goal, equipment, and schedule.',
  },
  {
    icon: Bot,
    title: 'A coach that knows your history',
    description:
      'An intelligent training coach that knows your plan, your history, and your goals.',
  },
  {
    icon: Activity,
    title: "Sessions that adapt when life doesn't",
    description:
      'Your sessions adjust based on how each set actually felt — not a fixed script.',
  },
  {
    icon: Trophy,
    title: 'Every personal best, captured',
    description: 'Every PB is tracked and celebrated the moment it happens.',
  },
  {
    icon: TrendingUp,
    title: 'Training that builds week on week',
    description:
      'Foundation, Build, and Peak phases sequence your training so gains compound.',
  },
  {
    icon: HeartPulse,
    title: 'Knows when to push, knows when to rest',
    description:
      'Readiness tracking that knows when to push and when to back off.',
  },
]

const spring = {
  duration: 0.6,
  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
}

export function Features() {
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
            What you get
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
            margin: '0 0 56px',
          }}
        >
          Everything you need to train like an athlete.
        </motion.h2>

        {/* 2-column card grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}
          className="features-grid"
        >
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ ...spring, delay: (i % 2) * 0.1 }}
                whileHover={{ y: -2 }}
                style={{
                  background: `linear-gradient(180deg, var(--color-card-high) 0%, var(--color-card) 70%, var(--color-card-low) 100%)`,
                  border: '2px solid var(--color-border)',
                  borderRadius: 20,
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  boxShadow: '0 0 0 0 rgba(0,0,0,0)',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                {/* Icon badge */}
                <div
                  style={{
                    background: 'rgba(255,92,26,0.1)',
                    borderRadius: 12,
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} strokeWidth={1.5} color="#FF5C1A" aria-hidden="true" />
                </div>

                <h4
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.3,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}
                >
                  {feature.title}
                </h4>

                <p
                  style={{
                    fontSize: 16,
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.4,
                    margin: 0,
                    maxWidth: '55ch',
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
