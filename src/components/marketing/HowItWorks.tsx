import { motion } from 'framer-motion'
import { Target, LayoutGrid, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Step {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: '01',
    icon: Target,
    title: 'Tell us your goal',
    description:
      'A 90-second setup. Tap your way through — no dropdowns, no clutter.',
  },
  {
    number: '02',
    icon: LayoutGrid,
    title: 'Get your programme',
    description:
      'A plan built around your equipment, your schedule, and your goal — generated in seconds.',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Train, log, adapt',
    description:
      'Log every set. Kwazi and your readiness data adjust the plan as you go.',
  },
]

export function HowItWorks() {
  return (
    <section style={{ padding: '100px 0', background: 'var(--color-bg)' }}>
      <div className="mkt-inner">
        {/* Section tag */}
        <div style={{ marginBottom: 16 }}>
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
            How it works
          </span>
        </div>

        {/* Two-col layout: sticky left + scrolling right */}
        <div
          className="how-it-works-layout"
          style={{
            display: 'flex',
            gap: 80,
            alignItems: 'flex-start',
          }}
        >
          {/* Sticky left column — position/top/alignSelf handled by .how-it-works-sticky CSS class */}
          <div
            className="how-it-works-sticky"
            style={{ flex: '0 0 38%' }}
          >
            <h2
              style={{
                fontSize: 'clamp(34px, 3.5vw, 48px)',
                fontWeight: 500,
                letterSpacing: '-0.05em',
                lineHeight: 1.2,
                color: 'var(--color-text-primary)',
                margin: '0 0 20px',
              }}
            >
              From onboarding to your first PB.
            </h2>
            <p
              style={{
                fontSize: 18,
                color: 'var(--color-text-secondary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.4,
                margin: 0,
                maxWidth: '50ch',
              }}
            >
              Three steps. That's all it takes to go from zero to training with
              a programme that actually adapts to you.
            </p>
          </div>

          {/* Right column: scrolling step cards */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: 'easeOut',
                  }}
                  style={{
                    background: `linear-gradient(314deg, var(--color-elevated) 0%, var(--color-card) 100%)`,
                    border: '2px solid var(--color-border)',
                    borderRadius: 24,
                    padding: 32,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0px 8px 30px var(--color-shadow)',
                  }}
                >
                  {/* Step number badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 24,
                      right: 24,
                      background: 'var(--color-elevated)',
                      borderRadius: 40,
                      padding: '2px 8px',
                      fontSize: 13,
                      color: 'var(--color-text-muted)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div
                    style={{
                      background: 'rgba(255,92,26,0.15)',
                      borderRadius: 40,
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                    }}
                  >
                    <Icon size={20} strokeWidth={1.5} color="#FF5C1A" aria-hidden="true" />
                  </div>

                  <h4
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.3,
                      color: 'var(--color-text-primary)',
                      margin: '0 0 10px',
                    }}
                  >
                    {step.title}
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
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
