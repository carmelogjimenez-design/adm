import { createClient } from '@/lib/supabase/server'

export async function getPhases() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('phases').select('phase_order, name, description').order('phase_order')
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
    .select('full_name, role, status, requested_role, is_superadmin')
    .eq('id', user.id).single()
  return data
}

export async function getPendingUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, requested_role, created_at')
    .eq('status', 'pending').order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getMyPlayer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('players').select('*').eq('family_profile_id', user.id).maybeSingle()
  return data
}
