import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getMyPlayer, getPlayerPhases, getDocCategories, getMyDocuments } from '@/lib/queries'
import FamilyNav from '../FamilyNav'
import CaminoHorizontal from '../CaminoHorizontal'

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

  // Si aun no hay ficha, no cargamos fases/documentos (no existen todavia)
  let phases: any[] = [], categories: any[] = [], docs: any[] = []
  if (player) {
    [phases, categories, docs] = await Promise.all([
      getPlayerPhases(player.id), getDocCategories(), getMyDocuments(player.id),
    ])
  }
  const done = phases.filter((p: any) => p.status === 'done').length
  const current = phases.find((p: any) => p.status === 'in_progress')
    ?? phases.find((p: any) => p.status === 'todo') ?? phases[phases.length - 1]
  const reqCats = categories.filter((c: any) => c.required)
  const uploaded = reqCats.filter((c: any) => docs.some((d: any) => d.category_id === c.id)).length

  return (
    <div className="app-aurora min-h-screen bg-[#FBFCFE]">
      <FamilyNav />
      <div className="max-w-3xl mx-auto px-5 py-7">
        <div className="fade-up">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">Tu proceso con ADM</div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Hola{name ? `, ${name}` : ''}</h1>
          <p className="text-slate-500 text-[15px] mt-1.5">
            {hasIntake ? <>Ahora mismo estás en: <b className="text-slate-700">{current?.phases?.name ?? '—'}</b></> : 'Bienvenido a tu espacio de ADM.'}
          </p>
        </div>

        {!hasIntake && (
          <Link href="/formulario" className="fade-up block mt-6 rounded-2xl grad-accent text-white p-6 glow-brand card-hover">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-90 mb-1.5">Primer paso</div>
            <div className="text-[20px] font-extrabold tracking-tight">Completa tu solicitud</div>
            <p className="text-[13.5px] opacity-95 mt-1.5 max-w-md">Es el primer paso del proceso: rellena tus datos y firma. Al enviarla, se desbloquea tu camino y el centro de documentos.</p>
            <span className="inline-flex items-center gap-1 mt-4 bg-white/20 rounded-lg px-3 py-1.5 text-[13px] font-bold">Empezar ahora →</span>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3.5 mt-4">
          <Link href={hasIntake ? '/mi-camino' : '/formulario'} className="fade-up card-soft card-hover bg-white rounded-2xl p-5 border border-slate-100">
            <div className="text-[12px] font-semibold text-slate-500">Tu camino</div>
            <div className="text-[32px] font-extrabold tracking-tight text-slate-900 mt-2 tabular-nums">{done}<span className="text-slate-300 text-[20px]">/{phases.length || 15}</span></div>
            <div className="text-[11.5px] font-semibold grad-text mt-1">{hasIntake ? 'Ver mi camino →' : 'Se desbloquea con tu solicitud'}</div>
          </Link>
          <Link href={hasIntake ? '/documentos' : '/formulario'} className="fade-up card-soft card-hover bg-white rounded-2xl p-5 border border-slate-100" style={{ animationDelay: '70ms' }}>
            <div className="text-[12px] font-semibold text-slate-500">Documentos</div>
            <div className="text-[32px] font-extrabold tracking-tight text-slate-900 mt-2 tabular-nums">{uploaded}<span className="text-slate-300 text-[20px]">/{reqCats.length || 0}</span></div>
            <div className="text-[11.5px] font-semibold grad-text mt-1">{hasIntake ? 'Subir documentos →' : 'Se desbloquea con tu solicitud'}</div>
          </Link>
        </div>

        {hasIntake && (
          <div className="fade-up card-soft bg-white rounded-2xl p-5 border border-slate-100 mt-4" style={{ animationDelay: '120ms' }}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block mb-4">Resumen del camino</h2>
            <CaminoHorizontal phases={phases as any} compact />
            <Link href="/mi-camino" className="inline-block mt-4 text-[13px] font-semibold grad-text">Ver el detalle de las 15 fases →</Link>
          </div>
        )}

        <div className="fade-up mt-4" style={{ animationDelay: '160ms' }}>
          <Link href="/formulario" className="text-[13px] font-semibold text-slate-400 hover:text-slate-700">
            {hasIntake ? 'Revisar mis datos de la solicitud →' : 'Ir a la solicitud →'}
          </Link>
        </div>
      </div>
    </div>
  )
}
