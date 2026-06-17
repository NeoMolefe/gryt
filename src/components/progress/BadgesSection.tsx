import { useState } from 'react'
import { BadgeCard } from '@/components/progress/BadgeCard'
import { BadgeDetailSheet } from '@/components/progress/BadgeDetailSheet'
import type { BadgeStatus } from '@/types/progress.types'

interface BadgesSectionProps {
  badges: BadgeStatus[]
}

export function BadgesSection({ badges }: BadgesSectionProps) {
  const [selected, setSelected] = useState<BadgeStatus | null>(null)

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} onSelect={setSelected} />
        ))}
      </div>

      <BadgeDetailSheet badge={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
