import type { ReactNode } from 'react'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

interface LegalPageProps {
  title: string
  lastUpdated: string
  children: ReactNode
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div
      className="marketing-page"
      style={{
        minHeight: '100svh',
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
      }}
    >
      <MarketingNav />

      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '120px 24px 80px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
            marginBottom: 8,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-text-muted)',
            marginBottom: 48,
          }}
        >
          Last updated: {lastUpdated}
        </p>

        <div
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
          }}
        >
          {children}
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: 12,
          letterSpacing: '-0.02em',
        }}
      >
        {heading}
      </h2>
      <div>{children}</div>
    </section>
  )
}
