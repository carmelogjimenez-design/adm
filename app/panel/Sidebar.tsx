'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '../NotificationBell'

const ICONS: Record<string, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  pipeline: <><path d="M3 5h18M3 12h18M3 19h18" /><circle cx="8" cy="5" r="1.6" fill="currentColor" /><circle cx="15" cy="12" r="1.6" fill="currentColor" /><circle cx="11" cy="19" r="1.6" fill="currentColor" /></>,
  players: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.6" /><path d="M16 14.5a4.5 4.5 0 0 1 5 4.5" /></>,
  requests: <><path d="M9 11l3 3 8-8M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" /></>,
  uni: <><path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5M9 12h.01M15 12h.01" /></>,
  finance: <><path d="M3 7h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 7l2-3h14l2 3M12 12v4M9 14h6" /></>,
}
const NAV = [
  { href: '/panel', label: 'Dashboard', icon: 'dashboard' },
  { href: '/panel/captacion', label: 'Captación', icon: 'pipeline' },
  { href: '/panel/jugadores', label: 'Jugadores', icon: 'players' },
  { href: '/panel/universidades', label: 'Universidades', icon: 'uni' },
  { href: '/panel/finanzas', label: 'Finanzas', icon: 'finance' },
]

export default function Sidebar({ name, role, isSuperadmin }: { name: string; role: string; isSuperadmin: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  async function logout() { await supabase.auth.signOut(); router.push('/login'); router.refresh() }
  const active = (href: string) => href === '/panel' ? pathname === '/panel' : pathname.startsWith(href)

  const Item = ({ href, label, icon }: { href: string; label: string; icon: string }) => {
    const on = active(href)
    return (
      <Link href={href}
        className={'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition ' +
          (on ? 'bg-white text-slate-900 font-semibold card-soft' : 'text-slate-500 hover:bg-white/70 hover:text-slate-900')}>
        {on && <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full grad-accent" />}
        <span className={'w-8 h-8 rounded-lg grid place-items-center transition ' + (on ? 'grad-accent text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-[17px] h-[17px]">{icon && ICONS[icon]}</svg>
        </span>
        {label}
      </Link>
    )
  }

  return (
    <aside data-tour="menu" className="w-[252px] shrink-0 min-h-screen sticky top-0 flex flex-col bg-white/70 backdrop-blur-xl border-r border-slate-200/70">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-10 h-10 rounded-xl grad-accent text-white grid place-items-center font-black text-sm tracking-tight glow-brand">ADM</div>
        <div className="leading-tight">
          <div className="font-extrabold text-[15px] tracking-tight text-slate-900">ADM</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Operations</div>
        </div>
        <div data-tour="bell" className="ml-auto"><NotificationBell align="left" /></div>
      </div>

      <nav className="px-3 flex flex-col gap-1 mt-1">
        {NAV.map(i => <Item key={i.href} {...i} />)}
        {isSuperadmin && (
          <Link href="/admin/solicitudes"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-500 hover:bg-white/70 hover:text-slate-900 transition">
            <span className="w-8 h-8 rounded-lg grid place-items-center bg-slate-100 text-slate-400 group-hover:bg-slate-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-[17px] h-[17px]">{ICONS.requests}</svg>
            </span>
            Solicitudes
          </Link>
        )}
      </nav>

      <div className="mt-auto p-3">
        <div className="rounded-xl bg-white/70 border border-slate-200/70 p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full grad-accent text-white grid place-items-center text-[11px] font-bold">{(name || 'A').slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0 leading-tight">
              <div className="text-[12.5px] font-semibold text-slate-800 truncate">{name}</div>
              <div className="text-[11px] text-slate-400 capitalize">{role}</div>
            </div>
          </div>
          <button onClick={() => window.dispatchEvent(new Event('adm-tour-start'))} className="mt-2.5 w-full text-center text-[12px] font-bold grad-text border-t border-slate-100 pt-2">
            Ver tutorial
          </button>
          <button onClick={logout} className="mt-1.5 w-full text-center text-[12px] font-semibold text-slate-400 hover:text-slate-700">
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
