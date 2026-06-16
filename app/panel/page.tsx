import Link from 'next/link'
import { getDashboardStats } from '@/lib/queries'

const STAGE_LABELS: [string, string][] = [
  ['lead', 'Lead detectado'], ['first_contact', 'Primer contacto'], ['interested', 'Interesado'],
  ['docs_requested', 'Doc. solicitada'], ['contract_sent', 'Contrato enviado'],
  ['contract_signed', 'Contrato firmado'], ['initial_paid', 'Pago inicial'], ['active', 'Cliente activo'],
]

function Kpi({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 transition hover:shadow-[0_8px_24px_-10px_rgba(16,30,70,0.16)]">
      <div className="text-[12px] font-semibold text-slate-500">{label}</div>
      <div className="text-3xl font-extrabold tracking-tight mt-3 font-mono text-slate-900">{value}</div>
      {hint && <div className="text-[11.5px] font-semibold text-slate-400 mt-2">{hint}</div>}
    </div>
  )
}

export default async function DashboardPage() {
  const s = await getDashboardStats()
  const maxStage = Math.max(1, ...STAGE_LABELS.map(([id]) => s.byStage[id] ?? 0))

  return (
    <div className="max-w-5xl mx-auto px-8 py-7">
      <div className="text-[11px] font-bold uppercase tracking-widest text-[#0F5EFF] mb-1.5">Centro de operaciones</div>
      <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Dashboard</h1>
      <p className="text-slate-500 text-sm mt-1.5 mb-6">Visión global del negocio de becas · temporada 2025–26.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Kpi label="Jugadores totales" value={s.total} hint="en cartera" />
        <Kpi label="En proceso" value={s.enProceso} hint="activos en pipeline" />
        <Kpi label="Clientes activos" value={s.activos} hint="proceso en marcha" />
        <Kpi label="Universidades" value={s.universidades} hint="en base de datos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 mt-4">
        <div className="bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-[14.5px] text-slate-900">Pipeline por fase</h3>
            <Link href="/panel/captacion" className="text-[12.5px] font-semibold text-[#0F5EFF]">Ver Kanban →</Link>
          </div>
          <div className="p-5 flex flex-col gap-2.5">
            {STAGE_LABELS.map(([id, label]) => {
              const n = s.byStage[id] ?? 0
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-[12.5px] font-medium text-slate-500 w-36 shrink-0">{label}</span>
                  <div className="flex-1 h-7 rounded-lg bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-lg bg-gradient-to-r from-[#0F5EFF] to-[#39E6A5] flex items-center px-2.5 text-white text-[12px] font-bold font-mono"
                      style={{ width: `${Math.max((n / maxStage) * 100, n > 0 ? 14 : 0)}%` }}>
                      {n > 0 ? n : ''}
                    </div>
                  </div>
                  <span className="text-[12px] font-bold text-slate-300 font-mono w-5 text-right">{n}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-[14.5px] text-slate-900 mb-4">Accesos rápidos</h3>
          <div className="flex flex-col gap-2.5">
            <Link href="/panel/jugadores" className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-[#0F5EFF] hover:bg-slate-50 transition">
              <span className="text-[13.5px] font-semibold text-slate-700">Ver jugadores</span>
              <span className="text-slate-300">→</span>
            </Link>
            <Link href="/panel/captacion" className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-[#0F5EFF] hover:bg-slate-50 transition">
              <span className="text-[13.5px] font-semibold text-slate-700">Pipeline de captación</span>
              <span className="text-slate-300">→</span>
            </Link>
          </div>
          {s.total === 0 && (
            <p className="text-[12px] text-slate-400 mt-4 leading-relaxed">
              Aún no hay jugadores. En cuanto una familia complete el formulario, aparecerá aquí automáticamente.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
