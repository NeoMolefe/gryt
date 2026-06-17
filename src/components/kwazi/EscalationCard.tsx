export function EscalationCard() {
  return (
    <div className="rounded-2xl border border-phase-peak/40 bg-phase-peak/10 p-4 text-center">
      <p className="text-base font-semibold text-phase-peak">This requires a human touch.</p>
      <p className="mt-2 text-sm text-text-secondary">
        Email{' '}
        <a href="mailto:info@gryt.co.za" className="font-semibold text-text-primary underline">
          info@gryt.co.za
        </a>{' '}
        and the team will help directly.
      </p>
    </div>
  )
}
