import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

const PROFILE_CACHE_KEY = 'fsl_profile'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY)) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    if (data) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data))
      setProfile(data)
    }
  }

  useEffect(() => {
    let released = false
    const release = () => { if (!released) { released = true; setLoading(false) } }
    const fallback = setTimeout(release, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (event === 'INITIAL_SESSION') {
        if (currentUser) await fetchProfile(currentUser.id)
        release()
        clearTimeout(fallback)
      }

      if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname)
      }

      if (event === 'SIGNED_IN' && currentUser) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', currentUser.id)
          .single()

        if (!existing) {
          await supabase.from('profiles').insert({
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name ?? 'Unknown'
          })
        }

        await fetchProfile(currentUser.id)
      }

      if (event === 'SIGNED_OUT') {
        localStorage.removeItem(PROFILE_CACHE_KEY)
        setProfile(null)
      }
    })

    return () => {
      clearTimeout(fallback)
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    return error
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, profile, loading, signUp, signIn, signOut }
}
