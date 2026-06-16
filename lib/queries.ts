import { createClient } from '@/lib/supabase/server'

const PLAYER_FIELDS =
  'id, first_name, last_name, primary_position, secondary_position, current_club, category, stage, potential_score, target_division, graduation_year, intake_completed, created_at'

export async function getMyProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles')
    .select('full_name, role, status, requested_role, is_superadmin').eq('id', user.id).single()
  return data
}

export async function getMyPlayer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('players').select('*').eq('family_profile_id', user.id).maybeSingle()
  return data
}

export async function getPendingUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles')
    .select('id, full_name, requested_role, created_at').eq('status', 'pending').order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getPlayers() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('players').select(PLAYER_FIELDS).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getPlayerById(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('players').select('*').eq('id', id).maybeSingle()
  return data
}

export async function getPlayerDocuments(playerId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('documents')
    .select('id, category_id, name, status, storage_path, external_url, updated_at').eq('player_id', playerId)
  return data ?? []
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: players } = await supabase.from('players').select('id, stage, target_division')
  const { count: universidades } = await supabase.from('universities').select('id', { count: 'exact', head: true })
  const { count: ofertas } = await supabase.from('offers').select('id', { count: 'exact', head: true })
  const list = players ?? []
  const byStage: Record<string, number> = {}
  const byDivision: Record<string, number> = {}
  for (const p of list) {
    byStage[p.stage] = (byStage[p.stage] ?? 0) + 1
    if (p.target_division) byDivision[p.target_division] = (byDivision[p.target_division] ?? 0) + 1
  }
  const activos = byStage['active'] ?? 0
  return { total: list.length, activos, enProceso: list.length - activos, universidades: universidades ?? 0, ofertas: ofertas ?? 0, byStage, byDivision }
}

export async function getDocCategories() {
  const supabase = await createClient()
  const { data } = await supabase.from('doc_categories').select('*').order('sort_order')
  return data ?? []
}

export async function getMyDocuments(playerId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('documents')
    .select('id, category_id, name, status, storage_path, external_url, updated_at').eq('player_id', playerId)
  return data ?? []
}

export async function getPlayerPhases(playerId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('player_phases')
    .select('id, status, phase_id, phases(phase_order, name, description)')
    .eq('player_id', playerId)
  return (data ?? []).slice().sort(
    (a: any, b: any) => (a.phases?.phase_order ?? 0) - (b.phases?.phase_order ?? 0)
  )
}

export async function getUniversities() {
  const supabase = await createClient()
  const { data } = await supabase.from('universities')
    .select('id, name, division, conference, state, city, head_coach_name, coach_position, coach_email, coach_whatsapp, website, team_needs, coach_comment, adm_placements, adm_avg_award_usd, sevp_certified')
    .order('adm_placements', { ascending: false })
    .order('name', { ascending: true })
  return data ?? []
}
