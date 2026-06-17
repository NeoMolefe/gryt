import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'text'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-orange text-white hover:bg-brand-orange-hover disabled:opacity-50',
  outline:
    'bg-transparent text-text-primary border border-border hover:bg-elevated disabled:opacity-50',
  text: 'bg-transparent text-text-secondary hover:text-text-primary',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  isLoading = false,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 font-semibold transition-colors duration-200 min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}
