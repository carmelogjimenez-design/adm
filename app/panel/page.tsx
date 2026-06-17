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
const TINT: Record<string, { bg: string; fg: string; bar: string }> = {
  blue: { bg: 'rgba(15,94,255,0.10)', fg: '#0F5EFF', bar: 'linear-gradient(90deg,#0F5EFF,#5B8CFF)' },
  green: { bg: 'rgba(22,181,124,0.12)', fg: '#16B57C', bar: 'linear-gradient(90deg,#16B57C,#39E6A5)' },
  violet: { bg: 'rgba(123,97,255,0.12)', fg: '#7B61FF', bar: 'linear-gradient(90deg,#7B61FF,#A78BFA)' },
  amber: { bg: 'rgba(224,165,38,0.14)', fg: '#D9930B', bar: 'linear-gradient(90deg,#E0A526,#F5C451)' },
  red: { bg: 'rgba(239,68,68,0.12)', fg: '#EF4444', bar: 'linear-gradient(90deg,#EF4444,#F87171)' },
  slate: { bg: 'rgba(100,116,139,0.12)', fg: '#64748B', bar: 'linear-gradient(90deg,#64748B,#94A3B8)' },
}

function Kpi({ i, icon, label, value, hint, suffix, tint = 'blue', href }: { i: number; icon: string; label: string; value: number; hint: string; suffix?: string; tint?: string; href?: string }) {
  const t = TINT[tint]
  const inner = (
    <>
      <span className="absolute left-0 right-0 top-0 h-1 rounded-t-2xl" style={{ background: t.bar }} />
      <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ background: t.bg, color: t.fg }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-[20px] h-[20px]">{ICONS[icon]}</svg>
      </div>
      <div className="mt-4 text-[32px] leading-none font-extrabold tracking-tight tabular-nums text-slate-900">
        <CountUp value={value} />{suffix}
      </div>
      <div className="mt-2 text-[13px] font-semibold text-slate-700">{label}</div>
      <div className="mt-0.5 text-[11.5px] text-slate-400">{hint}</div>
    </>
  )
  const cls = "relative overflow-hidden fade-up card-soft card-hover bg-white rounded-2xl p-5 pt-6 border border-slate-100 block"
  return href
    ? <Link href={href} className={cls} style={{ animationDelay: `${i * 55}ms` }}>{inner}</Link>
    : <div className={cls} style={{ animationDelay: `${i * 55}ms` }}>{inner}</div>
}

function ConversionCard({ value, activos, total }: { value: number; activos: number; total: number }) {
  const r = 54, c = 2 * Math.PI * r, off = c * (1 - Math.min(100, value) / 100)
  return (
    <div className="fade-up card-soft bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-5" style={{ animationDelay: '40ms' }}>
      <div className="relative shrink-0" style={{ width: 132, height: 132 }}>
        <svg viewBox="0 0 132 132" className="w-[132px] h-[132px] -rotate-90">
          <circle cx="66" cy="66" r={r} fill="none" stroke="#EEF2F7" strokeWidth="13" />
          <circle cx="66" cy="66" r={r} fill="none" stroke="url(#gconv)" strokeWidth="13" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
          <defs><linearGradient id="gconv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0F5EFF" /><stop offset="1" stopColor="#39E6A5" /></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-[26px] font-extrabold tracking-tight text-slate-900 tabular-nums"><CountUp value={value} />%</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">conversión</div>
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Embudo</div>
        <h3 className="text-[16px] font-extrabold text-slate-900 mt-1">De lead a cliente activo</h3>
        <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed"><b className="text-slate-800">{activos}</b> activos de <b className="text-slate-800">{total}</b> jugadores en cartera.</p>
        <Link href="/panel/captacion" className="inline-block mt-3 text-[12.5px] font-bold grad-text">Abrir Captación →</Link>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const s = await getDashboardStats()
  const maxStage = Math.max(1, ...STAGE_LABELS.map(([id]) => s.byStage[id] ?? 0))
  const maxDiv = Math.max(1, ...DIV_LABELS.map(([id]) => s.byDivision[id] ?? 0))
  const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="fade-up flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Centro de operaciones</div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Buenos días, equipo ADM</h1>
          <p className="text-slate-500 text-[15px] mt-1.5">Tu resumen del día y cómo va la promoción de jugadores.</p>
        </div>
        <div className="text-[12.5px] font-semibold text-slate-500 bg-white border border-slate-100 card-soft rounded-xl px-3.5 py-2 capitalize">{hoy}</div>
      </div>

      <div data-tour="kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-7">
        <Kpi i={0} icon="players" tint="blue" label="Jugadores totales" value={s.total} hint="en cartera" href="/panel/jugadores" />
        <Kpi i={1} icon="flow" tint="violet" label="Camino a EE. UU." value={s.enProceso} hint="en proceso de captación" href="/panel/captacion" />
        <Kpi i={2} icon="check" tint="green" label="En EE. UU." value={s.enUSA} hint="proceso cerrado · activos allí" href="/panel/jugadores?segmento=usa" />
        <Kpi i={3} icon="cap" tint="blue" label="Universidades" value={s.universidades} hint="en base de datos" href="/panel/universidades" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr] gap-3.5 mt-3.5">
        <ConversionCard value={s.conversion} activos={s.activos} total={s.total} />
        <Kpi i={1} icon="cap" tint="amber" label="Ofertas este mes" value={s.ofertasMes} hint="becas recibidas" href="/panel/jugadores" />
        <Kpi i={2} icon="alert" tint={s.enRiesgo > 0 ? 'red' : 'slate'} label="En riesgo" value={s.enRiesgo} hint="parados +14 días" href="/panel/captacion" />
      </div>

      <div data-tour="tasks" className="mt-3.5"><TasksWidget /></div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mt-3.5">
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
