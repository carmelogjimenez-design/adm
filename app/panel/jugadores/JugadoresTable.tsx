'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const STAGE_NAMES: Record<string, string> = {
  lead: 'Lead detectado', first_contact: 'Primer contacto', interested: 'Interesado',
  docs_requested: 'Doc. solicitada', contract_sent: 'Contrato enviado',
  contract_signed: 'Contrato firmado', initial_paid: 'Pago inicial', active: 'Cliente activo',
}
const divLabel = (d: string | null) => d ? d.replace('NCAA_', '').replace('NJCAA', 'JUCO') : '—'

export default function JugadoresTable({ players, initialSegment = 'todos' }: { players: any[]; initialSegment?: string }) {
  const [seg, setSeg] = useState(initialSegment)
  const [uni, setUni] = useState('')
  const [q, setQ] = useState('')

  const unis = useMemo(() => Array.from(new Set(players.map(p => p.university).filter(Boolean))).sort() as string[], [players])
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return players.filter(p => {
      if (seg === 'usa' && !p.in_usa) return false
      if (seg === 'proceso' && p.in_usa) return false
      if (uni && p.university !== uni) return false
      if (t && ![`${p.first_name} ${p.last_name}`, p.current_club, p.primary_position, p.university].some((x: any) => (x ?? '').toLowerCase().includes(t))) return false
      return true
    })
  }, [players, seg, uni, q])

  const SEGS: [string, string][] = [['todos', 'Todos'], ['proceso', 'Camino a EE. UU.'], ['usa', 'En EE. UU.']]
  const inp = 'px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:border-[#0F5EFF] focus:outline-none bg-white'

  return (
    <>
      <div className="fade-up flex flex-wrap items-center gap-2.5 mt-6">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 card-soft">
          {SEGS.map(([v, l]) => (
            <button key={v} onClick={() => setSeg(v)} className={'px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition ' + (seg === v ? 'grad-accent text-white' : 'text-slate-500 hover:text-slate-900')}>{l}</button>
          ))}
        </div>
        <select value={uni} onChange={e => setUni(e.target.value)} className={inp + ' max-w-[220px]'}>
          <option value="">Todas las universidades</option>
          {unis.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar jugador, club, universidad…" className={inp + ' w-full pl-10'} />
        </div>
      </div>
      <p className="text-[12px] text-slate-400 mt-2 mb-3">{filtered.length} {filtered.length === 1 ? 'jugador' : 'jugadores'}</p>

      <div className="fade-up bg-white border border-slate-100 rounded-2xl overflow-hidden card-soft">
        <table className="w-full border-collapse">
          <thead><tr className="bg-slate-50/70">{['Jugador', 'Posición', 'Universidad', 'Estado', 'Nivel', ''].map((h, i) => <th key={i} className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4 py-3 border-b border-slate-100">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-slate-400">Sin jugadores con estos filtros.</td></tr>}
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-[#0F5EFF]/[0.03] transition">
                <td className="px-4 py-3">
                  <Link href={`/panel/jugadores/${p.id}`} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl grad-accent text-white grid place-items-center text-[11px] font-bold">{(p.first_name?.[0] ?? '') + (p.last_name?.[0] ?? '')}</div>
                    <div className="leading-tight">
                      <div className="text-[13.5px] font-bold text-slate-900 flex items-center gap-1.5">{p.first_name} {p.last_name}{p.in_usa && <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#39E6A5]/20 text-emerald-700">EE. UU.</span>}</div>
                      <div className="text-[11px] text-slate-400">{p.current_club || '—'}{p.category ? ` · ${p.category}` : ''}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-700">{p.primary_position || '—'}</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-slate-700">{p.university || <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-3"><span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0F5EFF]/10 text-[#0F5EFF]">{STAGE_NAMES[p.stage] ?? p.stage}</span></td>
                <td className="px-4 py-3"><span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{divLabel(p.target_division)}</span></td>
                <td className="px-4 py-3 text-right"><Link href={`/panel/jugadores/${p.id}`} className="text-[12px] font-semibold grad-text">Ver →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
