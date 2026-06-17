'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const PRIO: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgente', color: '#EF4444' }, high: { label: 'Alta', color: '#E0A526' },
  medium: { label: 'Media', color: '#0F5EFF' }, low: { label: 'Baja', color: '#94A3B8' },
}
const PRIO_ORDER = ['urgent', 'high', 'medium', 'low']
const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }

export default function TasksWidget() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<any[]>([])
  const [tab, setTab] = useState<'hoy' | 'semana' | 'todas' | 'hechas'>('hoy')
  const [t, setT] = useState({ title: '', due_date: '', priority: 'medium' })
  const [uid, setUid] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase.from('tasks')
      .select('id, title, status, priority, due_date, player_id, players(first_name, last_name)')
      .order('due_date', { ascending: true, nullsFirst: false }).limit(200)
    setTasks(data ?? [])
  }
  useEffect(() => { (async () => { const { data: { user } } = await supabase.auth.getUser(); setUid(user?.id ?? null); load() })() }, [])

  const today = startOfDay()
  const weekEnd = new Date(today.getTime() + 7 * 86400000)
  const view = useMemo(() => {
    const active = tasks.filter(x => x.status !== 'done')
    if (tab === 'hechas') return tasks.filter(x => x.status === 'done').slice(0, 20)
    if (tab === 'todas') return active.sort(byPrio)
    if (tab === 'semana') return active.filter(x => x.due_date && new Date(x.due_date) <= weekEnd).sort(byPrio)
    return active.filter(x => x.due_date && startOfDay(new Date(x.due_date)) <= today).sort(byPrio) // hoy + atrasadas
  }, [tasks, tab])

  function byPrio(a: any, b: any) {
    const pa = PRIO_ORDER.indexOf(a.priority), pb = PRIO_ORDER.indexOf(b.priority)
    if (pa !== pb) return pa - pb
    return (a.due_date || '9999').localeCompare(b.due_date || '9999')
  }

  async function add() {
    if (!t.title.trim()) return
    const { error } = await supabase.from('tasks').insert({ title: t.title.trim(), due_date: t.due_date || null, priority: t.priority, status: 'todo', created_by: uid, assignee_id: uid })
    if (error) { alert(error.message); return }
    setT({ title: '', due_date: '', priority: 'medium' }); load()
  }
  async function toggle(x: any) {
    await supabase.from('tasks').update({ status: x.status === 'done' ? 'todo' : 'done' }).eq('id', x.id); load()
  }
  async function del(id: string) { await supabase.from('tasks').delete().eq('id', id); load() }

  const inp = 'px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:border-[#0F5EFF] focus:outline-none bg-white'
  const overdue = (x: any) => x.status !== 'done' && x.due_date && startOfDay(new Date(x.due_date)) < today
  const counts = { hoy: tasks.filter(x => x.status !== 'done' && x.due_date && startOfDay(new Date(x.due_date)) <= today).length }

  return (
    <div className="fade-up card-soft bg-white rounded-2xl border border-slate-100" style={{ animationDelay: '90ms' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-2">
        <h3 className="font-bold text-[14.5px] text-slate-900">Tu día a día {counts.hoy > 0 && <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full grad-accent text-white align-middle">{counts.hoy} para hoy</span>}</h3>
        <div className="flex gap-1 bg-slate-50 rounded-lg p-1">
          {(['hoy', 'semana', 'todas', 'hechas'] as const).map(k => (
            <button key={k} onClick={() => setTab(k)} className={'px-2.5 py-1 rounded-md text-[12px] font-semibold capitalize transition ' + (tab === k ? 'bg-white text-slate-900 card-soft' : 'text-slate-400 hover:text-slate-700')}>{k}</button>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-slate-50">
        <input value={t.title} onChange={e => setT(s => ({ ...s, title: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') add() }}
          placeholder="Nueva tarea…" className={inp + ' flex-1 min-w-[160px]'} />
        <input type="date" value={t.due_date} onChange={e => setT(s => ({ ...s, due_date: e.target.value }))} className={inp} />
        <select value={t.priority} onChange={e => setT(s => ({ ...s, priority: e.target.value }))} className={inp}>
          {PRIO_ORDER.map(p => <option key={p} value={p}>{PRIO[p].label}</option>)}
        </select>
        <button onClick={add} className="px-4 py-2 rounded-lg grad-accent text-white text-[12.5px] font-bold">Añadir</button>
      </div>

      <div className="p-3 flex flex-col gap-1.5 max-h-[360px] overflow-y-auto">
        {view.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-slate-400">{tab === 'hoy' ? '¡Nada para hoy! 🎉' : 'Sin tareas aquí.'}</div>
        ) : view.map(x => {
          const pr = PRIO[x.priority] ?? PRIO.medium
          const pl = Array.isArray(x.players) ? x.players[0] : x.players
          return (
            <div key={x.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 group">
              <button onClick={() => toggle(x)} className={'w-5 h-5 rounded-md border grid place-items-center shrink-0 ' + (x.status === 'done' ? 'bg-[#16B57C] border-[#16B57C] text-white' : 'border-slate-300 hover:border-[#0F5EFF]')}>
                {x.status === 'done' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M5 12l5 5L20 7" /></svg>}
              </button>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: pr.color }} />
              <span className={'flex-1 min-w-0 text-[13.5px] ' + (x.status === 'done' ? 'line-through text-slate-300' : 'text-slate-800 font-medium')}>
                {x.title}
                {pl && <span className="text-slate-400 font-normal"> · {pl.first_name} {pl.last_name}</span>}
              </span>
              {x.due_date && <span className={'text-[11px] font-semibold shrink-0 ' + (overdue(x) ? 'text-red-500' : 'text-slate-400')}>{new Date(x.due_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}{overdue(x) ? ' ⚠' : ''}</span>}
              <button onClick={() => del(x.id)} className="text-[11px] font-semibold text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 shrink-0">✕</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
