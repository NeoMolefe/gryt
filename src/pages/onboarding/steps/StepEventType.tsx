import { useState } from 'react'
import { Chip } from '@/components/onboarding/Chip'
import { EVENT_TYPE_OPTIONS } from '@/lib/onboarding/options'
import type { EventType } from '@/types/onboarding'
import type { StepProps } from '../types'

const GOAL_TIME_LABEL: Partial<Record<EventType, string>> = {
  hyrox: "What's your goal HYROX time?",
  triathlon: "What's your goal triathlon time?",
  cycling: "What's your goal ride time?",
}

const IMPLAUSIBLE_MINIMUMS: Partial<Record<EventType, number>> = {
  marathon: 110,
  half_marathon: 50,
  race_5k: 11,
  race_10k: 22,
  race_15k: 33,
  hyrox: 40,
  triathlon: 60,
  cycling: 20,
}

function getTomorrowStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function StepEventType({ data, updateData, errors }: StepProps) {
  const [goalHours, setGoalHours] = useState<string>(() => {
    if (data.goalTimeMinutes === null) return ''
    return String(Math.floor(data.goalTimeMinutes / 60))
  })
  const [goalMins, setGoalMins] = useState<string>(() => {
    if (data.goalTimeMinutes === null) return ''
    return String(data.goalTimeMinutes % 60)
  })

  function handleGoalTimeChange(hours: string, mins: string) {
    const h = parseInt(hours) || 0
    const m = parseInt(mins) || 0
    const total = h * 60 + m
    updateData('goalTimeMinutes', total > 0 ? total : null)
  }

  function handleSkipGoalTime() {
    setGoalHours('')
    setGoalMins('')
    updateData('goalTimeMinutes', null)
  }

  const goalTimeLabel = data.eventType
    ? (GOAL_TIME_LABEL[data.eventType] ?? "What's your goal finish time?")
    : "What's your goal finish time?"

  const showImplausibleWarning =
    data.eventType &&
    data.goalTimeMinutes !== null &&
    data.goalTimeMinutes > 0 &&
    IMPLAUSIBLE_MINIMUMS[data.eventType] !== undefined &&
    data.goalTimeMinutes < (IMPLAUSIBLE_MINIMUMS[data.eventType] ?? 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          What are you training for?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          We&apos;ll build your programme around your specific event.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EVENT_TYPE_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={data.eventType === option.value}
            onClick={() => updateData('eventType', option.value)}
          />
        ))}
      </div>
      {errors.eventType && (
        <p className="text-sm text-phase-peak">{errors.eventType}</p>
      )}

      {data.eventType === 'triathlon' && (
        <p className="rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-text-secondary">
          GRYT covers your run and bike training blocks. Swim sessions are
          self-programmed.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="event-date" className="text-sm font-medium text-text-primary">
          When is your event?
        </label>
        <input
          id="event-date"
          type="date"
          min={getTomorrowStr()}
          value={data.eventDate ?? ''}
          onChange={(e) => updateData('eventDate', e.target.value || null)}
          className="w-full rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-text-primary focus:border-brand-orange focus:outline-none"
        />
        {errors.eventDate && (
          <p className="text-sm text-phase-peak">{errors.eventDate}</p>
        )}
      </div>

      {data.eventType && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-primary">{goalTimeLabel}</label>
          <div className="flex items-center gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-text-muted">Hours</span>
              <input
                type="number"
                min="0"
                max="23"
                placeholder="0"
                value={goalHours}
                onChange={(e) => {
                  setGoalHours(e.target.value)
                  handleGoalTimeChange(e.target.value, goalMins)
                }}
                className="w-full rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-text-primary focus:border-brand-orange focus:outline-none"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-text-muted">Minutes</span>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={goalMins}
                onChange={(e) => {
                  setGoalMins(e.target.value)
                  handleGoalTimeChange(goalHours, e.target.value)
                }}
                className="w-full rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-text-primary focus:border-brand-orange focus:outline-none"
              />
            </div>
          </div>
          {showImplausibleWarning && (
            <p className="text-sm text-amber-500">
              That seems fast for a {data.eventType.replace('_', ' ')} — double check the hours/minutes.
            </p>
          )}
          <button
            type="button"
            onClick={handleSkipGoalTime}
            className="mt-1 text-left text-sm text-text-muted underline"
          >
            Skip — I don&apos;t have a goal time yet
          </button>
        </div>
      )}
    </div>
  )
}
