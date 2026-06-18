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
import { useAuthStore } from '@/store/authStore'
import { loginSchema, type LoginFormValues } from '@/lib/schemas/auth'

export function Login() {
  const navigate = useNavigate()
  const refreshProfile = useAuthStore((state) => state.refreshProfile)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setServerError('Incorrect email or password.')
      return
    }

    await refreshProfile()
    const profile = useAuthStore.getState().profile
    navigate(profile?.onboarding_completed ? '/dashboard' : '/get-started')
  }

  async function handleGoogleLogin() {
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
            Welcome back
          </h1>
          <p className="text-sm text-text-secondary">
            Sign in to continue your programme.
          </p>
        </div>

        <GoogleButton onClick={handleGoogleLogin} isLoading={isGoogleLoading} />

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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {serverError && (
            <p role="alert" className="text-sm text-phase-peak">
              {serverError}
            </p>
          )}

          <Button type="submit" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link to="/sign-up" className="text-brand-orange">
            Get started
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
