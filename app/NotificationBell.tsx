'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const KIND: Record<string, string> = { success: '#16B57C', warn: '#E0A526', info: '#0F5EFF' }
function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'ahora'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`
  if (s < 172800) return 'ayer'
  return `hace ${Math.floor(s / 86400)} d`
}

export default function NotificationBell({ align = 'right' }: { align?: 'right' | 'left' }) {
  const supabase = createClient()
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [uid, setUid] = useState<string | null>(null)
  const [seen, setSeen] = useState<string>(new Date(0).toISOString())
  const [tasks, setTasks] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUid(user.id)
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)
    const [{ data: prof }, { data: acts }, { data: tks }] = await Promise.all([
      supabase.from('profiles').select('notifications_seen_at').eq('id', user.id).single(),
      supabase.from('activity_log').select('id, action, detail, created_at, actor_id').order('created_at', { ascending: false }).limit(25),
      supabase.from('tasks').select('id, title, due_date, priority').neq('status', 'done').lte('due_date', todayEnd.toISOString().slice(0, 10)).order('due_date').limit(10),
    ])
    if (prof?.notifications_seen_at) setSeen(prof.notifications_seen_at)
    setItems(acts ?? [])
    setTasks(tks ?? [])
  }
  useEffect(() => {
    load()
    const t = setInterval(load, 20000)
    const onClick = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => { clearInterval(t); document.removeEventListener('mousedown', onClick) }
  }, [])

  const unreadActivity = items.filter(a => a.actor_id !== uid && new Date(a.created_at) > new Date(seen)).length
  const unread = unreadActivity + tasks.length

  async function toggle() {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen && unreadActivity > 0) {
      await supabase.rpc('mark_notifications_seen')
      setSeen(new Date().toISOString())
    }
  }

  async function doneTask(id: string) {
    setTasks(ts => ts.filter(t => t.id !== id))
    await supabase.from('tasks').update({ status: 'done' }).eq('id', id)
  }

  return (
    <div ref={box} className="relative shrink-0">
      <button onClick={toggle} className="relative w-9 h-9 rounded-lg grid place-items-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-[18px] h-[18px]"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full grad-accent text-white text-[10px] font-bold grid place-items-center">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className={'absolute mt-2 w-[320px] max-h-[400px] overflow-y-auto bg-white rounded-2xl border border-slate-100 card-soft z-50 ' + (align === 'right' ? 'right-0' : 'left-0')}>
          {tasks.length > 0 && (
            <div className="border-b border-slate-100">
              <div className="px-4 pt-3 pb-1 text-[12px] font-bold uppercase tracking-[0.12em] grad-text">Para hoy</div>
              {tasks.map(tk => (
                <div key={tk.id} className="flex items-center gap-3 px-4 py-2.5">
                  <button onClick={() => doneTask(tk.id)} className="w-4 h-4 rounded border border-slate-300 hover:border-[#0F5EFF] shrink-0" />
                  <span className="flex-1 min-w-0 text-[13px] text-slate-700 truncate">{tk.title}</span>
                  {tk.due_date && <span className="text-[10.5px] font-semibold text-slate-400 shrink-0">{new Date(tk.due_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>}
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-3 border-b border-slate-100 text-[12px] font-bold uppercase tracking-[0.12em] grad-text">Novedades</div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-slate-400">Sin novedades todavía</div>
          ) : items.map(a => (
            <div key={a.id} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
              <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: KIND[a.detail?.kind ?? 'info'] }} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-slate-700">{a.detail?.text ?? a.action}</div>
                <div className="text-[11px] text-slate-400">{ago(a.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
