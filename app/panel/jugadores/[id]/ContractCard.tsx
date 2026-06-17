'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { openContractPrint, ContractTerms } from '@/lib/contractPdf'

const ST: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Borrador', cls: 'bg-slate-100 text-slate-500' },
  sent: { label: 'Enviado · pendiente de firma', cls: 'bg-amber-100 text-amber-700' },
  signed: { label: 'Firmado', cls: 'bg-[#39E6A5]/20 text-emerald-700' },
  active: { label: 'Activo', cls: 'bg-[#39E6A5]/20 text-emerald-700' },
}
const today = () => new Date().toLocaleDateString('es-ES')

export default function ContractCard({ playerId, player }: { playerId: string; player: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [c, setC] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [t, setT] = useState<ContractTerms>({})

  function defaults(existing: any): ContractTerms {
    const saved = existing?.terms ?? {}
    return {
      city: saved.city ?? 'Valladolid', date: saved.date ?? today(),
      student_name: saved.student_name ?? `${player.first_name ?? ''} ${player.last_name ?? ''}`.trim(),
      student_dni: saved.student_dni ?? player.dni ?? '',
      student_address: saved.student_address ?? player.address ?? '',
      father_name: saved.father_name ?? player.contact_name ?? '',
      father_dni: saved.father_dni ?? '', mother_name: saved.mother_name ?? '', mother_dni: saved.mother_dni ?? '',
      amount1: saved.amount1 ?? '1.200€ + IVA (1.420€ IVA Incl.)',
      amount2: saved.amount2 ?? '1.800€ + IVA (2.178€ IVA Incl.)',
      family_email: saved.family_email ?? player.contact_email ?? player.email ?? '',
    }
  }
  async function load() {
    const { data } = await supabase.from('contracts').select('*').eq('player_id', playerId).order('created_at', { ascending: false }).limit(1).maybeSingle()
    setC(data); setT(defaults(data))
  }
  useEffect(() => { load() }, [playerId])

  const set = (k: keyof ContractTerms, val: string) => setT(s => ({ ...s, [k]: val }))

  async function save(send: boolean) {
    setBusy(true)
    const patch: any = { terms: t }
    if (send) { patch.status = 'sent'; patch.sent_at = new Date().toISOString() }
    const { error } = c
      ? await supabase.from('contracts').update(patch).eq('id', c.id)
      : await supabase.from('contracts').insert({ player_id: playerId, status: send ? 'sent' : 'draft', amount: 3000, currency: 'EUR', terms: t, sent_at: send ? new Date().toISOString() : null })
    setBusy(false)
    if (error) { alert(error.message); return }
    setOpen(false); load(); router.refresh()
  }

  const inp = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:border-[#0F5EFF] focus:outline-none bg-white'
  const st = c ? (ST[c.status] ?? ST.draft) : null
  const F = ([k, label]: [keyof ContractTerms, string]) => (
    <label key={k} className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</span>
      <input className={inp} value={(t[k] as string) ?? ''} onChange={e => set(k, e.target.value)} /></label>
  )

  return (
    <div className="fade-up card-soft bg-white border border-slate-100 rounded-2xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Contrato de servicios</h2>
        {st && <span className={'text-[11px] font-bold px-2.5 py-1 rounded-full ' + st.cls}>{st.label}</span>}
      </div>

      {c?.status === 'signed' && (
        <p className="text-[12.5px] text-emerald-600 font-semibold mt-2">✓ Firmado el {c.signed_at ? new Date(c.signed_at).toLocaleDateString('es-ES') : ''}{c.signer_name ? ` por ${c.signer_name}` : ''}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={() => setOpen(o => !o)} className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-[12.5px] font-semibold">{open ? 'Cerrar datos' : (c ? 'Editar datos' : 'Crear contrato')}</button>
        {c && <button onClick={() => openContractPrint(t, c.family_signature, c.signer_name, c.signed_at)} className="px-3.5 py-2 rounded-lg grad-accent text-white text-[12.5px] font-bold glow-brand">Descargar PDF</button>}
        {c && c.status !== 'signed' && <button onClick={() => save(true)} disabled={busy} className="px-3.5 py-2 rounded-lg border border-[#0F5EFF] text-[#0F5EFF] text-[12.5px] font-bold disabled:opacity-50">{c.status === 'sent' ? 'Reenviar a la familia' : 'Enviar a la familia'}</button>}
      </div>

      {open && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 p-3 rounded-xl bg-slate-50/70">
            {([['city', 'Ciudad'], ['date', 'Fecha'], ['student_name', 'Estudiante'], ['student_dni', 'DNI estudiante'], ['student_address', 'Domicilio'], ['father_name', 'Padre'], ['father_dni', 'DNI padre'], ['mother_name', 'Madre'], ['mother_dni', 'DNI madre'], ['family_email', 'Email familia'], ['amount1', '1er pago'], ['amount2', '2º pago']] as [keyof ContractTerms, string][]).map(F)}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => save(false)} disabled={busy} className="px-4 py-2 rounded-lg grad-accent text-white text-[12.5px] font-bold disabled:opacity-50">{busy ? 'Guardando…' : 'Guardar datos'}</button>
            <button onClick={() => openContractPrint(t, c?.family_signature, c?.signer_name, c?.signed_at)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-[12.5px] font-semibold">Vista previa PDF</button>
          </div>
        </>
      )}
    </div>
  )
}
