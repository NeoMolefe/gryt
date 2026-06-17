import { Button } from '@/components/Button'
import {
  equipmentLabel,
  eventTypeLabel,
  experienceLabel,
  genderLabel,
  primaryGoalLabel,
  secondaryGoalLabel,
  sessionDurationLabel,
  trainingStyleLabel,
} from '@/lib/onboarding/options'
import type { OnboardingData, StepId } from '@/types/onboarding'

interface StepSummaryProps {
  data: OnboardingData
  onEdit: (step: StepId) => void
  blockReason: string | null
}

interface SummaryRowProps {
  label: string
  value: string
  onEdit: () => void
}

function SummaryRow({ label, value, onEdit }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-text-muted">
          {label}
        </span>
        <span className="text-sm text-text-primary">{value}</span>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-sm font-medium text-brand-orange"
      >
        Edit
      </button>
    </div>
  )
}

export function StepSummary({ data, onEdit, blockReason }: StepSummaryProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Review your answers
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Make sure everything looks right before we build your programme.
        </p>
      </div>

      <div className="flex flex-col">
        <SummaryRow
          label="Personal details"
          value={`${data.firstName}, ${data.age} years, ${data.heightCm}cm, ${data.weightKg}kg, ${genderLabel(data.gender)}`}
          onEdit={() => onEdit('personal')}
        />
        <SummaryRow
          label="Experience"
          value={experienceLabel(data.experience)}
          onEdit={() => onEdit('experience')}
        />
        <SummaryRow
          label="Primary goal"
          value={primaryGoalLabel(data.primaryGoal)}
          onEdit={() => onEdit('primaryGoal')}
        />
        <SummaryRow
          label="Secondary goals"
          value={
            data.secondaryGoals.length > 0
              ? data.secondaryGoals.map(secondaryGoalLabel).join(', ')
              : 'None'
          }
          onEdit={() => onEdit('secondaryGoals')}
        />
        <SummaryRow
          label="Availability"
          value={`${data.availabilityDays ?? '—'} days/week, ${sessionDurationLabel(data.sessionDuration)} sessions`}
          onEdit={() => onEdit('availability')}
        />
        <SummaryRow
          label="Equipment"
          value={equipmentLabel(data.equipment)}
          onEdit={() => onEdit('equipment')}
        />
        <SummaryRow
          label="Training style"
          value={
            data.trainingStyle.length > 0
              ? data.trainingStyle.map(trainingStyleLabel).join(', ')
              : '—'
          }
          onEdit={() => onEdit('trainingStyle')}
        />
        <SummaryRow
          label="Injury history"
          value={data.injuryHistory.trim() || 'None reported'}
          onEdit={() => onEdit('injuryHistory')}
        />
        {data.primaryGoal === 'event_specific' && (
          <SummaryRow
            label="Event"
            value={eventTypeLabel(data.eventType)}
            onEdit={() => onEdit('eventType')}
          />
        )}
        {data.primaryGoal === 'event_specific' && data.eventDate && (
          <SummaryRow
            label="Event date"
            value={new Date(data.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            onEdit={() => onEdit('eventType')}
          />
        )}
        {data.primaryGoal === 'event_specific' && data.goalTimeMinutes !== null && (
          <SummaryRow
            label="Goal time"
            value={`${Math.floor(data.goalTimeMinutes / 60)}h ${data.goalTimeMinutes % 60}min`}
            onEdit={() => onEdit('eventType')}
          />
        )}
      </div>

      {blockReason && (
        <div className="flex flex-col gap-3 rounded-xl border border-phase-peak bg-phase-peak/10 p-4">
          <p className="text-sm text-phase-peak">{blockReason}</p>
          <Button variant="outline" onClick={() => onEdit('availability')}>
            Update Availability
          </Button>
        </div>
      )}
    </div>
  )
}
