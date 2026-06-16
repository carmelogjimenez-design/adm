import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/queries'
import LogoutButton from '@/app/logout-button'

export default async function PendientePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getMyProfile()
  if (profile?.status === 'approved') redirect('/panel')
  const rejected = profile?.status === 'rejected'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white grid place-items-center font-black text-sm tracking-tight mx-auto mb-5">ADM</div>
        {rejected ? (
          <>
            <h1 className="text-lg font-bold text-slate-900">Solicitud rechazada</h1>
            <p className="text-sm text-slate-500 mt-2">
              Tu solicitud de acceso no ha sido aprobada. Contacta con ADM si crees que es un error.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-slate-900">Cuenta pendiente de aprobacion</h1>
            <p className="text-sm text-slate-500 mt-2">
              Hola {profile?.full_name || user.email}. Tu solicitud como{' '}
              <b className="text-slate-700">{profile?.requested_role === 'admin' ? 'Admin' : 'Familia'}</b>{' '}
              esta esperando la confirmacion de un administrador. Te avisaremos cuando este lista.
            </p>
          </>
        )}
        <div className="mt-6"><LogoutButton /></div>
      </div>
    </div>
  )
}
