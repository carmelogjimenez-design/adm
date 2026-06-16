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
function divLabel(d: string | null) { return d ? d.replace('NCAA_', '').replace('NJCAA', 'JUCO') : '—' }
const LIMIT = 150

export default function UniversitiesTable({ rows }: { rows: Uni[] }) {
  const supabase = createClient()
  const [data, setData] = useState<Uni[]>(rows)
  const [q, setQ] = useState('')
  const [div, setDiv] = useState('Todas')
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Uni>>({})
  const [saving, setSaving] = useState(false)

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

  const inp = 'w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[12.5px] focus:border-[#0F5EFF] focus:outline-none'

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar universidad, coach, email…"
          className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0F5EFF] focus:outline-none bg-white" />
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {DIVS.map(d => (
            <button key={d} onClick={() => setDiv(d)}
              className={'px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition ' + (div === d ? 'grad-accent text-white' : 'text-slate-500 hover:text-slate-900')}>
              {d === 'Todas' ? 'Todas' : divLabel(d)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[12px] text-slate-400 mb-3">{filtered.length} resultados{filtered.length > LIMIT ? ` · mostrando ${LIMIT}, afina la búsqueda` : ''}</p>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden card-soft">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/70">
              {['Universidad', 'Nivel', 'Coach', 'Email', 'WhatsApp', 'Estado', ''].map((h, i) => (
                <th key={i} className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4 py-3 border-b border-slate-100">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(u => {
              const complete = !!(u.coach_email && u.coach_email.includes('@'))
              const isEdit = editId === u.id
              return (
                <Fragment key={u.id}>
                  <tr className="border-b border-slate-50 last:border-0 hover:bg-[#0F5EFF]/[0.02] transition align-top">
                    <td className="px-4 py-3">
                      <div className="text-[13.5px] font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.conference || '—'}{u.adm_placements ? ` · ${u.adm_placements} ADM` : ''}</div>
                    </td>
                    <td className="px-4 py-3"><span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{divLabel(u.division)}</span></td>
                    <td className="px-4 py-3 text-[13px] text-slate-700">{u.head_coach_name || <span className="text-slate-300">—</span>}{u.coach_position ? <div className="text-[10.5px] text-slate-400">{u.coach_position}</div> : null}</td>
                    <td className="px-4 py-3 text-[12.5px] text-[#0F5EFF]">{u.coach_email || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 text-[12.5px] text-slate-600">{u.coach_whatsapp || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3"><span className={'text-[10.5px] font-bold px-2 py-0.5 rounded-full ' + (complete ? 'bg-[#39E6A5]/20 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{complete ? 'Completo' : 'Faltan datos'}</span></td>
                    <td className="px-4 py-3 text-right">
                      {!isEdit && <button onClick={() => startEdit(u)} className="text-[12px] font-semibold grad-text">Editar</button>}
                    </td>
                  </tr>
                  {isEdit && (
                    <tr className="bg-slate-50/60 border-b border-slate-100">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Coach</span><input className={inp} value={draft.head_coach_name ?? ''} onChange={e => setDraft(d => ({ ...d, head_coach_name: e.target.value }))} /></label>
                          <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Posición</span><input className={inp} value={draft.coach_position ?? ''} onChange={e => setDraft(d => ({ ...d, coach_position: e.target.value }))} /></label>
                          <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Email</span><input className={inp} value={draft.coach_email ?? ''} onChange={e => setDraft(d => ({ ...d, coach_email: e.target.value }))} /></label>
                          <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">WhatsApp</span><input className={inp} value={draft.coach_whatsapp ?? ''} onChange={e => setDraft(d => ({ ...d, coach_whatsapp: e.target.value }))} /></label>
                          <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Web</span><input className={inp} value={draft.website ?? ''} onChange={e => setDraft(d => ({ ...d, website: e.target.value }))} /></label>
                          <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Necesidades</span><input className={inp} value={draft.team_needs ?? ''} onChange={e => setDraft(d => ({ ...d, team_needs: e.target.value }))} /></label>
                          <label className="block sm:col-span-2 lg:col-span-3"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Comentario</span><input className={inp} value={draft.coach_comment ?? ''} onChange={e => setDraft(d => ({ ...d, coach_comment: e.target.value }))} /></label>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => save(u.id)} disabled={saving} className="px-4 py-2 rounded-lg grad-accent text-white text-[12.5px] font-semibold disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar'}</button>
                          <button onClick={cancel} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-[12.5px] font-semibold">Cancelar</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
