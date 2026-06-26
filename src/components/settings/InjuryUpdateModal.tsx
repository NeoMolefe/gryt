import { useState } from 'react'
import { BottomSheet } from '@/components/dashboard/BottomSheet'
import { Button } from '@/components/Button'
import { BODY_AREAS, INJURY_SEVERITIES } from '@/lib/injuries/bodyAreas'
import type { InjuryBodyArea, InjuryFlag, InjurySeverity } from '@/types/profile'

interface InjuryUpdateModalProps {
  isOpen: boolean
  initialText: string
  initialFlags: InjuryFlag[]
  isSaving: boolean
  onClose: () => void
  onSave: (text: string, flags: InjuryFlag[]) => void
}

export function InjuryUpdateModal({ isOpen, initialText, initialFlags, isSaving, onClose, onSave }: InjuryUpdateModalProps) {
  const [text, setText] = useState(initialText)
  const [selectedAreas, setSelectedAreas] = useState<InjuryBodyArea[]>(initialFlags.map((f) => f.bodyArea))
  const [severity, setSeverity] = useState<InjurySeverity>(initialFlags[0]?.severity ?? 'Mild')

  function toggleArea(area: InjuryBodyArea) {
    setSelectedAreas((current) =>
      current.includes(area) ? current.filter((a) => a !== area) : [...current, area],
    )
  }

  function handleSave() {
    const flags: InjuryFlag[] = selectedAreas.map((bodyArea) => ({ bodyArea, severity }))
    onSave(text, flags)
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Update Injury or Limitation">
      <div className="space-y-5">
        <div>
          <label htmlFor="injury-text" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Describe your injury or limitation
          </label>
          <textarea
            id="injury-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            spellCheck={true}
            autoCorrect="on"
            autoCapitalize="sentences"
            className="w-full rounded-xl border border-border bg-elevated p-3 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
            placeholder="e.g. Tweaked my lower back deadlifting last week"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Affected area</p>
          <div className="flex flex-wrap gap-2">
            {BODY_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
                  selectedAreas.includes(area)
                    ? 'border-brand-orange bg-brand-orange/15 text-brand-orange'
                    : 'border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Severity</p>
          <div className="flex flex-wrap gap-2">
            {INJURY_SEVERITIES.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSeverity(level)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
                  severity === level
                    ? 'border-brand-orange bg-brand-orange/15 text-brand-orange'
                    : 'border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} isLoading={isSaving}>
          Save
        </Button>
      </div>
    </BottomSheet>
  )
}
