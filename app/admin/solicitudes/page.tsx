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
  const n = (pending as any[])?.length ?? 0

  return (
    <div className="app-aurora min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/panel" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
          Volver al panel
        </Link>

        <div className="fade-up mt-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl grad-accent text-white grid place-items-center glow-brand shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1">Acceso</div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 leading-tight">Solicitudes de acceso</h1>
            <p className="text-slate-500 text-[14px] mt-1">
              {n > 0
                ? <>Tienes <b className="text-slate-800">{n}</b> {n === 1 ? 'cuenta pendiente' : 'cuentas pendientes'} de revisar.</>
                : 'No hay nada pendiente ahora mismo.'}
            </p>
          </div>
        </div>

        <div className="fade-up mt-6" style={{ animationDelay: '80ms' }}>
          <SolicitudesList initial={pending as any} />
        </div>
      </div>
    </div>
  )
}
