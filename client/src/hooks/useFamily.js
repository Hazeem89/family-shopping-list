import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export function useFamily(user) {
  const [family, setFamily] = useState(null)
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setFamily(null); setLoading(false); return }
    fetchFamily()
  }, [user])

  useEffect(() => {
    if (!family?.id || !user) return

    const channel = supabase
      .channel(`presence:${family.id}`, { config: { presence: { key: user.id } } })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setMemberCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id })
        }
      })

    return () => supabase.removeChannel(channel)
  }, [family?.id, user?.id])

  const fetchFamily = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('family_members')
      .select('role, families(id, name, invite_code)')
      .eq('user_id', user.id)
      .single()

    const familyData = data ? { ...data.families, role: data.role } : null
    setFamily(familyData)
    setLoading(false)
  }

  const createFamily = async (name) => {
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert({ name, created_by: user.id })
      .select()
      .single()

    if (familyError) return familyError

    const { error: memberError } = await supabase
      .from('family_members')
      .insert({ family_id: familyData.id, user_id: user.id, role: 'admin' })

    if (memberError) return memberError

    await fetchFamily()
    return null
  }

  const joinFamily = async (inviteCode) => {
    const { data, error: findError } = await supabase
      .rpc('get_family_by_invite_code', { code: inviteCode.trim() })

    const familyData = data?.[0]
    if (findError || !familyData) return { message: 'Invalid invite code. Please check and try again.' }

    const { error: memberError } = await supabase
      .from('family_members')
      .insert({ family_id: familyData.id, user_id: user.id, role: 'member' })

    if (memberError) return memberError

    await fetchFamily()
    return null
  }

  const regenerateInviteCode = async () => {
    if (!family) return
    const newCode = Math.random().toString(36).substring(2, 10)
    const { error } = await supabase
      .from('families')
      .update({ invite_code: newCode })
      .eq('id', family.id)

    if (!error) setFamily(prev => ({ ...prev, invite_code: newCode }))
  }

  return { family, memberCount, loading, createFamily, joinFamily, regenerateInviteCode }
}
