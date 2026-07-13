import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, LogOut, Mail, RotateCw, ShieldAlert } from 'lucide-react'
import { InstagramIcon } from '@/components/icons/InstagramIcon'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore, type ThemeMode } from '@/store/themeStore'
import { InjuryUpdateModal } from '@/components/settings/InjuryUpdateModal'
import { RegenerateLimitModal } from '@/components/settings/RegenerateLimitModal'
import { RegeneratePlanModal } from '@/components/settings/RegeneratePlanModal'
import { TrainingDaysModal } from '@/components/settings/TrainingDaysModal'
import { SettingsToggle } from '@/components/settings/SettingsToggle'
import { prefillFromProfile } from '@/lib/onboarding/prefill'
import {
  getNotificationPreferences,
  NOTIFICATION_PREFERENCE_LABELS,
  PREFERENCE_KEY_ORDER,
  setNotificationPreferences,
} from '@/lib/notifications/preferences'
import { isPushSubscribed, subscribeToPush, unsubscribeFromPush } from '@/lib/notifications/pushSubscription'
import {
  currentRegenerateMonth,
  deactivateActivePlans,
  fetchRegenerateRemaining,
  MONTHLY_REGENERATE_LIMIT,
  updateInjuryProfile,
  updateTrainingDays,
} from '@/lib/settings/queries'
import type { InjuryFlag } from '@/types/profile'

const INSTAGRAM_URL = 'https://www.instagram.com/gryt.app'
const CONTACT_EMAIL = 'info@gryt.co.za'

function getNotificationPermission(): NotificationPermission | 'default' {
  return typeof Notification === 'undefined' ? 'default' : Notification.permission
}

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
  const [isRegenerateLimitReached, setIsRegenerateLimitReached] = useState(false)
  const [regenerateRemaining, setRegenerateRemaining] = useState<number | null>(null)
  const [isInjuryOpen, setIsInjuryOpen] = useState(false)
  const [isSavingInjury, setIsSavingInjury] = useState(false)
  const [isTrainingDaysOpen, setIsTrainingDaysOpen] = useState(false)
  const [isSavingTrainingDays, setIsSavingTrainingDays] = useState(false)
  const [isPushEnabled, setIsPushEnabled] = useState(false)

  const themeMode = useThemeStore((s) => s.mode)
  const setThemeMode = useThemeStore((s) => s.setMode)

  const [prefs, setPrefs] = useState(() => (userId ? getNotificationPreferences(userId) : null))

  useEffect(() => {
    if (!userId) return
    void fetchRegenerateRemaining(userId).then(setRegenerateRemaining)
  }, [userId])

  useEffect(() => {
    void isPushSubscribed().then(setIsPushEnabled)
  }, [])

  async function handlePushToggle(value: boolean) {
    if (!userId) return
    if (value) {
      const subscribed = await subscribeToPush(userId)
      setIsPushEnabled(subscribed)
    } else {
      await unsubscribeFromPush()
      setIsPushEnabled(false)
    }
  }

  function handleTogglePreference(key: (typeof PREFERENCE_KEY_ORDER)[number], value: boolean) {
    if (!userId || !prefs) return
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    setNotificationPreferences(userId, next)
  }

  async function handleConfirmRegenerate() {
    if (!userId || !profile) return

    const currentMonth = currentRegenerateMonth()
    const { data: usageData } = await supabase
      .from('regenerate_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .maybeSingle()

    const currentCount = usageData?.count ?? 0

    if (currentCount >= MONTHLY_REGENERATE_LIMIT) {
      setIsRegenerateLimitReached(true)
      setIsRegenerateOpen(false)
      return
    }

    setIsRegenerating(true)
    try {
      const { data: currentPlan } = await supabase
        .from('plans')
        .select('archetype')
        .eq('user_id', userId)
        .eq('active', true)
        .maybeSingle()

      const fromArchetype = currentPlan?.archetype ?? null

      // deactivateActivePlans is the actual point of commitment here — the
      // new plan itself is created later, in Onboarding.tsx's own submit
      // flow, once the user finishes re-running onboarding. Spending the
      // regeneration credit at this step (not at that later submit) matches
      // product intent: once their active plan is deactivated, they've used
      // this month's attempt regardless of whether they complete onboarding.
      await deactivateActivePlans(userId)
      await supabase
        .from('regenerate_usage')
        .upsert(
          {
            user_id: userId,
            month: currentMonth,
            count: currentCount + 1,
            from_archetype: fromArchetype,
            regenerated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,month' },
        )
      setRegenerateRemaining(Math.max(0, MONTHLY_REGENERATE_LIMIT - (currentCount + 1)))
      navigate('/onboarding', { state: { prefill: prefillFromProfile(profile), isRegeneration: true } })
    } finally {
      setIsRegenerating(false)
      setIsRegenerateOpen(false)
    }
  }

  async function handleSaveTrainingDays(indices: number[]) {
    if (!userId) return
    setIsSavingTrainingDays(true)
    try {
      await updateTrainingDays(userId, indices)
      await refreshProfile()
      setIsTrainingDaysOpen(false)
    } finally {
      setIsSavingTrainingDays(false)
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
      className="min-h-svh px-6 py-6 pb-[calc(64px_+_env(safe-area-inset-bottom))]"
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
              <span className="flex items-center gap-2">
                {regenerateRemaining !== null && (
                  <span
                    className={`text-xs ${
                      regenerateRemaining <= 0 ? 'text-brand-orange' : 'text-text-secondary'
                    }`}
                  >
                    {regenerateRemaining} of {MONTHLY_REGENERATE_LIMIT} remaining
                  </span>
                )}
                <ChevronRight size={18} className="text-text-secondary" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsTrainingDaysOpen(true)}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-elevated px-4 py-3 text-left"
            >
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <RotateCw size={18} className="text-text-secondary" />
                Update Training Days
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
                <Fragment key={key}>
                  <SettingsToggle
                    label={NOTIFICATION_PREFERENCE_LABELS[key]}
                    checked={prefs[key]}
                    onChange={(value) => handleTogglePreference(key, value)}
                  />
                  {key === 'daily_workout_reminder' && (
                    <>
                      <SettingsToggle
                        label="Push Notifications"
                        description="Workout reminders and milestone alerts"
                        checked={isPushEnabled}
                        onChange={(value) => void handlePushToggle(value)}
                        disabled={getNotificationPermission() === 'denied'}
                      />
                      {getNotificationPermission() === 'denied' && (
                        <p className="px-1 text-xs text-text-muted">
                          Notifications blocked. Enable in your phone&apos;s Settings → Safari → GRYT.
                        </p>
                      )}
                    </>
                  )}
                </Fragment>
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

        {userId === 'e99714c7-763c-4179-9b5c-a4e259e19abb' && (
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={() => navigate('/admin')}
              style={{
                width: '100%',
                background: 'rgba(255,92,26,0.08)',
                border: '1px solid rgba(255,92,26,0.25)',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                color: '#FF5C1A',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>⚙️</span>
                <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.02em' }}>
                  Admin Portal
                </span>
              </div>
              <span style={{ fontSize: 18, opacity: 0.6 }}>›</span>
            </button>
          </div>
        )}
      </div>

      <RegeneratePlanModal
        isOpen={isRegenerateOpen}
        isRegenerating={isRegenerating}
        onConfirm={() => void handleConfirmRegenerate()}
        onCancel={() => setIsRegenerateOpen(false)}
      />

      <RegenerateLimitModal
        isOpen={isRegenerateLimitReached}
        onClose={() => setIsRegenerateLimitReached(false)}
      />

      <TrainingDaysModal
        isOpen={isTrainingDaysOpen}
        initialIndices={profile?.training_day_indices ?? []}
        isSaving={isSavingTrainingDays}
        onClose={() => setIsTrainingDaysOpen(false)}
        onSave={(indices) => void handleSaveTrainingDays(indices)}
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
