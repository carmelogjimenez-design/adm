'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type Player = {
  id: string; first_name: string; last_name: string; primary_position: string | null
  current_club: string | null; stage: string; potential_score: number | null; target_division: string | null
}
const STAGES: [string, string, string][] = [
  ['lead', 'Lead detectado', '#9AA3B2'],
  ['first_contact', 'Primer contacto', '#3B82F6'],
  ['interested', 'Interesado', '#0F5EFF'],
  ['docs_requested', 'Doc. solicitada', '#7B61FF'],
  ['contract_sent', 'Contrato enviado', '#E0A526'],
  ['contract_signed', 'Contrato firmado', '#16B57C'],
  ['initial_paid', 'Pago inicial', '#10B981'],
  ['active', 'Cliente activo', '#39E6A5'],
]
const DIV_META: Record<string, { label: string; color: string }> = {
  NCAA_D1: { label: 'D1', color: '#0F5EFF' }, NCAA_D2: { label: 'D2', color: '#0FB5A5' },
  NCAA_D3: { label: 'D3', color: '#7B61FF' }, NAIA: { label: 'NAIA', color: '#E0A526' },
  NJCAA: { label: 'JUCO', color: '#64748B' },
}
const dm = (d: string | null) => DIV_META[d ?? ''] ?? null
const DIVS = ['Todas', 'NCAA_D1', 'NCAA_D2', 'NCAA_D3', 'NAIA', 'NJCAA']

export default function CaptacionBoard({ players }: { players: Player[] }) {
  const [q, setQ] = useState('')
  const [div, setDiv] = useState('Todas')

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return players.filter(p => {
      if (div !== 'Todas' && p.target_division !== div) return false
      if (!t) return true
      return [`${p.first_name} ${p.last_name}`, p.primary_position, p.current_club].some(x => (x ?? '').toLowerCase().includes(t))
    })
  }, [players, q, div])

  const byStage = useMemo(() => {
    const m: Record<string, Player[]> = {}
    for (const [id] of STAGES) m[id] = []
    for (const p of filtered) (m[p.stage] ??= []).push(p)
    return m
  }, [filtered])

  const filtering = q.trim() !== '' || div !== 'Todas'

  return (
    <>
      <div className="fade-up flex flex-wrap items-center gap-2.5 mt-6 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar jugador, posición o club…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0F5EFF] focus:outline-none bg-white card-soft" />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 card-soft">
          {DIVS.map(d => (
            <button key={d} onClick={() => setDiv(d)}
              className={'px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition ' + (div === d ? 'grad-accent text-white' : 'text-slate-500 hover:text-slate-900')}>
              {d === 'Todas' ? 'Todas' : DIV_META[d].label}
            </button>
          ))}
        </div>
        {filtering && <span className="text-[12px] font-semibold text-slate-400">{filtered.length} jugador{filtered.length === 1 ? '' : 'es'}</span>}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3" style={{ height: 'calc(100vh - 268px)', minHeight: 420 }}>
        {STAGES.map(([id, label, color], si) => {
          const cards = byStage[id] ?? []
          return (
            <div key={id} className="fade-up w-[286px] shrink-0 flex flex-col rounded-2xl bg-white/55 backdrop-blur border border-slate-200/70 overflow-hidden"
              style={{ animationDelay: `${si * 40}ms` }}>
              <div className="h-1 w-full" style={{ background: color }} />
              <div className="flex items-center gap-2 px-3.5 py-3 border-b border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-[13px] font-bold text-slate-800">{label}</span>
                <span className="ml-auto text-[11px] font-bold font-mono tabular-nums text-slate-500 bg-slate-100 rounded-full min-w-[22px] h-[22px] grid place-items-center px-1.5">{cards.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
                {cards.length === 0 ? (
                  <div className="h-full min-h-[110px] grid place-items-center">
                    <div className="text-[11.5px] text-slate-300 font-medium">{filtering ? 'Sin coincidencias' : 'Aún nadie aquí'}</div>
                  </div>
                ) : cards.map(p => {
                  const d = dm(p.target_division)
                  return (
                    <Link key={p.id} href={`/panel/jugadores/${p.id}`}
                      className="block bg-white border border-slate-100 rounded-xl p-3 card-soft card-hover">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg grad-accent text-white grid place-items-center text-[11px] font-bold shrink-0">
                          {(p.first_name?.[0] ?? '') + (p.last_name?.[0] ?? '')}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold tracking-tight text-slate-900 truncate">{p.first_name} {p.last_name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{p.primary_position || '—'}{p.current_club ? ` · ${p.current_club}` : ''}</div>
                        </div>
                      </div>
                      {d && (
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md" style={{ background: `${d.color}1a`, color: d.color }}>{d.label}</span>
                          {p.potential_score != null && <span className="text-[10.5px] font-semibold text-slate-400">· pot. {p.potential_score}</span>}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
