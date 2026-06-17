import { Button } from '@/components/Button'

interface GoogleButtonProps {
  onClick: () => void
  isLoading?: boolean
}

export function GoogleButton({ onClick, isLoading }: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      isLoading={isLoading}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9A8.62 8.62 0 0 0 17.64 9.2z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.55-1.84.87-3.06.87a5.4 5.4 0 0 1-5.08-3.74H.92v2.34A9 9 0 0 0 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.92 10.69A5.4 5.4 0 0 1 3.63 9c0-.59.1-1.16.29-1.69V4.97H.92A9 9 0 0 0 0 9c0 1.45.35 2.83.92 4.03l3-2.34z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58A8.59 8.59 0 0 0 9 0 9 9 0 0 0 .92 4.97l3 2.34A5.4 5.4 0 0 1 9 3.58z"
        />
      </svg>
      Continue with Google
    </Button>
  )
}
