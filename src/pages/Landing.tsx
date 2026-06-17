import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { Hero } from '@/components/marketing/Hero'
import { Features } from '@/components/marketing/Features'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { Methodology } from '@/components/marketing/Methodology'
import { PricingCard } from '@/components/marketing/PricingCard'
import { FAQ } from '@/components/marketing/FAQ'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export function Landing() {
  const navigate = useNavigate()
  const isInitialised = useAuthStore((state) => state.isInitialised)
  const session = useAuthStore((state) => state.session)
  const profile = useAuthStore((state) => state.profile)

  const isAuthenticated = isInitialised && Boolean(session)
  const isOnboarded = Boolean(profile?.onboarding_completed)
  // Break out of the mobile app shell max-width for the marketing page
  useEffect(() => {
    const root = document.getElementById('root')
    root?.classList.add('marketing')
    return () => root?.classList.remove('marketing')
  }, [])

  // Redirect authenticated users to their destination
  useEffect(() => {
    if (!isInitialised) return
    if (isAuthenticated) {
      void navigate(isOnboarded ? '/dashboard' : '/get-started', { replace: true })
    }
  }, [isInitialised, isAuthenticated, isOnboarded, navigate])

  // While auth is resolving, render nothing (avoids flash of marketing page for logged-in users)
  if (!isInitialised) return null

  // Authenticated users are being redirected — don't flash the page
  if (isAuthenticated) return null

  return (
    <div className="marketing-page">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <MarketingNav />
      <Hero />
      <Features />
      <HowItWorks />
      <Methodology />
      <PricingCard />
      <FAQ />
      <MarketingFooter />
    </div>
  )
}
