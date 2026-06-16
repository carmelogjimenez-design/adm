import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getMyPlayer, getPlayerPhases } from '@/lib/queries'
import FamilyNav from '../FamilyNav'
import CaminoHorizontal from '../CaminoHorizontal'

const ST: Record<string, { label: string; chip: string; dot: string; node: string }> = {
  done: { label: 'Completada', chip: 'bg-[#39E6A5]/20 text-emerald-700', dot: '#16B57C', node: '#16B57C' },
  in_progress: { label: 'En curso', chip: 'bg-[#0F5EFF]/10 text-[#0F5EFF]', dot: '#0F5EFF', node: '#0F5EFF' },
  blocked: { label: 'En pausa', chip: 'bg-red-100 text-red-600', dot: '#EF4444', node: '#EF4444' },
  todo: { label: 'Pendiente', chip: 'bg-slate-100 text-slate-400', dot: '#CBD5E1', node: '#E2E8F0' },
}

export default async function MiCaminoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getMyProfile()
  if (!profile || profile.status !== 'approved') redirect('/pendiente')
  if (profile.role !== 'family') redirect('/panel')

  const player = await getMyPlayer()
  if (!player?.intake_completed) {
    return (
      <div className="app-aurora min-h-screen bg-[#FBFCFE]">
        <FamilyNav />
        <div className="max-w-3xl mx-auto px-5 py-10">
          <div className="fade-up card-soft bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div className="w-12 h-12 rounded-xl grad-accent text-white grid place-items-center mx-auto mb-4 glow-brand font-black">1</div>
            <h1 className="text-[20px] font-extrabold tracking-tight text-slate-900">Primero, completa tu solicitud</h1>
            <p className="text-[14px] text-slate-500 mt-2 max-w-sm mx-auto">Al enviarla se desbloquea tu camino con las 15 fases del proceso.</p>
            <Link href="/formulario" className="inline-flex items-center gap-1 mt-5 grad-accent text-white rounded-xl px-5 py-2.5 text-[14px] font-bold glow-brand">Ir a la solicitud →</Link>
          </div>
        </div>
      </div>
    )
  }

  const phases = (await getPlayerPhases(player.id)) as any[]
  const total = phases.length
  const done = phases.filter(p => p.status === 'done').length

  return (
    <div className="app-aurora min-h-screen bg-[#FBFCFE]">
      <FamilyNav />
      <div className="max-w-3xl mx-auto px-5 py-7">
        <div className="fade-up">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">El proceso, paso a paso</div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Mi camino</h1>
          <p className="text-slate-500 text-[15px] mt-1.5">Desde la captación hasta tu llegada al campus en EE. UU. · {done} de {total} completadas</p>
        </div>

        <div className="fade-up card-soft bg-white rounded-2xl p-5 border border-slate-100 mt-6">
          <CaminoHorizontal phases={phases as any} />
        </div>

        {/* timeline vertical */}
        <div className="fade-up mt-5 relative" style={{ animationDelay: '120ms' }}>
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slate-100" />
          <div className="flex flex-col gap-2.5">
            {phases.map((p, i) => {
              const st = ST[p.status] ?? ST.todo
              const isCurrent = p.status === 'in_progress'
              return (
                <div key={p.id} className="relative flex items-start gap-4">
                  <div className="relative z-10 shrink-0 w-10 h-10 rounded-full grid place-items-center text-[12px] font-bold text-white"
                    style={{ background: st.node, boxShadow: isCurrent ? '0 0 0 4px rgba(15,94,255,.15)' : 'none', color: p.status === 'todo' ? '#94A3B8' : '#fff' }}>
                    {p.status === 'done' ? '✓' : (p.phases?.phase_order ?? i + 1)}
                  </div>
                  <div className={'flex-1 card-soft bg-white rounded-2xl p-4 border transition ' + (isCurrent ? 'border-[#0F5EFF]/30 glow-brand' : 'border-slate-100')}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-bold text-slate-900">{p.phases?.name ?? 'Fase'}</span>
                      <span className={'text-[10.5px] font-bold px-2 py-0.5 rounded-full ' + st.chip}>{st.label}</span>
                      {isCurrent && <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full grad-accent text-white">Estás aquí</span>}
                    </div>
                    {p.phases?.description && <p className="text-[12.5px] text-slate-400 mt-1">{p.phases.description}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="fade-up mt-6 text-center" style={{ animationDelay: '180ms' }}>
          <p className="text-[13px] text-slate-400">¿Dudas sobre algún paso? <Link href="/ayuda" className="font-semibold grad-text">Visita la sección de Ayuda →</Link></p>
        </div>
      </div>
    </div>
  )
}
