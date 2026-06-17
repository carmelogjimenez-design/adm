'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Row = { id: string; university_id: string; name: string; division: string | null; state: string | null; conference: string | null; pct: number; reasons: string[]; status: string }
const STATUS: [string, string, string][] = [
  ['suggested', 'Sugerida', 'bg-slate-100 text-slate-500'],
  ['contacted', 'Contactada', 'bg-[#0F5EFF]/10 text-[#0F5EFF]'],
  ['interested', 'Interesada', 'bg-[#39E6A5]/20 text-emerald-700'],
  ['discarded', 'Descartada', 'bg-slate-100 text-slate-300'],
]
function divLabel(d: string | null) { return d ? d.replace('NCAA_', '').replace('NJCAA', 'JUCO') : 'USCAA/otro' }

export default function Matching({ playerId }: { playerId: string }) {
  const supabase = createClient()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadSaved() {
    const { data } = await supabase.from('player_university_matches')
      .select('id, university_id, match_score, success_probability, rationale, status, universities(name, division, state, conference)')
      .eq('player_id', playerId).order('match_score', { ascending: false })
    if (data) setRows(data.map((m: any) => {
      const u = Array.isArray(m.universities) ? m.universities[0] : m.universities
      return { id: m.id, university_id: m.university_id, name: u?.name ?? 'Universidad', division: u?.division ?? null, state: u?.state ?? null, conference: u?.conference ?? null, pct: m.success_probability ?? 0, reasons: m.rationale?.reasons ?? [], status: m.status ?? 'suggested' }
    }))
  }
  useEffect(() => { loadSaved() }, [playerId])

  async function generate() {
    setLoading(true); setError(null)
    const { data, error } = await supabase.rpc('match_universities', { p_player: playerId })
    if (error) { setError(error.message); setLoading(false); return }
    const list = (data ?? []) as any[]
    const maxScore = list.length ? Math.max(...list.map(r => r.score)) : 100
    const payload = list.map(r => ({
      player_id: playerId, university_id: r.university_id, match_score: r.score,
      success_probability: Math.min(Math.round((r.score / Math.max(maxScore, 1)) * 100), 100),
      rationale: { reasons: r.reasons ?? [] },
    }))
    const { error: upErr } = await supabase.from('player_university_matches').upsert(payload, { onConflict: 'player_id,university_id' })
    setLoading(false)
    if (upErr) { setError(upErr.message); return }
    loadSaved()
  }

  async function setStatus(id: string, status: string) {
    setRows(rs => rs ? rs.map(r => r.id === id ? { ...r, status } : r) : rs)
    await supabase.from('player_university_matches').update({ status }).eq('id', id)
  }

  const has = rows && rows.length > 0

  return (
    <div className="fade-up card-soft bg-white border border-slate-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Universidades recomendadas</h2>
        <button onClick={generate} disabled={loading}
          className="px-3 py-1.5 rounded-lg grad-accent text-white text-[12px] font-semibold disabled:opacity-50 glow-brand">
          {loading ? 'Calculando…' : (has ? 'Recalcular' : 'Generar matching')}
        </button>
      </div>
      <p className="text-[12px] text-slate-400 mb-4">Guardadas automáticamente. Marca el estado de cada una mientras contactas.</p>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}
      {rows && rows.length === 0 && <p className="text-sm text-slate-400">Aún no hay matching. Pulsa “Generar matching”.</p>}

      {has && (
        <div className="flex flex-col gap-2.5">
          {rows!.map((r, i) => {
            const st = STATUS.find(s => s[0] === r.status) ?? STATUS[0]
            const dim = r.status === 'discarded'
            return (
              <div key={r.id} className={'rounded-xl border border-slate-100 p-3.5 card-hover ' + (dim ? 'opacity-55' : '')}>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 grid place-items-center text-[11px] font-bold font-mono text-slate-400 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-slate-900 truncate">{r.name}</div>
                    <div className="text-[11.5px] text-slate-400">{divLabel(r.division)}{r.state ? ` · ${r.state}` : ''}{r.conference ? ` · ${r.conference}` : ''}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[20px] font-extrabold tracking-tight grad-text leading-none tabular-nums">{r.pct}%</div>
                    <div className="text-[10px] text-slate-400 font-semibold">encaje</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2.5 pl-10 flex-wrap">
                  <div className="flex flex-wrap gap-1.5">
                    {r.reasons.map((why, j) => <span key={j} className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-[#0F5EFF]/[0.07] text-[#0F5EFF]">{why}</span>)}
                  </div>
                  <div className="flex gap-1">
                    {STATUS.map(([val, label, cls]) => (
                      <button key={val} onClick={() => setStatus(r.id, val)}
                        className={'text-[10.5px] font-bold px-2 py-1 rounded-md transition ' + (r.status === val ? cls + ' ring-1 ring-current/20' : 'text-slate-300 hover:text-slate-500')}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
