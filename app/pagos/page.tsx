import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getMyPlayer, getContract, getPayments } from '@/lib/queries'
import FamilyNav from '../FamilyNav'

const money = (n: number, c = 'EUR') => new Intl.NumberFormat('es-ES', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n)
const CONTRACT: Record<string, { label: string; cls: string }> = {
  draft: { label: 'En preparación', cls: 'bg-slate-100 text-slate-500' },
  sent: { label: 'Enviado para firma', cls: 'bg-[#0F5EFF]/10 text-[#0F5EFF]' },
  signed: { label: 'Firmado', cls: 'bg-[#39E6A5]/20 text-emerald-700' },
  active: { label: 'Activo', cls: 'bg-[#39E6A5]/20 text-emerald-700' },
  expired: { label: 'Caducado', cls: 'bg-slate-100 text-slate-400' },
}
function payState(p: any) {
  if (p.status === 'paid') return { label: 'Pagado', cls: 'bg-[#39E6A5]/20 text-emerald-700' }
  if (p.status === 'refunded') return { label: 'Devuelto', cls: 'bg-slate-100 text-slate-400' }
  if (p.due_date && new Date(p.due_date) < new Date()) return { label: 'Vencido', cls: 'bg-red-100 text-red-600' }
  return { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700' }
}

export default async function PagosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getMyProfile()
  if (!profile || profile.status !== 'approved') redirect('/pendiente')
  if (profile.role !== 'family') redirect('/panel')

  const player = await getMyPlayer()
  if (!player?.intake_completed) {
    return (
      <div className="app-aurora min-h-screen bg-[#FBFCFE]"><FamilyNav />
        <div className="max-w-2xl mx-auto px-5 py-10">
          <div className="card-soft bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <h1 className="text-[18px] font-extrabold text-slate-900">Primero, completa tu solicitud</h1>
            <Link href="/formulario" className="inline-flex mt-5 grad-accent text-white rounded-xl px-5 py-2.5 text-[14px] font-bold glow-brand">Ir a la solicitud →</Link>
          </div>
        </div>
      </div>
    )
  }

  const [contract, payments] = await Promise.all([getContract(player.id), getPayments(player.id)])
  const cur = (payments[0] as any)?.currency || contract?.currency || 'EUR'
  const paid = payments.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
  const pending = payments.filter((p: any) => ['pending', 'overdue'].includes(p.status)).reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
  const cst = contract ? (CONTRACT[contract.status] ?? CONTRACT.draft) : null

  return (
    <div className="app-aurora min-h-screen bg-[#FBFCFE]"><FamilyNav />
      <div className="max-w-2xl mx-auto px-5 py-7">
        <div className="fade-up mb-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">Tu plan con ADM</div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Pagos y contrato</h1>
          <p className="text-slate-500 text-[15px] mt-1.5">Aquí ves el estado de tu contrato y tus cuotas. Si tienes dudas, escribe a tu asesor.</p>
        </div>

        {/* contrato */}
        <div className="fade-up card-soft bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-slate-500">Contrato de servicios</span>
            {cst && <span className={'text-[11px] font-bold px-2.5 py-1 rounded-full ' + cst.cls}>{cst.label}</span>}
          </div>
          {contract ? (
            <div className="flex items-end justify-between mt-2 flex-wrap gap-2">
              <div className="text-[26px] font-extrabold tracking-tight text-slate-900">{contract.amount != null ? money(Number(contract.amount), contract.currency || 'EUR') : '—'}</div>
              {contract.document_url && <a href={contract.document_url} target="_blank" rel="noopener" className="text-[12.5px] font-semibold grad-text">Ver contrato →</a>}
            </div>
          ) : <p className="text-[13px] text-slate-400 mt-1.5">Tu contrato aún no está disponible. Tu asesor lo preparará en breve.</p>}
        </div>

        {/* resumen cuotas */}
        <div className="fade-up grid grid-cols-2 gap-3.5 mt-4" style={{ animationDelay: '60ms' }}>
          <div className="card-soft bg-white rounded-2xl p-5 border border-slate-100">
            <div className="text-[12px] font-semibold text-slate-500">Pagado</div>
            <div className="text-[24px] font-extrabold tracking-tight text-emerald-600 mt-1">{money(paid, cur)}</div>
          </div>
          <div className="card-soft bg-white rounded-2xl p-5 border border-slate-100">
            <div className="text-[12px] font-semibold text-slate-500">Pendiente</div>
            <div className="text-[24px] font-extrabold tracking-tight text-slate-900 mt-1">{money(pending, cur)}</div>
          </div>
        </div>

        {/* cuotas */}
        <h2 className="fade-up text-[12px] font-bold uppercase tracking-[0.14em] grad-text inline-block mt-6 mb-3">Tus cuotas</h2>
        {payments.length === 0 ? (
          <div className="card-soft bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center text-[13px] text-slate-400">Aún no hay cuotas registradas.</div>
        ) : (
          <div className="card-soft bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
            {payments.map((p: any) => {
              const st = payState(p)
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold text-slate-900">{p.concept || 'Cuota'}</div>
                    <div className="text-[11.5px] text-slate-400">{p.due_date ? `Vence ${new Date(p.due_date).toLocaleDateString('es-ES')}` : 'Sin fecha'}</div>
                  </div>
                  <div className="text-[14px] font-extrabold text-slate-900 tabular-nums">{money(Number(p.amount || 0), p.currency || cur)}</div>
                  <span className={'text-[10.5px] font-bold px-2.5 py-1 rounded-full shrink-0 ' + st.cls}>{st.label}</span>
                </div>
              )
            })}
          </div>
        )}
        <p className="fade-up text-[12px] text-slate-400 mt-4">¿Una duda con un pago? <Link href="/mensajes" className="font-semibold grad-text">Escribe a tu asesor →</Link></p>
      </div>
    </div>
  )
}
