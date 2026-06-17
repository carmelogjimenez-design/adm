'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { openInvoicePrint } from '@/lib/invoicePdf'

const money = (n: number, c = 'EUR') => new Intl.NumberFormat('es-ES', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n)
const CSTATUS: [string, string][] = [['draft', 'Borrador'], ['sent', 'Enviado'], ['signed', 'Firmado'], ['active', 'Activo'], ['expired', 'Caducado']]

export default function FinanceEditor({ playerId }: { playerId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [contract, setContract] = useState<any>(null)
  const [player, setPlayer] = useState<any>(null)
  const [invNo, setInvNo] = useState<Record<string, string>>({})
  const [pays, setPays] = useState<any[]>([])
  const [cAmount, setCAmount] = useState('')
  const [cStatus, setCStatus] = useState('draft')
  const [np, setNp] = useState({ concept: '', amount: '', due_date: '' })
  const [busy, setBusy] = useState(false)

  async function load() {
    const [{ data: c }, { data: p }, { data: pl }] = await Promise.all([
      supabase.from('contracts').select('*').eq('player_id', playerId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('payments').select('id, concept, amount, currency, status, due_date, paid_at, invoice_number, invoice_at').eq('player_id', playerId).order('due_date'),
      supabase.from('players').select('first_name, last_name, contact_name, dni, address, contact_email').eq('id', playerId).maybeSingle(),
    ])
    setContract(c); setPays(p ?? []); setPlayer(pl)
    setInvNo(Object.fromEntries((p ?? []).map((x: any) => [x.id, x.invoice_number || `${new Date().getFullYear()}/`])))
    if (c) { setCAmount(c.amount ?? ''); setCStatus(c.status ?? 'draft') }
  }
  useEffect(() => { load() }, [playerId])

  async function saveContract() {
    setBusy(true)
    const patch = { status: cStatus, amount: cAmount ? Number(cAmount) : null, signed_at: ['signed', 'active'].includes(cStatus) ? new Date().toISOString() : null }
    const { error } = contract
      ? await supabase.from('contracts').update(patch).eq('id', contract.id)
      : await supabase.from('contracts').insert({ player_id: playerId, ...patch })
    setBusy(false)
    if (error) { alert(error.message); return }
    load(); router.refresh()
  }
  async function addPay() {
    if (!np.amount) { alert('Indica el importe'); return }
    setBusy(true)
    const { error } = await supabase.from('payments').insert({ player_id: playerId, concept: np.concept || 'Cuota', amount: Number(np.amount), due_date: np.due_date || null, status: 'pending' })
    setBusy(false)
    if (error) { alert(error.message); return }
    setNp({ concept: '', amount: '', due_date: '' }); load(); router.refresh()
  }
  async function togglePay(p: any) {
    const paid = p.status === 'paid'
    await supabase.from('payments').update({ status: paid ? 'pending' : 'paid', paid_at: paid ? null : new Date().toISOString() }).eq('id', p.id)
    load(); router.refresh()
  }
  async function invoice(p: any) {
    const num = (invNo[p.id] ?? '').trim()
    if (!num || num.endsWith('/')) { alert('Escribe el número de factura (ej. 2026/6)'); return }
    const { error } = await supabase.from('payments').update({ invoice_number: num, invoice_at: new Date().toISOString() }).eq('id', p.id)
    if (error) { alert(error.message); return }
    const clientName = player?.contact_name || `${player?.first_name ?? ''} ${player?.last_name ?? ''}`.trim()
    openInvoicePrint({
      number: num, client_name: clientName, client_dni: player?.dni || '', client_address: player?.address || '',
      concept: p.concept || 'Servicios de asesoramiento ADM', base: Number(p.amount || 0), currency: p.currency || 'EUR',
    })
    load()
  }
  async function delPay(id: string) { if (confirm('¿Eliminar cuota?')) { await supabase.from('payments').delete().eq('id', id); load(); router.refresh() } }

  const inp = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:border-[#0F5EFF] focus:outline-none bg-white'
  const paid = pays.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0)
  const pend = pays.filter(p => ['pending', 'overdue'].includes(p.status)).reduce((s, p) => s + Number(p.amount || 0), 0)

  return (
    <div className="fade-up card-soft bg-white border border-slate-100 rounded-2xl p-5">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block mb-3">Finanzas</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end p-3 rounded-xl bg-slate-50/70 mb-4">
        <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Contrato (importe)</span><input className={inp} type="number" value={cAmount} onChange={e => setCAmount(e.target.value)} /></label>
        <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Estado contrato</span>
          <select className={inp} value={cStatus} onChange={e => setCStatus(e.target.value)}>{CSTATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <button onClick={saveContract} disabled={busy} className="py-2 rounded-lg grad-accent text-white text-[12.5px] font-bold disabled:opacity-50">Guardar contrato</button>
      </div>

      <div className="flex items-center gap-4 mb-3 text-[12px]">
        <span className="font-semibold text-slate-500">Cobrado: <b className="text-emerald-600">{money(paid)}</b></span>
        <span className="font-semibold text-slate-500">Pendiente: <b className="text-slate-900">{money(pend)}</b></span>
      </div>

      <div className="flex flex-col gap-2">
        {pays.map(p => {
          const overdue = p.status === 'pending' && p.due_date && new Date(p.due_date) < new Date()
          return (
            <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 flex-wrap">
              <button onClick={() => togglePay(p)} className={'w-5 h-5 rounded-md border grid place-items-center shrink-0 ' + (p.status === 'paid' ? 'bg-[#16B57C] border-[#16B57C] text-white' : 'border-slate-300')}>
                {p.status === 'paid' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M5 12l5 5L20 7" /></svg>}
              </button>
              <span className="flex-1 min-w-[120px] text-[13px] font-semibold text-slate-800">{p.concept || 'Cuota'}{p.due_date ? <span className={'font-normal ' + (overdue ? 'text-red-500' : 'text-slate-400')}> · {new Date(p.due_date).toLocaleDateString('es-ES')}{overdue ? ' (vencida)' : ''}</span> : ''}</span>
              <span className="text-[13px] font-extrabold text-slate-900 tabular-nums">{money(Number(p.amount || 0), p.currency || 'EUR')}</span>
              <input value={invNo[p.id] ?? ''} onChange={e => setInvNo(s => ({ ...s, [p.id]: e.target.value }))} placeholder="Nº factura"
                className="w-24 px-2 py-1 rounded-md border border-slate-200 text-[11.5px] focus:border-[#0F5EFF] focus:outline-none" title="Número de factura (lo escribes tú)" />
              <button onClick={() => invoice(p)} className="text-[11.5px] font-bold grad-text whitespace-nowrap" title={p.invoice_number ? 'Re-descargar factura ' + p.invoice_number : 'Generar factura'}>{p.invoice_number ? 'Factura ✓' : 'Factura'}</button>
              <button onClick={() => delPay(p.id)} className="text-[11.5px] font-semibold text-red-500">Eliminar</button>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end mt-3 p-3 rounded-xl bg-slate-50/70">
        <label className="block sm:col-span-2"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Concepto</span><input className={inp} value={np.concept} onChange={e => setNp(s => ({ ...s, concept: e.target.value }))} placeholder="Cuota inicial…" /></label>
        <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Importe</span><input className={inp} type="number" value={np.amount} onChange={e => setNp(s => ({ ...s, amount: e.target.value }))} /></label>
        <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Vence</span><input className={inp} type="date" value={np.due_date} onChange={e => setNp(s => ({ ...s, due_date: e.target.value }))} /></label>
        <button onClick={addPay} disabled={busy} className="sm:col-span-4 py-2 rounded-lg border border-[#0F5EFF] text-[#0F5EFF] text-[12.5px] font-bold disabled:opacity-50">+ Añadir cuota</button>
      </div>
    </div>
  )
}
