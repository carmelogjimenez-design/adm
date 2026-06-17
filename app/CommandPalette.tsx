'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DIV: Record<string, string> = { NCAA_D1: 'D1', NCAA_D2: 'D2', NCAA_D3: 'D3', NAIA: 'NAIA', NJCAA: 'JUCO' }

export default function CommandPalette() {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [players, setPlayers] = useState<any[]>([])
  const [unis, setUnis] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); else { setQ(''); setPlayers([]); setUnis([]) } }, [open])

  useEffect(() => {
    const t = q.trim()
    if (t.length < 2) { setPlayers([]); setUnis([]); return }
    setLoading(true)
    const h = setTimeout(async () => {
      const [{ data: pl }, { data: un }] = await Promise.all([
        supabase.from('players').select('id, first_name, last_name, primary_position, target_division, stage')
          .or(`first_name.ilike.%${t}%,last_name.ilike.%${t}%,current_club.ilike.%${t}%`).limit(6),
        supabase.from('universities').select('id, name, division, state').ilike('name', `%${t}%`).limit(6),
      ])
      setPlayers(pl ?? []); setUnis(un ?? []); setLoading(false)
    }, 220)
    return () => clearTimeout(h)
  }, [q])

  function go(href: string) { setOpen(false); router.push(href) }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" onMouseDown={() => setOpen(false)}>
      <div className="fixed inset-0" style={{ background: 'rgba(15,23,42,0.55)' }} />
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-100 shadow-2xl overflow-hidden isolate" style={{ background: '#ffffff' }} onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-300"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar jugadores y universidades…"
            className="flex-1 text-[15px] outline-none placeholder:text-slate-300" />
          <kbd className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {q.trim().length < 2 && <div className="px-4 py-8 text-center text-[13px] text-slate-400">Escribe para buscar… (⌘K)</div>}
          {q.trim().length >= 2 && !loading && players.length === 0 && unis.length === 0 && (
            <div className="px-4 py-8 text-center text-[13px] text-slate-400">Sin resultados para “{q}”</div>
          )}
          {players.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Jugadores</div>
              {players.map(p => (
                <button key={p.id} onClick={() => go(`/panel/jugadores/${p.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left">
                  <span className="w-8 h-8 rounded-lg grad-accent text-white grid place-items-center text-[11px] font-bold shrink-0">{(p.first_name?.[0] ?? '') + (p.last_name?.[0] ?? '')}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-bold text-slate-900 truncate">{p.first_name} {p.last_name}</span>
                    <span className="block text-[11.5px] text-slate-400">{p.primary_position || '—'}{p.target_division ? ` · ${DIV[p.target_division] ?? p.target_division}` : ''}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {unis.length > 0 && (
            <div className="py-2 border-t border-slate-50">
              <div className="px-4 py-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Universidades</div>
              {unis.map(u => (
                <button key={u.id} onClick={() => go('/panel/universidades')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 grid place-items-center text-[11px] font-bold shrink-0">{(u.name ?? '?').slice(0, 2).toUpperCase()}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-bold text-slate-900 truncate">{u.name}</span>
                    <span className="block text-[11.5px] text-slate-400">{u.division ? (DIV[u.division] ?? u.division) : ''}{u.state ? ` · ${u.state}` : ''}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
