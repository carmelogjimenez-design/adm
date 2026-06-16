'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Row = {
  university_id: string; name: string; division: string | null; state: string | null
  conference: string | null; adm_placements: number; adm_avg_award_usd: number | null
  score: number; reasons: string[]
}

function divLabel(d: string | null) { return d ? d.replace('NCAA_', '').replace('NJCAA', 'JUCO') : 'USCAA/otro' }

export default function Matching({ playerId }: { playerId: string }) {
  const supabase = createClient()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    setLoading(true); setError(null)
    const { data, error } = await supabase.rpc('match_universities', { p_player: playerId })
    setLoading(false)
    if (error) { setError(error.message); return }
    setRows((data ?? []) as Row[])
  }

  const maxScore = rows && rows.length ? Math.max(...rows.map(r => r.score)) : 100

  return (
    <div className="fade-up card-soft bg-white border border-slate-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Universidades recomendadas</h2>
        <button onClick={run} disabled={loading}
          className="px-3 py-1.5 rounded-lg grad-accent text-white text-[12px] font-semibold disabled:opacity-50 glow-brand">
          {loading ? 'Calculando…' : (rows ? 'Recalcular' : 'Generar matching')}
        </button>
      </div>
      <p className="text-[12px] text-slate-400 mb-4">Ordenadas por encaje: nivel, relación ADM, posición y beca histórica.</p>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

      {rows && rows.length === 0 && (
        <p className="text-sm text-slate-400">Sin universidades que encajen todavía. Revisa el nivel objetivo del jugador.</p>
      )}

      {rows && rows.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {rows.map((r, i) => (
            <div key={r.university_id} className="rounded-xl border border-slate-100 p-3.5 card-hover">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-100 grid place-items-center text-[11px] font-bold font-mono text-slate-400 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-slate-900 truncate">{r.name}</div>
                  <div className="text-[11.5px] text-slate-400">{divLabel(r.division)}{r.state ? ` · ${r.state}` : ''}{r.conference ? ` · ${r.conference}` : ''}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[20px] font-extrabold tracking-tight grad-text leading-none tabular-nums">{Math.min(Math.round((r.score / Math.max(maxScore, 1)) * 100), 100)}%</div>
                  <div className="text-[10px] text-slate-400 font-semibold">encaje</div>
                </div>
              </div>
              {r.reasons?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 pl-10">
                  {r.reasons.map((why, j) => (
                    <span key={j} className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-[#0F5EFF]/[0.07] text-[#0F5EFF]">{why}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
