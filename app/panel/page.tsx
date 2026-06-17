import Link from 'next/link'
import { getDashboardStats } from '@/lib/queries'
import CountUp from './CountUp'
import TasksWidget from './TasksWidget'

const STAGE_LABELS: [string, string][] = [
  ['lead', 'Lead detectado'], ['first_contact', 'Primer contacto'], ['interested', 'Interesado'],
  ['docs_requested', 'Doc. solicitada'], ['contract_sent', 'Contrato enviado'],
  ['contract_signed', 'Contrato firmado'], ['initial_paid', 'Pago inicial'], ['active', 'Cliente activo'],
]
const DIV_LABELS: [string, string][] = [
  ['NCAA_D1', 'NCAA Division I'], ['NCAA_D2', 'NCAA Division II'], ['NCAA_D3', 'NCAA Division III'],
  ['NAIA', 'NAIA'], ['NJCAA', 'JUCO / NJCAA'],
]
const ICONS: Record<string, React.ReactNode> = {
  players: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.6" /><path d="M16 14.5a4.5 4.5 0 0 1 5 4.5" /></>,
  flow: <><path d="M4 7h10M4 12h16M4 17h7" /><circle cx="18" cy="7" r="2" fill="currentColor" /><circle cx="14" cy="17" r="2" fill="currentColor" /></>,
  check: <><path d="M20 7L9.5 17.5 4 12" /></>,
  cap: <><path d="M3 9l9-5 9 5-9 5-9-5z" /><path d="M21 9v5M7 11.5V16c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-4.5" /></>,
  conv: <><path d="M3 17l6-6 4 4 7-7M21 8V3h-5" /></>,
  cal: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
  alert: <><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>,
}

function Kpi({ i, icon, label, value, hint, suffix, color, href }: { i: number; icon: string; label: string; value: number; hint: string; suffix?: string; color?: string; href?: string }) {
  const inner = (
    <>
      <div className="w-11 h-11 rounded-xl grad-accent text-white grid place-items-center glow-brand">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-[20px] h-[20px]">{ICONS[icon]}</svg>
      </div>
      <div className="mt-4 text-[34px] leading-none font-extrabold tracking-tight tabular-nums" style={{ color: color ?? '#0F172A' }}>
        <CountUp value={value} />{suffix}
      </div>
      <div className="mt-2 text-[13.5px] font-semibold text-slate-600">{label}</div>
      <div className="mt-0.5 text-[11.5px] text-slate-400">{hint}</div>
    </>
  )
  const cls = "fade-up card-soft card-hover bg-white rounded-2xl p-5 border border-slate-100 block"
  return href
    ? <Link href={href} className={cls} style={{ animationDelay: `${i * 60}ms` }}>{inner}</Link>
    : <div className={cls} style={{ animationDelay: `${i * 60}ms` }}>{inner}</div>
}

export default async function DashboardPage() {
  const s = await getDashboardStats()
  const maxStage = Math.max(1, ...STAGE_LABELS.map(([id]) => s.byStage[id] ?? 0))
  const maxDiv = Math.max(1, ...DIV_LABELS.map(([id]) => s.byDivision[id] ?? 0))

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="fade-up">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Centro de operaciones</div>
        <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Buenos días, equipo ADM</h1>
        <p className="text-slate-500 text-[15px] mt-1.5">Tu resumen del día y cómo va la promoción de jugadores.</p>
      </div>

      <div data-tour="kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-7">
        <Kpi i={0} icon="players" label="Jugadores totales" value={s.total} hint="en cartera" href="/panel/jugadores" />
        <Kpi i={1} icon="flow" label="Camino a EE. UU." value={s.enProceso} hint="en proceso de captación" href="/panel/captacion" />
        <Kpi i={2} icon="check" label="En EE. UU." value={s.enUSA} hint="proceso cerrado · activos allí" color="#16B57C" href="/panel/jugadores?segmento=usa" />
        <Kpi i={3} icon="cap" label="Universidades" value={s.universidades} hint="en base de datos" href="/panel/universidades" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        <Kpi i={0} icon="conv" label="Conversión a activo" value={s.conversion} suffix="%" hint="del total en cartera" />
        <Kpi i={1} icon="cap" label="Ofertas este mes" value={s.ofertasMes} hint="becas recibidas" href="/panel/jugadores" />
        <Kpi i={2} icon="cal" label="Ofertas totales" value={s.ofertas} hint="histórico" />
        <Kpi i={3} icon="alert" label="En riesgo" value={s.enRiesgo} hint="parados +14 días" color={s.enRiesgo > 0 ? '#EF4444' : '#0F172A'} href="/panel/captacion" />
      </div>

      <div data-tour="tasks" className="mt-4"><TasksWidget /></div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mt-4">
        <div className="fade-up card-soft bg-white rounded-2xl border border-slate-100" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-[14.5px] text-slate-900">Pipeline por fase</h3>
            <Link href="/panel/captacion" className="text-[12.5px] font-semibold grad-text">Ver Kanban →</Link>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {STAGE_LABELS.map(([id, label]) => {
              const n = s.byStage[id] ?? 0
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-[12.5px] font-medium text-slate-500 w-36 shrink-0">{label}</span>
                  <div className="flex-1 bar-track h-2.5"><div className="bar-fill h-full" style={{ width: `${(n / maxStage) * 100}%` }} /></div>
                  <span className="text-[12.5px] font-bold text-slate-700 font-mono tabular-nums w-6 text-right">{n}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="fade-up card-soft bg-white rounded-2xl border border-slate-100" style={{ animationDelay: '180ms' }}>
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-bold text-[14.5px] text-slate-900">Por nivel</h3></div>
          <div className="p-5 flex flex-col gap-3">
            {DIV_LABELS.map(([id, label]) => {
              const n = s.byDivision[id] ?? 0
              return (
                <div key={id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12.5px] font-medium text-slate-600">{label}</span>
                    <span className="text-[12px] font-bold text-slate-700 font-mono tabular-nums">{n}</span>
                  </div>
                  <div className="bar-track h-2"><div className="bar-fill h-full" style={{ width: `${(n / maxDiv) * 100}%` }} /></div>
                </div>
              )
            })}
            {s.total === 0 && <p className="text-[12px] text-slate-400 mt-1">Aún sin jugadores. Aparecerán al completar el formulario.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
