'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DIV: Record<string, string> = { NCAA_D1: 'D1', NCAA_D2: 'D2', NCAA_D3: 'D3', NAIA: 'NAIA', NJCAA: 'JUCO' }
const STATUSES: [string, string][] = [
  ['received', 'Oferta recibida'], ['under_review', 'En estudio'],
  ['accepted', 'Aceptada'], ['declined', 'Rechazada'], ['expired', 'Caducada'],
]
const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

export default function OffersEditor({ playerId }: { playerId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [offers, setOffers] = useState<any[]>([])
  const [unis, setUnis] = useState<{ id: string; name: string; division: string | null; annual_cost: number | null }[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({ university_id: '', scholarship_pct: '', scholarship_amount: '', family_cost_range: '', deadline: '', status: 'received', notes: '' })
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }))

  async function load() {
    const { data } = await supabase.from('offers')
      .select('id, scholarship_pct, scholarship_amount, family_cost_range, status, deadline, universities(name, division, state)')
      .eq('player_id', playerId).order('offered_at', { ascending: false })
    setOffers(data ?? [])
  }
  useEffect(() => {
    load()
    supabase.from('universities').select('id, name, division, annual_cost').order('name').then(({ data }) => setUnis(data ?? []))
  }, [])

  // sugerencia de coste neto a partir de la universidad elegida
  const selUni = unis.find(u => u.id === f.university_id)
  const amount = f.scholarship_amount ? Number(f.scholarship_amount) : null
  const pct = f.scholarship_pct ? Number(f.scholarship_pct) : null
  const net = selUni?.annual_cost != null
    ? (amount != null ? Math.max(0, selUni.annual_cost - amount) : pct != null ? selUni.annual_cost * (1 - pct / 100) : null)
    : null

  async function add() {
    if (!f.university_id) { alert('Elige una universidad'); return }
    setBusy(true)
    const { error } = await supabase.from('offers').insert({
      player_id: playerId, university_id: f.university_id,
      scholarship_pct: pct, scholarship_amount: amount,
      family_cost_range: f.family_cost_range || null,
      deadline: f.deadline || null, status: f.status, notes: f.notes || null,
    })
    setBusy(false)
    if (error) { alert(error.message); return }
    setF({ university_id: '', scholarship_pct: '', scholarship_amount: '', family_cost_range: '', deadline: '', status: 'received', notes: '' })
    setOpen(false); load(); router.refresh()
  }
  async function saveRange(id: string, value: string) {
    await supabase.from('offers').update({ family_cost_range: value || null }).eq('id', id)
    router.refresh()
  }
  async function del(id: string) {
    if (!confirm('¿Eliminar esta oferta?')) return
    await supabase.from('offers').delete().eq('id', id); load(); router.refresh()
  }

  const inp = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:border-[#0F5EFF] focus:outline-none bg-white'

  return (
    <div className="fade-up card-soft bg-white rounded-2xl p-5 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Ofertas de beca</h2>
        <button onClick={() => setOpen(o => !o)} className="text-[12.5px] font-semibold grad-text">{open ? 'Cancelar' : '+ Añadir oferta'}</button>
      </div>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 p-3 rounded-xl bg-slate-50/70">
          <label className="block sm:col-span-2"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Universidad</span>
            <select className={inp} value={f.university_id} onChange={e => set('university_id', e.target.value)}>
              <option value="">Selecciona…</option>
              {unis.map(u => <option key={u.id} value={u.id}>{u.name}{u.division ? ` (${DIV[u.division] ?? u.division})` : ''}</option>)}
            </select>
          </label>
          <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Beca (%) · interno</span><input className={inp} type="number" value={f.scholarship_pct} onChange={e => set('scholarship_pct', e.target.value)} /></label>
          <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Importe (USD) · interno</span><input className={inp} type="number" value={f.scholarship_amount} onChange={e => set('scholarship_amount', e.target.value)} /></label>
          <label className="block sm:col-span-2"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Gastos estimados para la familia (lo que VE la familia)</span>
            <input className={inp} placeholder="ej. 2.000 - 4.000 €/año" value={f.family_cost_range} onChange={e => set('family_cost_range', e.target.value)} />
            {net != null && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                <span>Coste neto aprox.: <b className="text-slate-600">{usd(net)}/año</b> (coste anual − beca)</span>
                <button type="button" onClick={() => set('family_cost_range', `~${usd(net)}/año`)} className="font-bold grad-text">usar</button>
              </div>
            )}
          </label>
          <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Fecha límite</span><input className={inp} type="date" value={f.deadline} onChange={e => set('deadline', e.target.value)} /></label>
          <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Estado</span>
            <select className={inp} value={f.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </label>
          <label className="block sm:col-span-2"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Notas</span><input className={inp} value={f.notes} onChange={e => set('notes', e.target.value)} /></label>
          <button onClick={add} disabled={busy} className="sm:col-span-2 py-2.5 rounded-xl grad-accent text-white text-[13px] font-bold disabled:opacity-50 glow-brand">{busy ? 'Guardando…' : 'Guardar oferta'}</button>
        </div>
      )}

      {offers.length === 0 ? (
        <p className="text-[13px] text-slate-400">Aún no hay ofertas registradas. Cuando una universidad ofrezca beca, añádela aquí y la familia la verá en su panel.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {offers.map((o: any) => {
            const uni = Array.isArray(o.universities) ? o.universities[0] : o.universities
            return (
              <div key={o.id} className="px-3 py-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex-1 min-w-[140px] text-[13.5px] font-bold text-slate-900">{uni?.name ?? 'Universidad'}</span>
                  {o.scholarship_pct != null && <span className="text-[12px] font-extrabold text-slate-400">{o.scholarship_pct}% int.</span>}
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{STATUSES.find(s => s[0] === o.status)?.[1] ?? o.status}</span>
                  <button onClick={() => del(o.id)} className="text-[12px] font-semibold text-red-500">Eliminar</button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Gastos familia:</span>
                  <input defaultValue={o.family_cost_range ?? ''} placeholder="ej. 2.000 - 4.000 €/año"
                    onBlur={e => { if ((e.target.value || '') !== (o.family_cost_range ?? '')) saveRange(o.id, e.target.value) }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[12.5px] focus:border-[#0F5EFF] focus:outline-none bg-white" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
