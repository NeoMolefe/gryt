import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TutorialStep {
  targetId: string
  title: string
  description: string
}

const STEPS: TutorialStep[] = [
  {
    targetId: 'tutorial-readiness-checkin',
    title: 'Daily Check-In',
    description:
      'Tap here each morning to log how you feel. This shapes whether today is a full session or a lighter one.',
  },
  {
    targetId: 'tutorial-todays-workout',
    title: "Today's Session",
    description: "Your plan adapts to your schedule. Tap Start Workout when you're ready to begin.",
  },
  {
    targetId: 'tutorial-weekly-strip',
    title: 'Your Week',
    description: "See what's coming up. Tap any day to preview that session.",
  },
  {
    targetId: 'tutorial-stats-row',
    title: 'Track Your Progress',
    description: 'Your training phase, streak, and XP — all update automatically as you train.',
  },
  {
    targetId: 'tutorial-bottom-nav',
    title: 'Get Around',
    description:
      'Workouts, Progress, Kwazi (your AI coach), and Settings are always one tap away.',
  },
]

const PAD = 8 // padding around the spotlight cutout
const TOOLTIP_H_APPROX = 140 // approximate tooltip height for positioning
const TOOLTIP_GAP = 12 // gap between cutout edge and tooltip

interface Props {
  userId: string
  onDone: () => void
}

interface CutoutRect {
  x: number
  y: number
  w: number
  h: number
}

function measureElement(targetId: string): CutoutRect | null {
  const el = document.getElementById(targetId)
  if (!el) return null
  const b = el.getBoundingClientRect()
  return { x: b.left - PAD, y: b.top - PAD, w: b.width + PAD * 2, h: b.height + PAD * 2 }
}

// Returns the index of the first step at or after `from` whose DOM element exists,
// or null if none remain.
function findNextValid(from: number): number | null {
  for (let i = from; i < STEPS.length; i++) {
    if (document.getElementById(STEPS[i].targetId)) return i
  }
  return null
}

export function TutorialOverlay({ userId, onDone }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [cutout, setCutout] = useState<CutoutRect | null>(null)
  const [vpW, setVpW] = useState(window.innerWidth)
  const [vpH, setVpH] = useState(window.innerHeight)

  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- mark seen ---------------------------------------------------------

  const markSeen = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ has_seen_dashboard_tutorial: true })
      .eq('id', userId)
      .select('id, has_seen_dashboard_tutorial')

    console.log('[TutorialOverlay] mark-seen result:', { data, error })
    if (error) {
      console.error('[TutorialOverlay] failed to persist tutorial-seen flag:', error.message)
    }

    onDone()
  }, [userId, onDone])

  // Use a ref so goToStep (which has empty deps) always calls the latest markSeen.
  const markSeenRef = useRef(markSeen)
  markSeenRef.current = markSeen

  // --- navigation --------------------------------------------------------

  // Activates the first valid step at or after `from`.
  // Scrolls the element into view, waits for scroll to settle, then measures.
  const goToStep = useCallback((from: number) => {
    const idx = findNextValid(from)
    if (idx === null) {
      void markSeenRef.current()
      return
    }

    setStepIndex(idx)

    const el = document.getElementById(STEPS[idx].targetId)!
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = setTimeout(() => {
      setCutout(measureElement(STEPS[idx].targetId))
    }, 400)
  }, []) // stable — uses refs for external deps

  // Keep a ref so the mount effect always calls the latest goToStep.
  const goToStepRef = useRef(goToStep)
  goToStepRef.current = goToStep

  // --- lifecycle ---------------------------------------------------------

  // Initialise on mount (small delay lets Dashboard finish its own layout).
  useEffect(() => {
    const timer = setTimeout(() => goToStepRef.current(0), 120)
    return () => clearTimeout(timer)
  }, [])

  // Recalculate cutout and viewport size on resize.
  useEffect(() => {
    function handleResize() {
      setVpW(window.innerWidth)
      setVpH(window.innerHeight)
      setCutout(measureElement(STEPS[stepIndex].targetId))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [stepIndex])

  // Clean up any pending scroll timer on unmount.
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [])

  // --- render ------------------------------------------------------------

  if (!cutout) return null

  const step = STEPS[stepIndex]!
  const isLastStep = findNextValid(stepIndex + 1) === null

  function handleNext() {
    if (isLastStep) {
      void markSeen()
    } else {
      goToStep(stepIndex + 1)
    }
  }

  // Tooltip width: max 280 px, but never exceed viewport minus 32 px padding.
  const tooltipW = Math.min(280, vpW - 32)

  // Position tooltip below target when it's in the top half of the screen,
  // above it when in the bottom half. Clamp both axes to stay on screen.
  const targetMidY = cutout.y + cutout.h / 2
  const isTopHalf = targetMidY < vpH / 2

  let tooltipTop = isTopHalf
    ? cutout.y + cutout.h + TOOLTIP_GAP
    : cutout.y - TOOLTIP_H_APPROX - TOOLTIP_GAP

  tooltipTop = Math.max(16, Math.min(tooltipTop, vpH - TOOLTIP_H_APPROX - 16))

  let tooltipLeft = cutout.x + cutout.w / 2 - tooltipW / 2
  tooltipLeft = Math.max(16, Math.min(tooltipLeft, vpW - tooltipW - 16))

  return (
    // Outer div covers the full viewport and captures all pointer events,
    // preventing accidental taps from reaching the Dashboard behind it.
    // The tooltip div stops propagation so its own interactions still work.
    <div className="fixed inset-0 z-50 select-none">
      {/* SVG spotlight: dark overlay with a transparent cutout at the target */}
      <svg
        width={vpW}
        height={vpH}
        style={{ position: 'absolute', inset: 0, display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          <mask id="tutorial-spotlight-mask">
            {/* White = show overlay colour; black = transparent (the "hole") */}
            <rect width={vpW} height={vpH} fill="white" />
            <rect x={cutout.x} y={cutout.y} width={cutout.w} height={cutout.h} fill="black" rx={12} />
          </mask>
        </defs>

        {/* Dark backdrop with hole */}
        <rect
          width={vpW}
          height={vpH}
          fill="rgba(0,0,0,0.75)"
          mask="url(#tutorial-spotlight-mask)"
        />

        {/* Highlight ring around the target element */}
        <rect
          x={cutout.x}
          y={cutout.y}
          width={cutout.w}
          height={cutout.h}
          fill="none"
          stroke="var(--color-brand-orange)"
          strokeWidth={2}
          rx={12}
        />
      </svg>

      {/* Tooltip card */}
      <div
        className="absolute rounded-2xl border border-border p-4 shadow-xl"
        style={{
          background: 'var(--color-card)',
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipW,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-1 text-sm font-semibold text-text-primary">{step.title}</p>
        <p className="mb-4 text-xs leading-relaxed text-text-secondary">{step.description}</p>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="shrink-0 text-xs text-text-secondary transition-colors hover:text-text-primary"
            onClick={() => void markSeen()}
          >
            Skip
          </button>

          {/* Step progress dots — filled for current and previous steps */}
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className="block h-1.5 w-1.5 rounded-full transition-colors"
                style={{
                  background:
                    i <= stepIndex ? 'var(--color-brand-orange)' : 'var(--color-border)',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-brand-orange)' }}
            onClick={handleNext}
          >
            {isLastStep ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
