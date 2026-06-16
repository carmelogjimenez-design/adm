'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV: [string, string][] = [['/inicio', 'Inicio'], ['/mi-camino', 'Mi camino'], ['/documentos', 'Documentos'], ['/ayuda', 'Ayuda']]

export default function FamilyNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  async function logout() { await supabase.auth.signOut(); router.push('/login'); router.refresh() }

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
      <div className="max-w-3xl mx-auto px-5 h-14 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg grad-accent text-white grid place-items-center font-black text-xs shrink-0">ADM</div>
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {NAV.map(([href, label]) => {
            const on = pathname === href
            return (
              <Link key={href} href={href}
                className={'px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap transition ' +
                  (on ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900')}>
                {label}
              </Link>
            )
          })}
        </nav>
        <button onClick={logout} className="text-[12.5px] font-semibold text-slate-400 hover:text-slate-700 shrink-0">Salir</button>
      </div>
    </header>
  )
}
