import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'

interface RecoveryGateProps {
  mode: 'recovery_substitution'
  score: number
  onStartRecovery: () => void
  onContinueOriginal: () => void
}

interface RestGateProps {
  mode: 'rest_recommended'
  score: number
  onConfirmTrainAnyway: () => void
}

type ReadinessGateProps = RecoveryGateProps | RestGateProps

export function ReadinessGate(props: ReadinessGateProps) {
  const navigate = useNavigate()
  const [confirmingTrainAnyway, setConfirmingTrainAnyway] = useState(false)

  if (props.mode === 'recovery_substitution') {
    const { score, onStartRecovery, onContinueOriginal } = props
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-phase-peak">Readiness score: {score}</p>
          <h1 className="text-2xl font-bold text-text-primary">Your body is telling you it needs recovery today.</h1>
          <p className="text-sm text-text-secondary">We recommend replacing today&apos;s session with light mobility work instead.</p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button onClick={onStartRecovery}>Start Recovery Session</Button>
          <Button variant="outline" onClick={onContinueOriginal}>
            Continue with original plan anyway
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const { score, onConfirmTrainAnyway } = props

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-phase-peak">Readiness score: {score}</p>
        <h1 className="text-2xl font-bold text-text-primary">This is a strong signal that your body needs full rest today.</h1>
        <p className="text-sm text-text-secondary">
          Training through significant fatigue increases injury risk and slows recovery. Take today off.
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3">
        {!confirmingTrainAnyway ? (
          <>
            <Button onClick={() => navigate('/dashboard')} variant="primary">
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setConfirmingTrainAnyway(true)}>
              I understand — I still want to train
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-text-secondary">Are you sure? This will load your original session.</p>
            <Button variant="outline" onClick={onConfirmTrainAnyway}>
              Yes, I&apos;m sure — train anyway
            </Button>
            <button
              type="button"
              onClick={() => setConfirmingTrainAnyway(false)}
              className="text-sm text-text-secondary hover:underline"
            >
              Actually, take the rest day
            </button>
          </>
        )}
      </div>
    </div>
  )
}
