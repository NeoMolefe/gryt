import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'
import { AppShell } from '@/components/layout/AppShell'
import { Landing } from '@/pages/Landing'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { TermsOfService } from '@/pages/TermsOfService'
import { RefundPolicy } from '@/pages/RefundPolicy'
import { ResetPassword } from '@/pages/ResetPassword'
import { SignUp } from '@/pages/SignUp'
import { Login } from '@/pages/Login'
import { GetStarted } from '@/pages/GetStarted'
import { Dashboard } from '@/pages/Dashboard'
import { Onboarding } from '@/pages/Onboarding'
import { Workouts } from '@/pages/Workouts'
import { WorkoutSession } from '@/pages/WorkoutSession'
import { Kwazi } from '@/pages/Kwazi'
import { Progress } from '@/pages/Progress'
import { Settings } from '@/pages/Settings'
import { abandonStaleSession } from '@/lib/session/sessionStorage'
import { abandonSessionLog } from '@/lib/dashboard/queries'

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
                <AppShell>
                  <Dashboard />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Workouts />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Progress />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/kwazi"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Kwazi />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Settings />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/session/:workoutId"
            element={
              <ProtectedRoute>
                <WorkoutSession />
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
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
