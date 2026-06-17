import { motion } from 'framer-motion'
import { BarChart2, HeartPulse, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Pillar {
  icon: LucideIcon
  title: string
  description: string
}

const PILLARS: Pillar[] = [
  {
    icon: BarChart2,
    title: 'Progressive overload, tracked precisely',
    description:
      'Every session adjusts based on your logged RPE — not a generic week-over-week bump.',
  },
  {
    icon: HeartPulse,
    title: 'Readiness-based adaptation',
    description:
      'Your plan responds to how you actually feel, not just what the calendar says.',
  },
  {
    icon: Layers,
    title: 'Phase periodisation',
    description:
      'Foundation, Build, and Peak phases sequence your training so adaptations compound instead of plateauing.',
  },
]

const spring = {
  duration: 0.6,
  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
}

export function Methodology() {
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
            The science
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
          Built on training principles that work.
        </motion.h2>

        {/* 3-pillar grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
          className="methodology-grid"
        >
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ ...spring, delay: i * 0.1 }}
                style={{
                  background: `linear-gradient(180deg, var(--color-card-high) 0%, var(--color-card) 70%, var(--color-card-low) 100%)`,
                  border: '2px solid var(--color-border)',
                  borderRadius: 20,
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Icon */}
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
                  {pillar.title}
                </h4>

                <p
                  style={{
                    fontSize: 16,
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.4,
                    margin: 0,
                    maxWidth: '50ch',
                  }}
                >
                  {pillar.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
