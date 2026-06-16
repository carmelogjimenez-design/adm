import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPhases, getPlayers, getMyProfile } from '@/lib/queries'
import LogoutButton from '@/app/logout-button'

export default async function PanelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getMyProfile()
  if (!profile || profile.status !== 'approved') redirect('/pendiente')

  // La familia va a su formulario / proceso
  if (profile.role === 'family') redirect('/formulario')

  const phases = await getPhases()
  const players = await getPlayers()

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center font-black text-xs">ADM</div>
            <h1 className="text-xl font-bold text-slate-900">Conexion OK</h1>
          </div>
          <div className="flex items-center gap-4">
            {profile.is_superadmin && (
              <Link href="/admin/solicitudes" className="text-sm font-semibold text-[#0F5EFF]">Solicitudes</Link>
            )}
            <LogoutButton />
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">{profile.full_name || user.email} - rol <b>{profile.role}</b></p>

        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Fases del workflow ({phases?.length ?? 0})</h2>
        <ol className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 mb-8">
          {phases?.map((p: any) => (
            <li key={p.phase_order} className="px-4 py-2.5 text-sm flex gap-3">
              <span className="font-mono text-slate-400 w-5">{p.phase_order}</span>
              <span className="font-medium text-slate-800">{p.name}</span>
            </li>
          ))}
        </ol>

        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Jugadores ({players?.length ?? 0})</h2>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-500">
          {players && players.length > 0
            ? players.map((pl: any) => (
                <div key={pl.id} className="py-1">{pl.first_name} {pl.last_name} - {pl.primary_position} - {pl.stage}</div>
              ))
            : 'Aun no hay jugadores.'}
        </div>
      </div>
    </div>
  )
}
