'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DIVS: [string, string][] = [['', '—'], ['NCAA_D1', 'NCAA D1'], ['NCAA_D2', 'NCAA D2'], ['NCAA_D3', 'NCAA D3'], ['NAIA', 'NAIA'], ['NJCAA', 'JUCO']]
const FEET: [string, string][] = [['', '—'], ['right', 'Diestro'], ['left', 'Zurdo'], ['both', 'Ambidiestro']]
const FIELDS: [string, string, 'text' | 'date' | 'div' | 'foot'][] = [
  ['first_name', 'Nombre', 'text'], ['last_name', 'Apellidos', 'text'],
  ['phone', 'Teléfono', 'text'], ['email', 'Email', 'text'], ['instagram', 'Instagram', 'text'],
  ['nationality', 'Nacionalidad', 'text'], ['birth_date', 'Fecha nacimiento', 'date'],
  ['current_club', 'Club actual', 'text'], ['category', 'Categoría', 'text'],
  ['primary_position', 'Posición', 'text'], ['secondary_position', 'Pos. secundaria', 'text'],
  ['foot', 'Pie', 'foot'], ['target_division', 'Nivel objetivo', 'div'],
  ['graduation_year', 'Año graduación', 'text'], ['contact_phone', 'Tel. contacto familia', 'text'], ['contact_email', 'Email contacto familia', 'text'],
]

export default function PlayerEdit({ player }: { player: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState<Record<string, any>>(() => Object.fromEntries(FIELDS.map(([k]) => [k, player[k] ?? ''])))
  const set = (k: string, v: any) => setF(s => ({ ...s, [k]: v }))

  async function save() {
    setBusy(true)
    const patch: Record<string, any> = {}
    for (const [k] of FIELDS) {
      let v: any = f[k]
      if (v === '') v = null
      if (k === 'graduation_year') v = v ? Number(v) : null
      patch[k] = v
    }
    const { error } = await supabase.from('players').update(patch).eq('id', player.id)
    setBusy(false)
    if (error) { alert(error.message); return }
    setOpen(false); router.refresh()
  }

  const inp = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:border-[#0F5EFF] focus:outline-none bg-white'

  return (
    <div className="fade-up card-soft bg-white border border-slate-100 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Datos del jugador</h2>
        <button onClick={() => setOpen(o => !o)} className="text-[12.5px] font-semibold grad-text">{open ? 'Cancelar' : '✎ Editar datos'}</button>
      </div>
      {open && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {FIELDS.map(([k, label, type]) => (
              <label key={k} className="block">
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</span>
                {type === 'div' ? (
                  <select className={inp} value={f[k] ?? ''} onChange={e => set(k, e.target.value)}>{DIVS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                ) : type === 'foot' ? (
                  <select className={inp} value={f[k] ?? ''} onChange={e => set(k, e.target.value)}>{FEET.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                ) : (
                  <input className={inp} type={type === 'date' ? 'date' : 'text'} value={f[k] ?? ''} onChange={e => set(k, e.target.value)} />
                )}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-xl grad-accent text-white text-[13px] font-bold disabled:opacity-50 glow-brand">{busy ? 'Guardando…' : 'Guardar cambios'}</button>
            <button onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-semibold">Cancelar</button>
          </div>
        </>
      )}
    </div>
  )
}
