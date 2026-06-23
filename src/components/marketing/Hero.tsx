import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const spring = {
  duration: 0.8,
  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
}

function ReadinessCard() {
  return (
    <div
      style={{
        background: 'var(--color-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 12px 24px var(--color-shadow)',
        maxWidth: 200,
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '3px solid var(--color-phase-deload)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            flexShrink: 0,
          }}
        >
          87
        </div>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>Readiness Score</span>
      </div>
      <span style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 600 }}>
        Full session today
      </span>
    </div>
  )
}

function PBCard() {
  return (
    <div
      style={{
        background: 'var(--color-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 12px 24px var(--color-shadow)',
        maxWidth: 210,
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>🏆</span>
        <span
          style={{
            color: 'var(--color-brand-orange)',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          New PB
        </span>
      </div>
      <span style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 600 }}>
        Back Squat — 100kg × 5
      </span>
    </div>
  )
}

export function Hero() {
  return (
    <section
      id="main-content"
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        // Top padding must clear both the Dynamic Island/notch safe area
        // and the fixed MarketingNav pill above it (~160px = nav height
        // (56px) + nav top offset (12px) + breathing room (92px)) — a flat
        // px value would let the nav and hero text overlap the Dynamic
        // Island on notched iPhones.
        paddingTop: 'calc(env(safe-area-inset-top) + 160px)',
        paddingRight: 20,
        paddingBottom: 60,
        paddingLeft: 20,
        background: 'radial-gradient(ellipse at center top, var(--color-elevated) 0%, var(--color-bg) 60%)',
      }}
    >
      <div style={{ maxWidth: 1000, width: '100%' }}>

        {/* ── Text block ── */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{ marginBottom: 24 }}
          >
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
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: 'var(--color-text-secondary)',
              }}
            >
              Built for athletes who train with purpose.
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.2 }}
            style={{
              fontSize: 'clamp(40px, 6vw, 64px)',
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: 'var(--color-text-primary)',
              margin: '0 0 20px',
            }}
          >
            BREAK. BUILD. BECOME.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.3 }}
            style={{
              fontSize: 18,
              letterSpacing: '-0.02em',
              lineHeight: 1.4,
              color: 'var(--color-text-secondary)',
              margin: '0 auto 36px',
              maxWidth: 480,
            }}
          >
            Personalised training for HYROX, marathon, triathlon — and every athlete in between.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.4 }}
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            <Link
              to="/sign-up"
              style={{
                background: 'var(--color-brand-orange)',
                color: '#fff',
                borderRadius: 40,
                padding: '12px 28px',
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                textDecoration: 'none',
                boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                display: 'inline-block',
              }}
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              style={{
                background: 'transparent',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 40,
                padding: '12px 28px',
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background 0.2s ease',
              }}
            >
              Sign In
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              fontSize: 14,
              color: 'var(--color-text-muted)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            7-day free trial. No commitment.
          </motion.p>
        </div>

        {/* ── Phone + floating cards composition (desktop) ── */}
        <motion.div
          className="hero-composition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          style={{ marginTop: 56, position: 'relative' }}
        >
          {/* Left card — absolutely positioned on desktop, hidden on mobile */}
          <motion.div
            className="hero-card-l"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 1.1 }}
          >
            <ReadinessCard />
          </motion.div>

          {/* Phone mockup — centered, tilted */}
          <motion.div
            style={{ display: 'flex', justifyContent: 'center' }}
            initial={{ opacity: 0, y: 48, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            <div
              style={{
                transform: 'perspective(1200px) rotateY(-6deg) rotateX(2deg)',
                transformStyle: 'preserve-3d',
                width: 'min(300px, 75vw)',
              }}
            >
              {/* Phone bezel — always dark, simulates physical hardware */}
              <div
                style={{
                  borderRadius: 44,
                  background: '#141414',
                  padding: '10px',
                  boxShadow:
                    '0 0 0 1px #2a2a2a, 0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(255,92,26,0.06)',
                }}
              >
                {/* Screen — overflow hidden for rounded corners only, no aspect-ratio constraint */}
                <div style={{ borderRadius: 34, overflow: 'hidden', background: '#0a0a0a' }}>
                  <img
                    src="/hero-mockup.png"
                    alt="GRYT dashboard showing today's workout, readiness check-in, and weekly schedule"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'unset',
                      objectPosition: 'unset',
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right card — absolutely positioned on desktop, hidden on mobile */}
          <motion.div
            className="hero-card-r"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 1.2 }}
          >
            <PBCard />
          </motion.div>
        </motion.div>

        {/* ── Mobile-only cards — stacked in flow below phone ── */}
        <motion.div
          className="hero-cards-inline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <ReadinessCard />
          <PBCard />
        </motion.div>

      </div>
    </section>
  )
}
