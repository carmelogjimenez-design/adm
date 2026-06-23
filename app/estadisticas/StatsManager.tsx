'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type S = { id: string; season: string; team_name: string | null; matches_played: number; minutes: number; goals: number; assists: number; clean_sheets: number; yellow_cards: number; red_cards: number; call_ups: number; captaincies: number }
const FIELDS: [keyof S, string][] = [
  ['matches_played', 'Partidos'], ['minutes', 'Minutos'], ['goals', 'Goles'], ['assists', 'Asistencias'],
  ['clean_sheets', 'Porterías a 0'], ['yellow_cards', 'Amarillas'], ['red_cards', 'Rojas'], ['call_ups', 'Convocatorias'], ['captaincies', 'Capitanías'],
]
const empty = { season: '', team_name: '', matches_played: 0, minutes: 0, goals: 0, assists: 0, clean_sheets: 0, yellow_cards: 0, red_cards: 0, call_ups: 0, captaincies: 0 }

export default function StatsManager({ playerId, compact = false }: { playerId: string; compact?: boolean }) {
  const supabase = createClient()
  const router = useRouter()
  const [rows, setRows] = useState<S[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState<any>({ ...empty })
  const [editing, setEditing] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase.from('player_stats').select('*').eq('player_id', playerId).order('season', { ascending: false })
    setRows((data ?? []) as S[])
  }
  useEffect(() => { load() }, [playerId])

  function startNew() { setEditing(null); setF({ ...empty }); setOpen(true) }
  function startEdit(r: S) { setEditing(r.id); setF({ ...r }); setOpen(true) }
  const set = (k: string, v: string) => setF((s: any) => ({ ...s, [k]: (k === 'season' || k === 'team_name') ? v : (v === '' ? 0 : Number(v)) }))

  async function save() {
    if (!f.season?.trim()) { alert('Indica la temporada (ej. 2025-26)'); return }
    setBusy(true)
    const { error } = await supabase.rpc('upsert_player_stats', {
      p_player: playerId, p_season: f.season.trim(), p_team: (f.team_name || '').trim() || null,
      p_matches: f.matches_played, p_minutes: f.minutes, p_goals: f.goals, p_assists: f.assists,
      p_clean_sheets: f.clean_sheets, p_yellow: f.yellow_cards, p_red: f.red_cards, p_call_ups: f.call_ups, p_captaincies: f.captaincies,
    })
    setBusy(false)
    if (error) { alert(error.message); return }
    setOpen(false); load(); router.refresh()
  }
  async function del(id: string) {
    if (!confirm('¿Eliminar esta temporada?')) return
    await supabase.rpc('delete_player_stats', { p_id: id }); load(); router.refresh()
  }

  const inp = 'w-full px-2.5 py-2 rounded-lg border border-slate-200 text-[13px] focus:border-[#0F5EFF] focus:outline-none bg-white'
  const Stat = ({ k, v }: { k: string; v: number }) => (
    <div className="text-center"><div className="text-[17px] font-extrabold text-slate-900 tabular-nums leading-none">{v ?? 0}</div><div className="text-[10px] text-slate-400 mt-1">{k}</div></div>
  )

  return (
    <div className={compact ? '' : 'card-soft bg-white border border-slate-100 rounded-2xl p-5 fade-up'}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Estadísticas por temporada</h2>
        <button onClick={open ? () => setOpen(false) : startNew} className="text-[12.5px] font-semibold grad-text">{open ? 'Cancelar' : '+ Añadir temporada'}</button>
      </div>

      {open && (
        <div className="p-3 rounded-xl bg-slate-50/70 mb-4">
          <div className="flex gap-2.5 mb-2.5 flex-wrap">
            <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Temporada</span>
              <input className={inp + ' max-w-[160px]'} placeholder="2025-26" value={f.season} onChange={e => set('season', e.target.value)} disabled={!!editing} /></label>
            <label className="block flex-1 min-w-[180px]"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Equipo</span>
              <input className={inp} placeholder="Nombre del equipo / club" value={f.team_name || ''} onChange={e => set('team_name', e.target.value)} /></label>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {FIELDS.map(([k, label]) => (
              <label key={k} className="block"><span className="block text-[10.5px] font-semibold text-slate-500 mb-1">{label}</span>
                <input className={inp} type="number" value={f[k]} onChange={e => set(k as string, e.target.value)} /></label>
            ))}
          </div>
          <button onClick={save} disabled={busy} className="mt-3 px-5 py-2 rounded-lg grad-accent text-white text-[13px] font-bold disabled:opacity-50 glow-brand">{busy ? 'Guardando…' : 'Guardar temporada'}</button>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-[13px] text-slate-400">{compact ? 'Sin estadísticas todavía.' : 'Aún no has añadido ninguna temporada. ¡Sube tus números de este año! ⚽'}</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {rows.map(r => (
            <div key={r.id} className="rounded-xl border border-slate-100 p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <span className="text-[14px] font-extrabold text-slate-900">{r.season}</span>
                  {r.team_name && <span className="ml-2 text-[12px] font-semibold text-slate-400">{r.team_name}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(r)} className="text-[11.5px] font-semibold grad-text">Editar</button>
                  <button onClick={() => del(r.id)} className="text-[11.5px] font-semibold text-red-500">Eliminar</button>
                </div>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                {FIELDS.map(([k, label]) => <Stat key={k} k={label} v={r[k] as number} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
