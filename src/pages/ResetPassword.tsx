import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { supabase } from '@/lib/supabase'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/schemas/auth'

export function ResetPassword() {
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      setHasValidSession(Boolean(data.session))
      setIsCheckingSession(false)
    }

    void checkSession()
  }, [])

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError(null)

    const { error } = await supabase.auth.updateUser({ password: values.password })

    if (error) {
      setServerError(error.message)
      return
    }

    setIsSuccess(true)
  }

  return (
    <div className="flex min-h-svh flex-col px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Reset your password</h1>
          {!isCheckingSession && hasValidSession && !isSuccess && (
            <p className="text-sm text-text-secondary">Choose a new password for your account.</p>
          )}
        </div>

        {isCheckingSession ? (
          <p className="text-center text-sm text-text-secondary">Verifying your reset link...</p>
        ) : isSuccess ? (
          <>
            <p className="text-center text-sm text-text-secondary">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Link to="/login" className="text-center text-sm text-brand-orange">
              Sign in
            </Link>
          </>
        ) : !hasValidSession ? (
          <>
            <p className="text-center text-sm text-text-secondary">
              This reset link is invalid or has expired. Request a new one from the sign-in page.
            </p>
            <Link to="/login" className="text-center text-sm text-brand-orange">
              Back to sign in
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <TextField
              label="New password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <TextField
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {serverError && (
              <p role="alert" className="text-sm text-phase-peak">
                {serverError}
              </p>
            )}

            <Button type="submit" isLoading={isSubmitting}>
              Update password
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
