import { Button } from '@/components/Button'

interface WizardNavProps {
  onBack: () => void
  onNext: () => void
  showBack: boolean
  nextLabel?: string
  isNextLoading?: boolean
}

export function WizardNav({
  onBack,
  onNext,
  showBack,
  nextLabel = 'Next',
  isNextLoading = false,
}: WizardNavProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[480px] gap-3 border-t border-border bg-background px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      {showBack && (
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
      )}
      <Button type="button" onClick={onNext} isLoading={isNextLoading}>
        {nextLabel}
      </Button>
    </div>
  )
}
