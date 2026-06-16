import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getPendingUsers } from '@/lib/queries'
import SolicitudesList from './SolicitudesList'

export default async function SolicitudesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getMyProfile()
  if (!profile?.is_superadmin) redirect('/panel')

  const pending = await getPendingUsers()

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/panel" className="text-sm text-[#0F5EFF] font-semibold">&larr; Volver al panel</Link>
        <h1 className="text-xl font-bold text-slate-900 mt-2 mb-1">Solicitudes de acceso</h1>
        <p className="text-sm text-slate-500 mb-6">Confirma o rechaza las cuentas pendientes.</p>
        <SolicitudesList initial={pending as any} />
      </div>
    </div>
  )
}
