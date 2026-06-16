import { createClient } from '@/lib/supabase/server'

export async function getPhases() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('phases')
    .select('phase_order, name, description')
    .order('phase_order')
  if (error) throw error
  return data
}

export async function getPlayers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('players')
    .select('id, first_name, last_name, primary_position, stage, potential_score')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getMyProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()
  return data
}
