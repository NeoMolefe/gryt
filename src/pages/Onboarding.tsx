import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import { WizardNav } from '@/components/onboarding/WizardNav'
import { LoadingOverlay } from '@/components/onboarding/LoadingOverlay'
import { Step1PersonalDetails } from '@/pages/onboarding/steps/Step1PersonalDetails'
import { Step2Experience } from '@/pages/onboarding/steps/Step2Experience'
import { Step3PrimaryGoal } from '@/pages/onboarding/steps/Step3PrimaryGoal'
import { Step4SecondaryGoals } from '@/pages/onboarding/steps/Step4SecondaryGoals'
import { Step5Availability } from '@/pages/onboarding/steps/Step5Availability'
import { Step6Equipment } from '@/pages/onboarding/steps/Step6Equipment'
import { Step7TrainingStyle } from '@/pages/onboarding/steps/Step7TrainingStyle'
import { Step8InjuryHistory } from '@/pages/onboarding/steps/Step8InjuryHistory'
import { StepEventType } from '@/pages/onboarding/steps/StepEventType'
import { StepSummary } from '@/pages/onboarding/steps/StepSummary'
import { buildSteps, summaryBlockReason, validateStep } from '@/lib/onboarding/steps'
import { submitOnboarding } from '@/lib/onboarding/submit'
import { useAuthStore } from '@/store/authStore'
import { INITIAL_ONBOARDING_DATA, type OnboardingData, type StepId } from '@/types/onboarding'

interface OnboardingLocationState {
  prefill?: OnboardingData
  isRegeneration?: boolean
}

export function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as OnboardingLocationState | null
  const session = useAuthStore((state) => state.session)
  const refreshProfile = useAuthStore((state) => state.refreshProfile)

  const [data, setData] = useState<OnboardingData>(locationState?.prefill ?? INITIAL_ONBOARDING_DATA)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [returnToSummary, setReturnToSummary] = useState(false)
  const [blockReason, setBlockReason] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const steps = useMemo(() => buildSteps(data.primaryGoal), [data.primaryGoal])
  const currentStepId = steps[step]

  function updateData<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K],
  ) {
    setData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function goToStep(stepId: StepId, options?: { returnToSummary?: boolean }) {
    const index = steps.indexOf(stepId)
    if (index === -1) return
    setBlockReason(null)
    setReturnToSummary(Boolean(options?.returnToSummary))
    setStep(index)
  }

  async function handleSubmit() {
    if (!session) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await submitOnboarding(session.user.id, session.user.email ?? null, data)
      await refreshProfile()
      if (locationState?.isRegeneration) {
        navigate('/dashboard', {
          state: { toast: 'Your new plan is ready. Previous progress has been saved to your history.' },
        })
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      setIsSubmitting(false)
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    }
  }

  function handleNext() {
    if (currentStepId === 'summary') {
      const reason = summaryBlockReason(data)
      if (reason) {
        setBlockReason(reason)
        return
      }
      void handleSubmit()
      return
    }

    const stepErrors = validateStep(currentStepId, data)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    setErrors({})

    if (returnToSummary) {
      setReturnToSummary(false)
      goToStep('summary')
      return
    }

    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  function handleBack() {
    setErrors({})
    setStep((current) => Math.max(current - 1, 0))
  }

  function renderStep() {
    switch (currentStepId) {
      case 'personal':
        return <Step1PersonalDetails data={data} updateData={updateData} errors={errors} />
      case 'experience':
        return <Step2Experience data={data} updateData={updateData} errors={errors} />
      case 'primaryGoal':
        return <Step3PrimaryGoal data={data} updateData={updateData} errors={errors} />
      case 'secondaryGoals':
        return <Step4SecondaryGoals data={data} updateData={updateData} errors={errors} />
      case 'availability':
        return <Step5Availability data={data} updateData={updateData} errors={errors} />
      case 'equipment':
        return <Step6Equipment data={data} updateData={updateData} errors={errors} />
      case 'trainingStyle':
        return <Step7TrainingStyle data={data} updateData={updateData} errors={errors} />
      case 'injuryHistory':
        return <Step8InjuryHistory data={data} updateData={updateData} errors={errors} />
      case 'eventType':
        return <StepEventType data={data} updateData={updateData} errors={errors} />
      case 'summary':
        return <StepSummary data={data} onEdit={(id) => goToStep(id, { returnToSummary: true })} blockReason={blockReason} />
      default:
        return null
    }
  }

  if (isSubmitting) {
    return <LoadingOverlay onCancel={() => setIsSubmitting(false)} />
  }

  return (
    <div className="flex min-h-svh flex-col">
      <div className="px-6 pt-6">
        <ProgressBar current={step + 1} total={steps.length} />
      </div>

      <motion.div
        key={currentStepId}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 overflow-y-auto px-6 py-6 pb-32"
      >
        {renderStep()}

        {currentStepId === 'injuryHistory' && (
          <button
            type="button"
            onClick={handleNext}
            className="mt-4 text-sm text-text-secondary hover:text-text-primary"
          >
            Skip
          </button>
        )}

        {submitError && (
          <p role="alert" className="mt-4 text-sm text-phase-peak">
            {submitError}
          </p>
        )}
      </motion.div>

      <WizardNav
        onBack={handleBack}
        onNext={handleNext}
        showBack={step > 0}
        nextLabel={currentStepId === 'summary' ? 'Finalise & Generate Plan' : 'Next'}
      />
    </div>
  )
}
