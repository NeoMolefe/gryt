import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, error, id, className = '', ...rest }, ref) {
    const inputId = id ?? rest.name

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-sm text-text-secondary">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={`min-h-[44px] rounded-xl border border-border bg-elevated px-4 text-text-primary placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-phase-peak">
            {error}
          </p>
        )}
      </div>
    )
  },
)
