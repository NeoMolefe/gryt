import { Link } from 'react-router-dom'
import { InstagramIcon } from '@/components/icons/InstagramIcon'

export function MarketingFooter() {
  return (
    <footer
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        padding: '80px 0 40px',
      }}
    >
      <div
        className="mkt-inner"
        style={{}}
      >
        {/* Top row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 40,
            marginBottom: 40,
          }}
          className="footer-top"
        >
          {/* Left: wordmark + tagline */}
          <div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: '-0.04em',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: 8,
              }}
            >
              GRYT
            </span>
            <span
              style={{
                fontSize: 14,
                color: 'var(--color-text-secondary)',
                letterSpacing: '-0.02em',
              }}
            >
              BREAK. BUILD. BECOME.
            </span>
          </div>

          {/* Right: links */}
          <nav aria-label="Footer navigation">
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <li>
                <Link
                  to="/privacy-policy"
                  style={{
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    padding: '4px 8px',
                    transition: 'color 0.3s cubic-bezier(0.44,0,0.56,1)',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-primary)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-secondary)')
                  }
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  style={{
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    padding: '4px 8px',
                    transition: 'color 0.3s cubic-bezier(0.44,0,0.56,1)',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-primary)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-secondary)')
                  }
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  style={{
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    padding: '4px 8px',
                    transition: 'color 0.3s cubic-bezier(0.44,0,0.56,1)',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-primary)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-secondary)')
                  }
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@gryt.co.za"
                  style={{
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    padding: '4px 8px',
                    transition: 'color 0.3s cubic-bezier(0.44,0,0.56,1)',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-primary)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-secondary)')
                  }
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/gryt.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GRYT on Instagram (@gryt.app)"
                  style={{
                    background: 'var(--color-elevated)',
                    borderRadius: 100,
                    padding: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease',
                    marginLeft: 4,
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-border)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-elevated)')
                  }
                >
                  <InstagramIcon size={18} />
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'var(--color-border)',
            marginBottom: 24,
          }}
        />

        {/* Bottom: copyright */}
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-text-secondary)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          © 2026 GRYT. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
