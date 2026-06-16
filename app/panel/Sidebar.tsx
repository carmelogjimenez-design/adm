'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ICONS: Record<string, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  pipeline: <><path d="M3 5h18M3 12h18M3 19h18" /><circle cx="8" cy="5" r="1.6" fill="currentColor" /><circle cx="15" cy="12" r="1.6" fill="currentColor" /><circle cx="11" cy="19" r="1.6" fill="currentColor" /></>,
  players: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.6" /><path d="M16 14.5a4.5 4.5 0 0 1 5 4.5" /></>,
  requests: <><path d="M9 11l3 3 8-8M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" /></>,
}

const NAV = [
  { href: '/panel', label: 'Dashboard', icon: 'dashboard' },
  { href: '/panel/captacion', label: 'Captacion', icon: 'pipeline' },
  { href: '/panel/jugadores', label: 'Jugadores', icon: 'players' },
]

export default function Sidebar({
  name, role, isSuperadmin,
}: { name: string; role: string; isSuperadmin: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login'); router.refresh()
  }

  const isActive = (href: string) =>
    href === '/panel' ? pathname === '/panel' : pathname.startsWith(href)

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 min-h-screen sticky top-0 flex flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white grid place-items-center font-black text-sm tracking-tight">ADM</div>
        <div className="leading-tight">
          <div className="font-extrabold text-[15px] tracking-tight text-slate-900">ADM</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Operations</div>
        </div>
      </div>

      <nav className="px-3 flex flex-col gap-0.5">
        {NAV.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition ' +
                (active ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}>
              {active && <span className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r bg-gradient-to-b from-[#0F5EFF] to-[#39E6A5]" />}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-[18px] h-[18px]">{ICONS[item.icon]}</svg>
              {item.label}
            </Link>
          )
        })}

        {isSuperadmin && (
          <Link href="/admin/solicitudes"
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-[18px] h-[18px]">{ICONS.requests}</svg>
            Solicitudes
          </Link>
        )}
      </nav>

      <div className="mt-auto p-3 border-t border-slate-200">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F5EFF] to-[#39E6A5] text-white grid place-items-center text-[11px] font-bold">
            {(name || 'A').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-[12.5px] font-semibold text-slate-800 truncate">{name}</div>
            <div className="text-[11px] text-slate-400 capitalize">{role}</div>
          </div>
        </div>
        <button onClick={logout}
          className="mt-2 w-full text-left px-1 text-[12.5px] font-semibold text-slate-400 hover:text-slate-700">
          Cerrar sesion
        </button>
      </div>
    </aside>
  )
}
