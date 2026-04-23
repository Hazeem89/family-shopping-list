import { useState, useEffect, useRef } from 'react'
import supabase from '../lib/supabase'

const itemsCacheKey = (familyId) => `fsl_items_${familyId}`

export function useItems(family, user) {
  const [items, setItems] = useState(() => {
    if (!family?.id) return []
    try { return JSON.parse(localStorage.getItem(itemsCacheKey(family.id))) ?? [] } catch { return [] }
  })
  const [activity, setActivity] = useState([])
  const [newItemId, setNewItemId] = useState(null)
  const [loading, setLoading] = useState(() => {
    if (!family?.id) return true
    try { return !localStorage.getItem(itemsCacheKey(family.id)) } catch { return true }
  })
  const [error, setError] = useState(null)
  const profileCache = useRef({})

  useEffect(() => {
    if (!family) { setItems([]); setLoading(false); return }
    fetchItems()

    const channel = supabase
      .channel(`items:${family.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'items',
        filter: `family_id=eq.${family.id}`
      }, async (payload) => {
        const { data } = await supabase
          .from('items')
          .select('id, name, bought, created_at, profiles!added_by(full_name)')
          .eq('id', payload.new.id)
          .single()
        if (data) {
          setItems(prev => {
            if (prev.find(i => i.id === data.id)) return prev
            return [...prev, normalize(data)]
          })
          const name = data.profiles?.full_name ?? 'Someone'
          addActivity(`${name} added ${data.name}`)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'items',
        filter: `family_id=eq.${family.id}`
      }, async (payload) => {
        const updated = payload.new
        setItems(prev => prev.map(i =>
          i.id === updated.id ? { ...i, bought: updated.bought } : i
        ))

        let actorName = 'Someone'
        if (updated.bought && updated.bought_by) {
          actorName = await resolveProfile(updated.bought_by)
        }
        setItems(prev => {
          const item = prev.find(i => i.id === updated.id)
          if (item) addActivity(`${actorName} ${updated.bought ? 'checked' : 'unchecked'} ${item.name}`)
          return prev
        })
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'items',
        filter: `family_id=eq.${family.id}`
      }, (payload) => {
        addActivity(`"${payload.old.name}" was removed`)
        setItems(prev => prev.filter(i => i.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [family?.id])

  const resolveProfile = async (userId) => {
    if (profileCache.current[userId]) return profileCache.current[userId]
    const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).single()
    const name = data?.full_name ?? 'Someone'
    profileCache.current[userId] = name
    return name
  }

  const addActivity = (msg) => {
    setActivity(prev => [msg, ...prev].slice(0, 10))
  }

  const fetchItems = async () => {
    const cacheKey = itemsCacheKey(family.id)
    const hasCached = !!localStorage.getItem(cacheKey)
    if (!hasCached) setLoading(true)

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('items')
          .select('id, name, bought, created_at, profiles!added_by(full_name)')
          .eq('family_id', family.id)
          .order('created_at', { ascending: true }),
        timeout
      ])

      if (error) { setError(error.message); return }

      const normalized = data.map(normalize)
      localStorage.setItem(cacheKey, JSON.stringify(normalized))
      setItems(normalized)
    } catch {
      // timeout — keep cached data
    } finally {
      setLoading(false)
    }
  }

  const normalize = (item) => ({
    id: item.id,
    name: item.name,
    bought: item.bought,
    addedBy: item.profiles?.full_name ?? 'Unknown'
  })

  const addItem = async (name) => {
    setError(null)
    const duplicate = items.find(i => i.name.toLowerCase() === name.toLowerCase())
    if (duplicate) { setError(`"${name}" is already on the list`); return }

    const { data, error } = await supabase
      .from('items')
      .insert({ name, family_id: family.id, added_by: user.id })
      .select('id, name, bought, profiles!added_by(full_name)')
      .single()

    if (error) { setError(error.message); return }

    const newItem = normalize(data)
    setItems(prev => [...prev, newItem])
    setNewItemId(newItem.id)
    setTimeout(() => setNewItemId(null), 2000)
  }

  const toggleItem = async (item) => {
    setError(null)
    const { error } = await supabase
      .from('items')
      .update({
        bought: !item.bought,
        bought_by: !item.bought ? user.id : null
      })
      .eq('id', item.id)

    if (error) { setError(error.message); return }

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, bought: !i.bought } : i))
  }

  const deleteItem = async (id) => {
    setError(null)
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return { items, activity, newItemId, loading, error, setError, addItem, toggleItem, deleteItem }
}
