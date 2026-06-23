import { createClient } from '@/lib/supabase/server'

const PLAYER_FIELDS =
  'id, first_name, last_name, primary_position, secondary_position, current_club, category, stage, potential_score, target_division, graduation_year, intake_completed, in_usa, is_alumni, cohort_year, notes, created_at'

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

export async function getPlayersForList() {
  const supabase = await createClient()
  const { data: players } = await supabase.from('players').select(PLAYER_FIELDS).order('created_at', { ascending: false })
  const { data: offers } = await supabase.from('offers').select('player_id, universities(name)').eq('status', 'accepted')
  const uni: Record<string, string> = {}
  for (const o of (offers ?? []) as any[]) { const u = Array.isArray(o.universities) ? o.universities[0] : o.universities; if (u?.name) uni[o.player_id] = u.name }
  return (players ?? []).map((p: any) => ({ ...p, university: uni[p.id] ?? null }))
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
  const { data: players } = await supabase.from('players').select('id, stage, target_division, updated_at, in_usa')
  const { count: universidades } = await supabase.from('universities').select('id', { count: 'exact', head: true })
  const { data: offersRows } = await supabase.from('offers').select('id, offered_at')
  const list = players ?? []
  const offers = offersRows ?? []
  const byStage: Record<string, number> = {}
  const byDivision: Record<string, number> = {}
  for (const p of list) {
    byStage[p.stage] = (byStage[p.stage] ?? 0) + 1
    if (p.target_division) byDivision[p.target_division] = (byDivision[p.target_division] ?? 0) + 1
  }
  const activos = byStage['active'] ?? 0
  const now = Date.now()
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const ofertasMes = offers.filter(o => o.offered_at && new Date(o.offered_at) >= monthStart).length
  const enUSA = list.filter(p => p.in_usa).length
  const enRiesgo = list.filter(p => !p.in_usa && p.stage !== 'active' && p.updated_at && (now - new Date(p.updated_at).getTime()) > 14 * 86400000).length
  const conversion = list.length ? Math.round((activos / list.length) * 100) : 0
  return {
    total: list.length, activos, enUSA, enProceso: list.length - enUSA,
    universidades: universidades ?? 0, ofertas: offers.length, ofertasMes, enRiesgo, conversion,
    byStage, byDivision,
  }
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

export async function getOffers(playerId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('offers')
    .select('id, scholarship_pct, scholarship_amount, family_cost_range, status, deadline, offered_at, notes, universities(name, division, state, annual_cost)')
    .eq('player_id', playerId)
    .order('offered_at', { ascending: false })
  return data ?? []
}

export async function getContract(playerId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('contracts')
    .select('id, status, amount, currency, sent_at, signed_at, expires_at, document_url')
    .eq('player_id', playerId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  return data
}
export async function getPayments(playerId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('payments')
    .select('id, concept, amount, currency, status, due_date, paid_at')
    .eq('player_id', playerId).order('due_date', { ascending: true })
  return data ?? []
}
export async function getFinanceOverview() {
  const supabase = await createClient()
  const { data } = await supabase.from('payments')
    .select('id, concept, amount, currency, status, due_date, paid_at, players(id, first_name, last_name)')
    .order('due_date', { ascending: true })
  return data ?? []
}

export async function getAlumni() {
  const supabase = await createClient()
  const { data } = await supabase.from('players')
    .select('id, first_name, last_name, primary_position, target_division, cohort_year, notes')
    .eq('is_alumni', true)
    .order('cohort_year', { ascending: false })
  return data ?? []
}
