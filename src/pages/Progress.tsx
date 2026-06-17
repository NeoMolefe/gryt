import { useState } from 'react'
import { motion } from 'framer-motion'
import { AnalyticsSection } from '@/components/progress/AnalyticsSection'
import { BadgeUnlockModal } from '@/components/progress/BadgeUnlockModal'
import { BadgesSection } from '@/components/progress/BadgesSection'
import { HistorySection } from '@/components/progress/HistorySection'
import { NutritionSection } from '@/components/progress/NutritionSection'
import { ProgressTabs, type ProgressTabId } from '@/components/progress/ProgressTabs'
import { useProgressData } from '@/hooks/useProgressData'

export function Progress() {
  const { isLoading, profile, plan, sessionHistory, badges, newlyEarnedBadges, dismissNewBadge, analytics } = useProgressData()
  const [activeTab, setActiveTab] = useState<ProgressTabId>('history')

  if (isLoading || !plan) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-text-secondary">Loading your progress...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="min-h-svh px-6 py-6 pb-24"
    >
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <h1 className="text-2xl font-bold text-text-primary">Progress</h1>

        <ProgressTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'history' && <HistorySection entries={sessionHistory} />}
        {activeTab === 'nutrition' && <NutritionSection plan={plan} primaryGoal={profile?.primary_goal} />}
        {activeTab === 'badges' && <BadgesSection badges={badges} />}
        {activeTab === 'analytics' && (
          <AnalyticsSection
            readiness={analytics.readiness}
            trainingLoad={analytics.trainingLoad}
            heatmap={analytics.heatmap}
            profile={analytics.profile}
          />
        )}
      </div>

      <BadgeUnlockModal badge={newlyEarnedBadges[0] ?? null} onDismiss={dismissNewBadge} />
    </motion.div>
  )
}
