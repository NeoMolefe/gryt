import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { Divider } from '@/components/Divider'
import { GoogleButton } from '@/components/GoogleButton'
import { supabase } from '@/lib/supabase'
import { signUpSchema, type SignUpFormValues } from '@/lib/schemas/auth'

export function SignUp() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  })

  async function onSubmit(values: SignUpFormValues) {
    setServerError(null)

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setServerError('Unable to create account. Please try again.')
      return
    }

    navigate('/get-started')
  }

  async function handleGoogleSignUp() {
    setIsGoogleLoading(true)
    setServerError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })

    if (error) {
      setServerError('Unable to continue with Google. Please try again.')
      setIsGoogleLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-text-primary">
            Create your account
          </h1>
          <p className="text-sm text-text-secondary">
            Start your GRYT journey today.
          </p>
        </div>

        <GoogleButton onClick={handleGoogleSignUp} isLoading={isGoogleLoading} />

        <Divider label="or" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <TextField
            label="Confirm password"
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
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-orange">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
