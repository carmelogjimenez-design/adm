import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getMyPlayer, getPlayerPhases, getDocCategories, getMyDocuments } from '@/lib/queries'
import FamilyNav from '../FamilyNav'
import CaminoHorizontal from '../CaminoHorizontal'

const DIV: Record<string, string> = { NCAA_D1: 'NCAA D1', NCAA_D2: 'NCAA D2', NCAA_D3: 'NCAA D3', NAIA: 'NAIA', NJCAA: 'JUCO' }

function Ring({ pct }: { pct: number }) {
  const size = 132, stroke = 13, r = (size - stroke) / 2, C = 2 * Math.PI * r
  const off = C * (1 - pct / 100)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes ringIn{from{stroke-dashoffset:${C}}}` }} />
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0F5EFF" />
            <stop offset="100%" stopColor="#39E6A5" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF1F8" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off}
          style={{ animation: 'ringIn 1.1s ease-out both' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[30px] font-extrabold tracking-tight text-slate-900 leading-none tabular-nums">{pct}%</div>
          <div className="text-[10.5px] font-semibold text-slate-400 mt-1">del camino</div>
        </div>
      </div>
    </div>
  )
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2.5">
      <div className="h-full rounded-full grad-accent transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default async function InicioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getMyProfile()
  if (!profile || profile.status !== 'approved') redirect('/pendiente')
  if (profile.role !== 'family') redirect('/panel')

  const player = await getMyPlayer()
  const hasIntake = !!player?.intake_completed
  const name = player?.first_name || (profile.full_name?.split(' ')[0] ?? '')

  // Sin solicitud: primer paso
  if (!hasIntake) {
    return (
      <div className="app-aurora min-h-screen bg-[#FBFCFE]">
        <FamilyNav />
        <div className="max-w-3xl mx-auto px-5 py-7">
          <div className="fade-up">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">Tu proceso con ADM</div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Hola{name ? `, ${name}` : ''}</h1>
            <p className="text-slate-500 text-[15px] mt-1.5">Bienvenido a tu espacio. Empecemos por el primer paso.</p>
          </div>
          <Link href="/formulario" className="fade-up block mt-6 rounded-2xl grad-accent text-white p-6 glow-brand card-hover">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-90 mb-1.5">Primer paso</div>
            <div className="text-[20px] font-extrabold tracking-tight">Completa tu solicitud</div>
            <p className="text-[13.5px] opacity-95 mt-1.5 max-w-md">Rellena tus datos y firma. Al enviarla se desbloquea tu camino y el centro de documentos.</p>
            <span className="inline-flex items-center gap-1 mt-4 bg-white/20 rounded-lg px-3 py-1.5 text-[13px] font-bold">Empezar ahora →</span>
          </Link>
        </div>
      </div>
    )
  }

  const [phases, categories, docs] = await Promise.all([
    getPlayerPhases(player.id), getDocCategories(), getMyDocuments(player.id),
  ])
  const total = phases.length || 15
  const done = phases.filter((p: any) => p.status === 'done').length
  const journeyPct = Math.round((done / total) * 100)
  const current = phases.find((p: any) => p.status === 'in_progress') ?? phases.find((p: any) => p.status === 'todo') ?? phases[phases.length - 1]
  const reqCats = categories.filter((c: any) => c.required)
  const uploaded = reqCats.filter((c: any) => docs.some((d: any) => d.category_id === c.id)).length
  const docPct = Math.round((uploaded / Math.max(reqCats.length, 1)) * 100)
  const div = player?.target_division ? DIV[player.target_division] : null

  return (
    <div className="app-aurora min-h-screen bg-[#FBFCFE]">
      <FamilyNav />
      <div className="max-w-3xl mx-auto px-5 py-7">
        {/* HERO con anillo */}
        <div className="fade-up card-soft bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-6 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">Tu camino a EE. UU.</div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Hola, {name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[12px] font-semibold text-slate-500">Fase actual</span>
              {div && <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0F5EFF]/10 text-[#0F5EFF]">{div}</span>}
            </div>
            <div className="mt-1.5 text-[16px] font-bold text-slate-900">{current?.phases?.name ?? '—'}</div>
            <Link href="/mi-camino" className="inline-flex items-center gap-1 mt-3 text-[13px] font-semibold grad-text">Ver mi camino completo →</Link>
          </div>
          <Ring pct={journeyPct} />
        </div>

        {/* tarjetas de progreso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
          <Link href="/mi-camino" className="fade-up card-soft card-hover bg-white rounded-2xl p-5 border border-slate-100" style={{ animationDelay: '60ms' }}>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-slate-500">Fases del proceso</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#0F5EFF" strokeWidth="1.9" className="w-4 h-4"><path d="M4 7h10M4 12h16M4 17h7" /></svg>
            </div>
            <div className="text-[28px] font-extrabold tracking-tight text-slate-900 mt-2 tabular-nums">{done}<span className="text-slate-300 text-[18px]">/{total}</span></div>
            <Bar pct={journeyPct} />
            <div className="text-[11.5px] font-semibold grad-text mt-2">Ver mi camino →</div>
          </Link>

          <Link href="/documentos" className="fade-up card-soft card-hover bg-white rounded-2xl p-5 border border-slate-100" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-slate-500">Documentos</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#0F5EFF" strokeWidth="1.9" className="w-4 h-4"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /></svg>
            </div>
            <div className="text-[28px] font-extrabold tracking-tight text-slate-900 mt-2 tabular-nums">{uploaded}<span className="text-slate-300 text-[18px]">/{reqCats.length}</span></div>
            <Bar pct={docPct} />
            <div className="text-[11.5px] font-semibold grad-text mt-2">Subir documentos →</div>
          </Link>
        </div>

        {/* stepper del camino */}
        <div className="fade-up card-soft bg-white rounded-2xl p-5 border border-slate-100 mt-4" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Resumen del camino</h2>
            <span className="text-[11.5px] font-semibold text-slate-400">{done} de {total} completadas</span>
          </div>
          <CaminoHorizontal phases={phases as any} compact />
        </div>

        {/* acceso a solicitud */}
        <div className="fade-up mt-4" style={{ animationDelay: '200ms' }}>
          <Link href="/formulario" className="text-[13px] font-semibold text-slate-400 hover:text-slate-700">Revisar mis datos de la solicitud →</Link>
        </div>
      </div>
    </div>
  )
}
