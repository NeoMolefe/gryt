export type ProgressTabId = 'history' | 'nutrition' | 'badges' | 'analytics'

const TABS: { id: ProgressTabId; label: string }[] = [
  { id: 'history', label: 'History' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'badges', label: 'Badges' },
  { id: 'analytics', label: 'Analytics' },
]

interface ProgressTabsProps {
  active: ProgressTabId
  onChange: (tab: ProgressTabId) => void
}

export function ProgressTabs({ active, onChange }: ProgressTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
            active === tab.id ? 'bg-brand-orange text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
