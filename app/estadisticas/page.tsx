import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getMyPlayer } from '@/lib/queries'
import FamilyNav from '../FamilyNav'
import StatsManager from './StatsManager'

export default async function EstadisticasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getMyProfile()
  if (!profile || profile.status !== 'approved') redirect('/pendiente')
  if (profile.role !== 'family') redirect('/panel')
  const player = await getMyPlayer()

  return (
    <div className="app-aurora min-h-screen bg-[#FBFCFE]"><FamilyNav />
      <div className="max-w-2xl mx-auto px-5 py-7">
        <div className="fade-up mb-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">Tu rendimiento</div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Estadísticas</h1>
          <p className="text-slate-500 text-[15px] mt-1.5">Sube tus números temporada a temporada. Los coaches y tu asesor podrán seguir tu evolución.</p>
        </div>
        {player ? <div className="fade-up"><StatsManager playerId={player.id} /></div> : (
          <div className="fade-up card-soft bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <h2 className="text-[18px] font-extrabold text-slate-900">Primero, completa tu solicitud</h2>
            <Link href="/formulario" className="inline-flex mt-5 grad-accent text-white rounded-xl px-5 py-2.5 text-[14px] font-bold glow-brand">Ir a la solicitud →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
