import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getMyPlayer, getPlayerPhases, getDocCategories, getMyDocuments, getOffers } from '@/lib/queries'
import FamilyNav from '../FamilyNav'
import CaminoHorizontal from '../CaminoHorizontal'

const DIV: Record<string, string> = { NCAA_D1: 'NCAA D1', NCAA_D2: 'NCAA D2', NCAA_D3: 'NCAA D3', NAIA: 'NAIA', NJCAA: 'JUCO' }
const OFFER_ST: Record<string, { label: string; cls: string }> = {
  received: { label: 'Oferta recibida', cls: 'bg-[#39E6A5]/20 text-emerald-700' },
  under_review: { label: 'En estudio', cls: 'bg-[#0F5EFF]/10 text-[#0F5EFF]' },
  accepted: { label: 'Aceptada', cls: 'bg-[#16B57C] text-white' },
  declined: { label: 'Rechazada', cls: 'bg-slate-100 text-slate-400' },
  expired: { label: 'Caducada', cls: 'bg-slate-100 text-slate-400' },
}

function Ring({ pct }: { pct: number }) {
  const size = 132, stroke = 13, r = (size - stroke) / 2, C = 2 * Math.PI * r
  const off = C * (1 - pct / 100)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes ringIn{from{stroke-dashoffset:${C}}}` }} />
      <svg width={size} height={size} className="-rotate-90">
        <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0F5EFF" /><stop offset="100%" stopColor="#39E6A5" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF1F8" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={off} style={{ animation: 'ringIn 1.1s ease-out both' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="text-[30px] font-extrabold tracking-tight text-slate-900 leading-none tabular-nums">{pct}%</div><div className="text-[10.5px] font-semibold text-slate-400 mt-1">del camino</div></div>
      </div>
    </div>
  )
}
const Bar = ({ pct }: { pct: number }) => (
  <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2.5"><div className="h-full rounded-full grad-accent transition-all duration-500" style={{ width: `${pct}%` }} /></div>
)

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

  if (!hasIntake) {
    return (
      <div className="app-aurora min-h-screen bg-[#FBFCFE]">
        <FamilyNav />
        <div className="max-w-3xl mx-auto px-5 py-7">
          <div className="fade-up">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">Empieza tu camino</div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Hola{name ? `, ${name}` : ''}</h1>
            <p className="text-slate-500 text-[15px] mt-1.5">Cada gran sueño empieza con un primer paso. El de {name || 'tu hijo/a'} empieza aquí.</p>
          </div>
          <Link href="/formulario" className="fade-up block mt-6 rounded-2xl grad-accent text-white p-6 glow-brand card-hover">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-90 mb-1.5">Primer paso</div>
            <div className="text-[20px] font-extrabold tracking-tight">Completa tu solicitud</div>
            <p className="text-[13.5px] opacity-95 mt-1.5 max-w-md">Rellena los datos y firma. Al enviarla se abre tu camino hacia EE. UU.</p>
            <span className="inline-flex items-center gap-1 mt-4 bg-white/20 rounded-lg px-3 py-1.5 text-[13px] font-bold">Empezar ahora →</span>
          </Link>
        </div>
      </div>
    )
  }

  const [phases, categories, docs, offers] = await Promise.all([
    getPlayerPhases(player.id), getDocCategories(), getMyDocuments(player.id), getOffers(player.id),
  ]) as [any[], any[], any[], any[]]

  const total = phases.length || 15
  const done = phases.filter(p => p.status === 'done').length
  const journeyPct = Math.round((done / total) * 100)
  const current = phases.find(p => p.status === 'in_progress') ?? phases.find(p => p.status === 'todo') ?? phases[phases.length - 1]
  const reqCats = categories.filter(c => c.required)
  const uploadedCats = reqCats.filter(c => docs.some(d => d.category_id === c.id))
  const uploaded = uploadedCats.length
  const docPct = Math.round((uploaded / Math.max(reqCats.length, 1)) * 100)
  const div = player?.target_division ? DIV[player.target_division] : null
  const liveOffers = offers.filter(o => !['declined', 'expired'].includes(o.status))

  // siguiente paso (lo que la familia controla)
  const missingDoc = reqCats.find(c => !docs.some(d => d.category_id === c.id))
  const nextStep = liveOffers.length
    ? { eyebrow: 'Gran noticia', title: `Tienes ${liveOffers.length} oferta${liveOffers.length > 1 ? 's' : ''} esperándote`, cta: 'Ver mis ofertas', href: '#ofertas' }
    : missingDoc
      ? { eyebrow: 'Tu siguiente paso', title: `Sube: ${missingDoc.name}`, cta: 'Subir documento', href: '/documentos' }
      : { eyebrow: 'Tu siguiente paso', title: current?.phases?.name ?? 'Sigue tu camino', cta: 'Ver mi camino', href: '/mi-camino' }

  const story = liveOffers.length
    ? `¡El sueño está más cerca, ${name}! Ya hay universidades interesadas.`
    : journeyPct === 0 ? `Cada gran fichaje empieza con un primer paso. Vamos a por ello, ${name}.`
      : journeyPct < 50 ? `Ya estás en marcha, ${name}. Cada documento te acerca a EE. UU.`
        : journeyPct < 100 ? `Recta final, ${name}. EE. UU. te espera.`
          : `¡Lo habéis conseguido! Nos vemos en el campus. 🎉`

  return (
    <div className="app-aurora min-h-screen bg-[#FBFCFE]">
      <FamilyNav />
      <div className="max-w-3xl mx-auto px-5 py-7">
        {/* HERO */}
        <div className="fade-up card-soft bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-6 flex-wrap">
          <div className="flex-1 min-w-[210px]">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">El camino de {name} a EE. UU.</div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 leading-tight">{story}</h1>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[12px] font-semibold text-slate-500">Fase actual:</span>
              <span className="text-[13px] font-bold text-slate-900">{current?.phases?.name ?? '—'}</span>
              {div && <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0F5EFF]/10 text-[#0F5EFF]">{div}</span>}
            </div>
          </div>
          <Ring pct={journeyPct} />
        </div>

        {/* SIGUIENTE PASO */}
        <Link href={nextStep.href} className="fade-up block mt-4 rounded-2xl grad-accent text-white p-5 glow-brand card-hover" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-90 mb-1">{nextStep.eyebrow}</div>
              <div className="text-[19px] font-extrabold tracking-tight">{nextStep.title}</div>
            </div>
            <span className="inline-flex items-center gap-1 bg-white/20 rounded-lg px-3.5 py-2 text-[13px] font-bold whitespace-nowrap">{nextStep.cta} →</span>
          </div>
        </Link>

        {/* OFERTAS */}
        <div id="ofertas" className="fade-up mt-6" style={{ animationDelay: '100ms' }}>
          <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] grad-text inline-block mb-3">Tus ofertas</h2>
          {liveOffers.length === 0 ? (
            <div className="card-soft bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
              <div className="text-[15px] font-bold text-slate-700">Aún no hay ofertas… ¡pero esto acaba de empezar!</div>
              <p className="text-[13px] text-slate-400 mt-1.5 max-w-md mx-auto">Cuando una universidad se interese, aparecerá aquí. Completa tu perfil y tus documentos para que los coaches te vean. 💪</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {offers.map((o: any) => {
                const st = OFFER_ST[o.status] ?? OFFER_ST.received
                const uni = Array.isArray(o.universities) ? o.universities[0] : o.universities
                return (
                  <div key={o.id} className="card-soft bg-white rounded-2xl border border-[#39E6A5]/40 p-4 flex items-center gap-4 flex-wrap">
                    <div className="w-11 h-11 rounded-xl grad-accent text-white grid place-items-center shrink-0 glow-brand">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 9l9-5 9 5-9 5-9-5z" /><path d="M21 9v5M7 11.5V16c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-4.5" /></svg>
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <div className="text-[15px] font-extrabold text-slate-900">{uni?.name ?? 'Universidad'}</div>
                      <div className="text-[12px] text-slate-400">{uni?.division ? DIV[uni.division] : ''}{uni?.state ? ` · ${uni.state}` : ''}</div>
                    </div>
                    <div className="text-right shrink-0">
                      {o.scholarship_pct != null && <div className="text-[22px] font-extrabold tracking-tight grad-text leading-none">{o.scholarship_pct}%</div>}
                      <div className="text-[11px] text-slate-400 mt-0.5">beca</div>
                    </div>
                    <span className={'text-[10.5px] font-bold px-2.5 py-1 rounded-full shrink-0 ' + st.cls}>{st.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* PROGRESO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
          <Link href="/mi-camino" className="fade-up card-soft card-hover bg-white rounded-2xl p-5 border border-slate-100" style={{ animationDelay: '140ms' }}>
            <span className="text-[12.5px] font-semibold text-slate-500">Fases del proceso</span>
            <div className="text-[28px] font-extrabold tracking-tight text-slate-900 mt-2 tabular-nums">{done}<span className="text-slate-300 text-[18px]">/{total}</span></div>
            <Bar pct={journeyPct} /><div className="text-[11.5px] font-semibold grad-text mt-2">Ver mi camino →</div>
          </Link>
          <Link href="/documentos" className="fade-up card-soft card-hover bg-white rounded-2xl p-5 border border-slate-100" style={{ animationDelay: '180ms' }}>
            <span className="text-[12.5px] font-semibold text-slate-500">Documentos</span>
            <div className="text-[28px] font-extrabold tracking-tight text-slate-900 mt-2 tabular-nums">{uploaded}<span className="text-slate-300 text-[18px]">/{reqCats.length}</span></div>
            <Bar pct={docPct} /><div className="text-[11.5px] font-semibold grad-text mt-2">Subir documentos →</div>
          </Link>
        </div>

        <div className="fade-up card-soft bg-white rounded-2xl p-5 border border-slate-100 mt-4" style={{ animationDelay: '220ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Resumen del camino</h2>
            <span className="text-[11.5px] font-semibold text-slate-400">{done} de {total} completadas</span>
          </div>
          <CaminoHorizontal phases={phases as any} compact />
        </div>

        <div className="fade-up mt-4" style={{ animationDelay: '260ms' }}>
          <Link href="/formulario" className="text-[13px] font-semibold text-slate-400 hover:text-slate-700">Revisar mis datos de la solicitud →</Link>
        </div>
      </div>
    </div>
  )
}
