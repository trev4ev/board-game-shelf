import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { appUrl } from '../lib/appUrl'
import { getProfile } from '../lib/profiles'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/profile'

type AuthContextValue = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  profileLoading: boolean
  isConfigured: boolean
  needsUsername: boolean
  refreshProfile: () => Promise<Profile | null>
  sendLoginEmail: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function redirectTo() {
  return appUrl('login')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [profileLoading, setProfileLoading] = useState(false)

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return null
    setProfileLoading(true)
    try {
      let row = await getProfile(userId)
      if (!row) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        row = await getProfile(userId)
      }
      setProfile(row)
      return row
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setLoading(false)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) {
      setProfile(null)
      setProfileLoading(false)
      return
    }
    void loadProfile(userId).catch(() => {
      setProfile(null)
      setProfileLoading(false)
    })
  }, [loadProfile, session?.user?.id])

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId) return null
    return loadProfile(userId)
  }, [loadProfile, session?.user?.id])

  const sendLoginEmail = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo(),
        shouldCreateUser: true,
      },
    })
    if (error) throw error
  }, [])

  const verifyOtp = useCallback(async (email: string, token: string) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    if (error) throw error
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo(),
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      profileLoading,
      isConfigured: Boolean(supabase),
      needsUsername: Boolean(session?.user) && !profile?.username,
      refreshProfile,
      sendLoginEmail,
      verifyOtp,
      signInWithGoogle,
      signOut,
    }),
    [
      session,
      profile,
      loading,
      profileLoading,
      refreshProfile,
      sendLoginEmail,
      verifyOtp,
      signInWithGoogle,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
