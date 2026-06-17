import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, LogOut, Mail, RotateCw, ShieldAlert } from 'lucide-react'
import { InstagramIcon } from '@/components/icons/InstagramIcon'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore, type ThemeMode } from '@/store/themeStore'
import { InjuryUpdateModal } from '@/components/settings/InjuryUpdateModal'
import { RegeneratePlanModal } from '@/components/settings/RegeneratePlanModal'
import { SettingsToggle } from '@/components/settings/SettingsToggle'
import { prefillFromProfile } from '@/lib/onboarding/prefill'
import {
  getNotificationPreferences,
  NOTIFICATION_PREFERENCE_LABELS,
  PREFERENCE_KEY_ORDER,
  setNotificationPreferences,
} from '@/lib/notifications/preferences'
import { deactivateActivePlans, updateInjuryProfile } from '@/lib/settings/queries'
import type { InjuryFlag } from '@/types/profile'

const INSTAGRAM_URL = 'https://www.instagram.com/gryt.app'
const CONTACT_EMAIL = 'info@gryt.co.za'

function buildInjuryMessage(injuryHistory: string, flags: InjuryFlag[]): string {
  if (flags.length === 0) {
    return `I just updated my injury info: ${injuryHistory || 'no specific details provided'}. Can you help me adjust my training?`
  }

  const areas = flags.map((f) => `${f.bodyArea} (${f.severity})`).join(', ')
  return `I just updated my injury info — ${areas}. ${injuryHistory ? `Details: ${injuryHistory}. ` : ''}Can you help me adjust my training around this?`
}

function SectionHeading({ children }: { children: string }) {
  return <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">{children}</h2>
}

export function Settings() {
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const profile = useAuthStore((state) => state.profile)
  const refreshProfile = useAuthStore((state) => state.refreshProfile)
  const signOut = useAuthStore((state) => state.signOut)
  const userId = session?.user.id ?? null

  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isInjuryOpen, setIsInjuryOpen] = useState(false)
  const [isSavingInjury, setIsSavingInjury] = useState(false)

  const themeMode = useThemeStore((s) => s.mode)
  const setThemeMode = useThemeStore((s) => s.setMode)

  const [prefs, setPrefs] = useState(() => (userId ? getNotificationPreferences(userId) : null))

  function handleTogglePreference(key: (typeof PREFERENCE_KEY_ORDER)[number], value: boolean) {
    if (!userId || !prefs) return
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    setNotificationPreferences(userId, next)
  }

  async function handleConfirmRegenerate() {
    if (!userId || !profile) return
    setIsRegenerating(true)
    try {
      await deactivateActivePlans(userId)
      navigate('/onboarding', { state: { prefill: prefillFromProfile(profile), isRegeneration: true } })
    } finally {
      setIsRegenerating(false)
      setIsRegenerateOpen(false)
    }
  }

  async function handleSaveInjury(text: string, flags: InjuryFlag[]) {
    if (!userId) return
    setIsSavingInjury(true)
    try {
      await updateInjuryProfile(userId, text, flags)
      await refreshProfile()
      setIsInjuryOpen(false)
      navigate('/kwazi', { state: { injuryMessage: buildInjuryMessage(text, flags) } })
    } finally {
      setIsSavingInjury(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="min-h-svh px-6 py-6 pb-24"
    >
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

        <section>
          <SectionHeading>Programme</SectionHeading>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsRegenerateOpen(true)}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-elevated px-4 py-3 text-left"
            >
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <RotateCw size={18} className="text-text-secondary" />
                Regenerate Plan
              </span>
              <ChevronRight size={18} className="text-text-secondary" />
            </button>

            <button
              type="button"
              onClick={() => setIsInjuryOpen(true)}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-elevated px-4 py-3 text-left"
            >
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <ShieldAlert size={18} className="text-text-secondary" />
                Update Injury or Limitation
              </span>
              <ChevronRight size={18} className="text-text-secondary" />
            </button>
          </div>
        </section>

        <section>
          <SectionHeading>Support</SectionHeading>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex w-full items-center justify-between gap-3 rounded-xl bg-elevated px-4 py-3 text-left"
          >
            <span className="flex items-center gap-3 text-sm text-text-primary">
              <Mail size={18} className="text-text-secondary" />
              Contact Us
            </span>
            <ChevronRight size={18} className="text-text-secondary" />
          </a>
        </section>

        <section>
          <SectionHeading>Appearance</SectionHeading>
          <div className="rounded-xl bg-elevated px-4 py-4">
            <p className="mb-1 text-sm font-medium text-text-primary">Theme</p>
            <p className="mb-3 text-xs text-text-secondary">Choose how GRYT looks, or match your device settings.</p>
            <div className="flex gap-1 rounded-full border border-border bg-card p-1">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setThemeMode(m)}
                  aria-pressed={themeMode === m}
                  className={`flex-1 rounded-full py-2 text-sm font-medium capitalize transition-colors duration-150 ${
                    themeMode === m
                      ? 'bg-brand-orange text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeading>Notifications</SectionHeading>
          <div className="space-y-2">
            {prefs &&
              PREFERENCE_KEY_ORDER.map((key) => (
                <SettingsToggle
                  key={key}
                  label={NOTIFICATION_PREFERENCE_LABELS[key]}
                  checked={prefs[key]}
                  onChange={(value) => handleTogglePreference(key, value)}
                />
              ))}
          </div>
        </section>

        <section>
          <SectionHeading>Connect</SectionHeading>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-between gap-3 rounded-xl bg-elevated px-4 py-3 text-left"
          >
            <span className="flex items-center gap-3 text-sm text-text-primary">
              <InstagramIcon size={18} className="text-text-secondary" />
              @gryt.app
            </span>
            <ChevronRight size={18} className="text-text-secondary" />
          </a>
        </section>

        <section>
          <SectionHeading>Account</SectionHeading>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-3 rounded-xl bg-elevated px-4 py-3 text-left text-sm text-phase-peak"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </section>
      </div>

      <RegeneratePlanModal
        isOpen={isRegenerateOpen}
        isRegenerating={isRegenerating}
        onConfirm={() => void handleConfirmRegenerate()}
        onCancel={() => setIsRegenerateOpen(false)}
      />

      <InjuryUpdateModal
        key={isInjuryOpen ? 'open' : 'closed'}
        isOpen={isInjuryOpen}
        initialText={profile?.injury_history ?? ''}
        initialFlags={profile?.injury_flags ?? []}
        isSaving={isSavingInjury}
        onClose={() => setIsInjuryOpen(false)}
        onSave={(text, flags) => void handleSaveInjury(text, flags)}
      />
    </motion.div>
  )
}
