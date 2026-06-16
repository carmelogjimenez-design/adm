'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Phase = { id: string; status: string; phases: { phase_order: number; name: string; description: string | null } | null }

const STATUS: { value: string; label: string; dot: string; cls: string }[] = [
  { value: 'todo', label: 'Pendiente', dot: '#CBD5E1', cls: 'bg-slate-100 text-slate-500' },
  { value: 'in_progress', label: 'En curso', dot: '#0F5EFF', cls: 'bg-[#0F5EFF]/10 text-[#0F5EFF]' },
  { value: 'done', label: 'Hecho', dot: '#16B57C', cls: 'bg-[#39E6A5]/20 text-emerald-700' },
  { value: 'blocked', label: 'Bloqueada', dot: '#EF4444', cls: 'bg-red-100 text-red-600' },
]
const meta = (s: string) => STATUS.find(x => x.value === s) ?? STATUS[0]

export default function PhaseTimeline({ phases }: { phases: Phase[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [state, setState] = useState<Record<string, string>>(Object.fromEntries(phases.map(p => [p.id, p.status])))
  const [busy, setBusy] = useState<string | null>(null)

  async function change(id: string, status: string) {
    setBusy(id); setState(s => ({ ...s, [id]: status }))
    const patch: any = { status }
    if (status === 'done') patch.actual_date = new Date().toISOString().slice(0, 10)
    const { error } = await supabase.from('player_phases').update(patch).eq('id', id)
    setBusy(null)
    if (error) { alert(error.message); return }
    router.refresh()
  }

  const done = phases.filter(p => state[p.id] === 'done').length

  return (
    <div className="fade-up card-soft bg-white border border-slate-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Camino del jugador</h2>
        <span className="text-[12px] font-bold font-mono text-slate-400 tabular-nums">{done}/{phases.length} fases</span>
      </div>

      <div className="mb-5 bar-track h-2">
        <div className="bar-fill h-full" style={{ width: `${(done / Math.max(phases.length, 1)) * 100}%` }} />
      </div>

      <ol className="relative flex flex-col gap-1.5">
        {phases.map((p, i) => {
          const m = meta(state[p.id] ?? 'todo')
          const order = p.phases?.phase_order ?? i + 1
          return (
            <li key={p.id} className="flex items-center gap-3 py-1.5">
              <span className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold font-mono shrink-0"
                style={{ background: state[p.id] === 'done' ? '#16B57C' : '#EEF1F8', color: state[p.id] === 'done' ? '#fff' : '#94A3B8' }}>
                {order}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-slate-800 truncate">{p.phases?.name ?? 'Fase'}</div>
                {p.phases?.description && <div className="text-[11px] text-slate-400 truncate">{p.phases.description}</div>}
              </div>
              <select value={state[p.id] ?? 'todo'} onChange={e => change(p.id, e.target.value)} disabled={busy === p.id}
                className={'text-[11.5px] font-bold px-2.5 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#0F5EFF]/30 ' + m.cls}>
                {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
