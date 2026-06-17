import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="marketing-nav"
      style={{
        background: 'var(--color-card)',
        borderRadius: 100,
        border: '1px solid var(--color-border)',
        boxShadow: scrolled
          ? '0px 10px 30px var(--color-shadow)'
          : '0px 10px 20px var(--color-shadow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 12px 12px 20px',
        transition: 'box-shadow 0.3s ease',
        gap: 12,
      }}
      aria-label="Main navigation"
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: '-0.04em',
          color: 'var(--color-text-primary)',
          userSelect: 'none',
        }}
      >
        GRYT
      </span>

      <Link
        to="/sign-up"
        style={{
          background: '#FF5C1A',
          color: '#fff',
          borderRadius: 40,
          padding: '10px 20px',
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          textDecoration: 'none',
          boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
          display: 'inline-block',
          whiteSpace: 'nowrap',
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        }}
      >
        Get Started
      </Link>
    </nav>
  )
}
