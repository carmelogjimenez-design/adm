'use client'
import { Fragment, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Uni = {
  id: string; name: string; division: string | null; conference: string | null; state: string | null
  head_coach_name: string | null; coach_position: string | null; coach_email: string | null
  coach_whatsapp: string | null; website: string | null; team_needs: string | null
  coach_comment: string | null; adm_placements: number | null; sevp_certified: boolean | null
}

const DIVS = ['Todas', 'NCAA_D1', 'NCAA_D2', 'NCAA_D3', 'NAIA', 'NJCAA']
const LIMIT = 120

const DIV_META: Record<string, { label: string; color: string }> = {
  NCAA_D1: { label: 'D1', color: '#0F5EFF' },
  NCAA_D2: { label: 'D2', color: '#0FB5A5' },
  NCAA_D3: { label: 'D3', color: '#7B61FF' },
  NAIA: { label: 'NAIA', color: '#E0A526' },
  NJCAA: { label: 'JUCO', color: '#64748B' },
}
const dm = (d: string | null) => DIV_META[d ?? ''] ?? { label: d || '—', color: '#94A3B8' }

const STOP = new Set(['university', 'college', 'of', 'the', 'community', 'state', 'saint', 'st', 'and'])
function initials(name: string) {
  const w = name.replace(/[^A-Za-z ]/g, ' ').split(/\s+/).filter(x => x && !STOP.has(x.toLowerCase()))
  const pick = (w.length ? w : name.split(/\s+/)).slice(0, 2)
  return pick.map(x => x[0]?.toUpperCase() ?? '').join('') || name.slice(0, 2).toUpperCase()
}
const hasWa = (v: string | null) => !!v && !['no', 'ko', ''].includes(v.trim().toLowerCase())

export default function UniversitiesTable({ rows }: { rows: Uni[] }) {
  const supabase = createClient()
  const [data, setData] = useState<Uni[]>(rows)
  const [q, setQ] = useState('')
  const [div, setDiv] = useState('Todas')
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Uni>>({})
  const [saving, setSaving] = useState(false)

  const stats = useMemo(() => ({
    total: data.length,
    contactables: data.filter(u => u.coach_email?.includes('@')).length,
    adm: data.filter(u => (u.adm_placements ?? 0) > 0).length,
  }), [data])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return data.filter(u => {
      if (div !== 'Todas' && u.division !== div) return false
      if (!t) return true
      return [u.name, u.head_coach_name, u.coach_email, u.conference, u.state].some(x => (x ?? '').toLowerCase().includes(t))
    })
  }, [data, q, div])
  const shown = filtered.slice(0, LIMIT)

  function startEdit(u: Uni) { setEditId(u.id); setDraft({ ...u }) }
  function cancel() { setEditId(null); setDraft({}) }
  async function save(id: string) {
    setSaving(true)
    const patch = {
      head_coach_name: draft.head_coach_name || null, coach_position: draft.coach_position || null,
      coach_email: draft.coach_email || null, coach_whatsapp: draft.coach_whatsapp || null,
      website: draft.website || null, team_needs: draft.team_needs || null, coach_comment: draft.coach_comment || null,
    }
    const { error } = await supabase.from('universities').update(patch).eq('id', id)
    setSaving(false)
    if (error) { alert(error.message); return }
    setData(d => d.map(u => u.id === id ? { ...u, ...patch } as Uni : u))
    cancel()
  }

  const inp = 'w-full px-2.5 py-2 rounded-lg border border-slate-200 text-[12.5px] focus:border-[#0F5EFF] focus:outline-none bg-white'

  return (
    <div className="mt-6">
      {/* resumen */}
      <div className="fade-up grid grid-cols-3 gap-3 mb-5">
        {[
          { k: 'Universidades', v: stats.total },
          { k: 'Contactables', v: stats.contactables, hint: 'con email' },
          { k: 'Con relación ADM', v: stats.adm, hint: 'colocaciones previas' },
        ].map((s, i) => (
          <div key={i} className="card-soft bg-white rounded-2xl p-4 border border-slate-100">
            <div className="text-[11.5px] font-semibold text-slate-500">{s.k}</div>
            <div className="text-[26px] font-extrabold tracking-tight text-slate-900 mt-1 tabular-nums">{s.v}</div>
            {s.hint && <div className="text-[11px] text-slate-400">{s.hint}</div>}
          </div>
        ))}
      </div>

      {/* buscador + filtro */}
      <div className="flex flex-wrap items-center gap-2.5 mb-3">
        <div className="relative flex-1 min-w-[220px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar universidad, coach, email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0F5EFF] focus:outline-none bg-white" />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {DIVS.map(d => (
            <button key={d} onClick={() => setDiv(d)}
              className={'px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition ' + (div === d ? 'grad-accent text-white' : 'text-slate-500 hover:text-slate-900')}>
              {d === 'Todas' ? 'Todas' : dm(d).label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[12px] text-slate-400 mb-3">{filtered.length} resultados{filtered.length > LIMIT ? ` · mostrando ${LIMIT}, afina la búsqueda` : ''}</p>

      {/* tarjetas */}
      <div className="flex flex-col gap-2.5">
        {shown.map((u, i) => {
          const meta = dm(u.division)
          const complete = !!(u.coach_email && u.coach_email.includes('@'))
          const isAdm = (u.adm_placements ?? 0) > 0
          const isEdit = editId === u.id
          return (
            <div key={u.id}
              className={'fade-up bg-white rounded-2xl border card-hover transition ' + (isAdm ? 'border-[#0F5EFF]/25' : 'border-slate-100') + ' card-soft'}
              style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}>
              <div className="flex items-center gap-4 p-4 flex-wrap">
                {/* avatar */}
                <div className="w-11 h-11 rounded-xl grid place-items-center text-[12px] font-extrabold text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` }}>
                  {initials(u.name)}
                </div>
                {/* nombre + meta */}
                <div className="min-w-[180px] flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-bold text-slate-900">{u.name}</span>
                    {isAdm && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full grad-accent text-white">★ {u.adm_placements} ADM</span>}
                  </div>
                  <div className="text-[11.5px] text-slate-400">{u.conference || 'Sin conferencia'}{u.state ? ` · ${u.state}` : ''}</div>
                </div>
                {/* coach + contacto */}
                <div className="min-w-[200px] flex-1">
                  {u.head_coach_name
                    ? <div className="text-[12.5px] font-semibold text-slate-700">{u.head_coach_name}{u.coach_position ? <span className="text-slate-400 font-normal"> · {u.coach_position}</span> : ''}</div>
                    : <div className="text-[12px] text-slate-300">Sin coach</div>}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {complete && <a href={`mailto:${u.coach_email}`} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#0F5EFF]/[0.08] text-[#0F5EFF] hover:bg-[#0F5EFF]/15">✉ {u.coach_email}</a>}
                    {hasWa(u.coach_whatsapp) && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#39E6A5]/20 text-emerald-700">WhatsApp{/^\+?\d/.test(u.coach_whatsapp!) ? ` ${u.coach_whatsapp}` : ''}</span>}
                  </div>
                </div>
                {/* nivel + estado + accion */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[11px] font-bold px-2 py-1 rounded-md" style={{ background: `${meta.color}1a`, color: meta.color }}>{meta.label}</span>
                  <span className={'text-[10.5px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ' + (complete ? 'bg-[#39E6A5]/20 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{complete ? 'Completo' : 'Pendiente'}</span>
                  {!isEdit && <button onClick={() => startEdit(u)} className="text-[12px] font-semibold grad-text">{complete ? 'Editar' : 'Completar'}</button>}
                </div>
              </div>

              {isEdit && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 rounded-b-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Lab t="Coach"><input className={inp} value={draft.head_coach_name ?? ''} onChange={e => setDraft(d => ({ ...d, head_coach_name: e.target.value }))} /></Lab>
                    <Lab t="Posición"><input className={inp} value={draft.coach_position ?? ''} onChange={e => setDraft(d => ({ ...d, coach_position: e.target.value }))} /></Lab>
                    <Lab t="Email"><input className={inp} value={draft.coach_email ?? ''} onChange={e => setDraft(d => ({ ...d, coach_email: e.target.value }))} /></Lab>
                    <Lab t="WhatsApp"><input className={inp} value={draft.coach_whatsapp ?? ''} onChange={e => setDraft(d => ({ ...d, coach_whatsapp: e.target.value }))} /></Lab>
                    <Lab t="Web"><input className={inp} value={draft.website ?? ''} onChange={e => setDraft(d => ({ ...d, website: e.target.value }))} /></Lab>
                    <Lab t="Necesidades del equipo"><input className={inp} value={draft.team_needs ?? ''} onChange={e => setDraft(d => ({ ...d, team_needs: e.target.value }))} /></Lab>
                    <div className="sm:col-span-2 lg:col-span-3"><Lab t="Comentario"><input className={inp} value={draft.coach_comment ?? ''} onChange={e => setDraft(d => ({ ...d, coach_comment: e.target.value }))} /></Lab></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => save(u.id)} disabled={saving} className="px-4 py-2 rounded-lg grad-accent text-white text-[12.5px] font-semibold disabled:opacity-50 glow-brand">{saving ? 'Guardando…' : 'Guardar'}</button>
                    <button onClick={cancel} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-[12.5px] font-semibold">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Lab({ t, children }: { t: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">{t}</span>{children}</label>
}
