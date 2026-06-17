import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/profile'
import { loadActiveChat, clearActiveChat } from '@/lib/kwazi/chatStorage'
import { archiveChat } from '@/lib/kwazi/queries'

interface AuthState {
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isInitialised: boolean
  initialise: () => Promise<void>
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch profile:', error.message)
    return null
  }

  return data as Profile
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,
  isInitialised: false,

  initialise: async () => {
    set({ isLoading: true })

    const { data } = await supabase.auth.getSession()
    const session = data.session

    let profile: Profile | null = null
    if (session) {
      profile = await fetchProfile(session.user.id)
    }

    set({ session, profile, isLoading: false, isInitialised: true })
  },

  setSession: (session) => set({ session }),

  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    const userId = get().session?.user.id
    if (userId) {
      const chat = loadActiveChat(userId)
      if (chat) {
        await archiveChat(userId, chat.messages, chat.startedAt)
        clearActiveChat(userId)
      }
    }

    await supabase.auth.signOut()
    set({ session: null, profile: null })
  },

  refreshProfile: async () => {
    const session = get().session
    if (!session) return
    const profile = await fetchProfile(session.user.id)
    set({ profile })
  },
}))
