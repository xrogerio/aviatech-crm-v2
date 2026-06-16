import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  role: 'vendedor' | 'gerente' | 'admin' | null
  organizationId: string | null
  organizationName: string | null
  name: string | null
  avatarUrl: string | null
  signUp: (
    email: string,
    password: string,
    companyName?: string,
  ) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<'vendedor' | 'gerente' | 'admin' | null>(
    null,
  )
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, organization_id, name, avatar_url, organizations(name)')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      setOrganizationId(data?.organization_id)
      setOrganizationName((data?.organizations as any)?.name || null)
      setName(data?.name || null)
      setAvatarUrl((data as any)?.avatar_url || null)
      return data?.role as 'vendedor' | 'gerente' | 'admin'
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      return null
    }
  }, [])

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchUserProfile(session.user.id).then((r) => setRole(r))
      } else {
        setRole(null)
        setOrganizationId(null)
        setOrganizationName(null)
        setName(null)
        setAvatarUrl(null)
      }

      if (event === 'INITIAL_SESSION') {
        setLoading(false)
      }
    })

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id).then((r) => {
          setRole(r)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserProfile])

  // Realtime subscription for user role and organization updates
  useEffect(() => {
    if (!user) return

    const channel = supabase.channel('user_updates').on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${user.id}`,
      },
      () => {
        fetchUserProfile(user.id).then((r) => setRole(r))
      },
    )

    if (organizationId) {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'organizations',
          filter: `id=eq.${organizationId}`,
        },
        () => {
          fetchUserProfile(user.id).then((r) => setRole(r))
        },
      )
    }

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, organizationId, fetchUserProfile])

  const signUp = async (
    email: string,
    password: string,
    companyName?: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
        },
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setRole(null)
      setUser(null)
      setSession(null)
      setOrganizationId(null)
      setOrganizationName(null)
      setName(null)
      setAvatarUrl(null)
    }
    return { error }
  }

  const value = {
    user,
    session,
    role,
    organizationId,
    organizationName,
    name,
    avatarUrl,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
