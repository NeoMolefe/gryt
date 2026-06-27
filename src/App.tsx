import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'
import { AppShell } from '@/components/layout/AppShell'
import { SubscriptionGuard } from '@/components/payment/SubscriptionGuard'
import { abandonStaleSession } from '@/lib/session/sessionStorage'
import { abandonSessionLog } from '@/lib/dashboard/queries'

const Landing = lazy(() => import('@/pages/Landing').then((m) => ({ default: m.Landing })))
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })))
const TermsOfService = lazy(() => import('@/pages/TermsOfService').then((m) => ({ default: m.TermsOfService })))
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy').then((m) => ({ default: m.RefundPolicy })))
const ResetPassword = lazy(() => import('@/pages/ResetPassword').then((m) => ({ default: m.ResetPassword })))
const SignUp = lazy(() => import('@/pages/SignUp').then((m) => ({ default: m.SignUp })))
const Login = lazy(() => import('@/pages/Login').then((m) => ({ default: m.Login })))
const GetStarted = lazy(() => import('@/pages/GetStarted').then((m) => ({ default: m.GetStarted })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Onboarding = lazy(() => import('@/pages/Onboarding').then((m) => ({ default: m.Onboarding })))
const Workouts = lazy(() => import('@/pages/Workouts').then((m) => ({ default: m.Workouts })))
const WorkoutSession = lazy(() => import('@/pages/WorkoutSession').then((m) => ({ default: m.WorkoutSession })))
const Kwazi = lazy(() => import('@/pages/Kwazi').then((m) => ({ default: m.Kwazi })))
const Progress = lazy(() => import('@/pages/Progress').then((m) => ({ default: m.Progress })))
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })))

const queryClient = new QueryClient()

function App() {
  const initialise = useAuthStore((state) => state.initialise)
  const setSession = useAuthStore((state) => state.setSession)
  const setProfile = useAuthStore((state) => state.setProfile)
  const refreshProfile = useAuthStore((state) => state.refreshProfile)
  const userId = useAuthStore((state) => state.session?.user.id ?? null)

  useEffect(() => {
    useThemeStore.getState().initialise()
  }, [])

  useEffect(() => {
    void initialise()

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) {
          void refreshProfile()
        } else {
          setProfile(null)
        }
      },
    )

    return () => subscription.subscription.unsubscribe()
  }, [initialise, setSession, setProfile, refreshProfile])

  useEffect(() => {
    if (!userId) return

    const abandoned = abandonStaleSession(userId)
    if (abandoned?.sessionLogId) {
      void abandonSessionLog(abandoned.sessionLogId)
    }
  }, [userId])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div style={{ minHeight: '100svh', background: 'var(--color-bg)' }} />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/sign-up"
              element={
                <PublicOnlyRoute>
                  <SignUp />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/get-started"
              element={
                <ProtectedRoute>
                  <GetStarted />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <AppShell>
                      <Dashboard />
                    </AppShell>
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workouts"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <AppShell>
                      <Workouts />
                    </AppShell>
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <AppShell>
                      <Progress />
                    </AppShell>
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kwazi"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <AppShell>
                      <Kwazi />
                    </AppShell>
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <AppShell>
                      <Settings />
                    </AppShell>
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/session/:workoutId"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <WorkoutSession />
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
