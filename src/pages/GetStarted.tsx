import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Activity, TrendingUp, Trophy } from 'lucide-react'
import { Button } from '@/components/Button'
import { useAuthStore } from '@/store/authStore'

const ONBOARDING_STEPS = [
  { icon: Sparkles, label: 'Tell us about your training background and goals' },
  { icon: Activity, label: 'Set your availability and equipment access' },
  { icon: TrendingUp, label: 'Kwazi builds your phase-based programme' },
  { icon: Trophy, label: 'Start training and tracking personal bests' },
]

export function GetStarted() {
  const navigate = useNavigate()
  const signOut = useAuthStore((state) => state.signOut)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-svh flex-col justify-between px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2 text-center pt-12">
          <h1 className="text-2xl font-bold text-text-primary">
            You&apos;re in. Let&apos;s build your programme.
          </h1>
        </div>

        <ul className="flex flex-col gap-4 py-4">
          {ONBOARDING_STEPS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-elevated text-brand-orange">
                <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span className="text-sm text-text-secondary">{label}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="flex flex-col items-center gap-4 pb-4">
        <Link to="/onboarding" className="w-full">
          <Button>Build My Programme</Button>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
