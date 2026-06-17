import Link from 'next/link'
import { getFinanceOverview } from '@/lib/queries'

const money = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export default async function FinanzasPage() {
  const rows = (await getFinanceOverview()) as any[]
  const today = new Date()
  const isOverdue = (p: any) => p.status === 'pending' && p.due_date && new Date(p.due_date) < today
  const cobrado = rows.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0)
  const pendiente = rows.filter(p => ['pending', 'overdue'].includes(p.status)).reduce((s, p) => s + Number(p.amount || 0), 0)
  const vencido = rows.filter(isOverdue).reduce((s, p) => s + Number(p.amount || 0), 0)

  const KPI = ({ k, v, color }: { k: string; v: string; color: string }) => (
    <div className="card-soft bg-white rounded-2xl p-5 border border-slate-100">
      <div className="text-[12px] font-semibold text-slate-500">{k}</div>
      <div className="text-[26px] font-extrabold tracking-tight mt-1" style={{ color }}>{v}</div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="fade-up">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Control de cobros</div>
        <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Finanzas</h1>
      </div>
      <div className="fade-up grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
        <KPI k="Cobrado" v={money(cobrado)} color="#16B57C" />
        <KPI k="Pendiente" v={money(pendiente)} color="#0F172A" />
        <KPI k="Vencido" v={money(vencido)} color="#EF4444" />
      </div>

      <div className="fade-up card-soft bg-white rounded-2xl border border-slate-100 mt-5 overflow-hidden" style={{ animationDelay: '80ms' }}>
        <table className="w-full border-collapse">
          <thead><tr className="bg-slate-50/70">{['Jugador', 'Concepto', 'Importe', 'Vence', 'Estado'].map((h, i) => <th key={i} className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-[13px] text-slate-400">Aún no hay pagos registrados.</td></tr>}
            {rows.map(p => {
              const pl = Array.isArray(p.players) ? p.players[0] : p.players
              const overdue = isOverdue(p)
              const st = p.status === 'paid' ? ['Pagado', 'bg-[#39E6A5]/20 text-emerald-700'] : overdue ? ['Vencido', 'bg-red-100 text-red-600'] : p.status === 'refunded' ? ['Devuelto', 'bg-slate-100 text-slate-400'] : ['Pendiente', 'bg-amber-100 text-amber-700']
              return (
                <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">{pl ? <Link href={`/panel/jugadores/${pl.id}`} className="text-[13px] font-bold text-slate-900 hover:text-[#0F5EFF]">{pl.first_name} {pl.last_name}</Link> : '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-600">{p.concept || 'Cuota'}</td>
                  <td className="px-4 py-3 text-[13px] font-bold text-slate-900 tabular-nums">{money(Number(p.amount || 0))}</td>
                  <td className="px-4 py-3 text-[12.5px] text-slate-400">{p.due_date ? new Date(p.due_date).toLocaleDateString('es-ES') : '—'}</td>
                  <td className="px-4 py-3"><span className={'text-[10.5px] font-bold px-2.5 py-1 rounded-full ' + st[1]}>{st[0]}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
