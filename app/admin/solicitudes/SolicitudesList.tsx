'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Pending = { id: string; full_name: string | null; requested_role: string; created_at: string }

const ROLE = (r: string) => r === 'admin'
  ? { label: 'Admin', bg: 'rgba(15,94,255,0.10)', fg: '#0F5EFF' }
  : { label: 'Familia', bg: 'rgba(22,181,124,0.12)', fg: '#16B57C' }

function hace(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d <= 0) return 'hoy'
  if (d === 1) return 'ayer'
  if (d < 30) return `hace ${d} días`
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export default function SolicitudesList({ initial }: { initial: Pending[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState<Pending[]>(initial)
  const [busy, setBusy] = useState<string | null>(null)

  async function approve(id: string, role: string) {
    setBusy(id)
    const { error } = await supabase.rpc('approve_user', { target: id, grant_role: role })
    setBusy(null)
    if (error) { alert(error.message); return }
    setItems(items.filter(i => i.id !== id)); router.refresh()
  }
  async function reject(id: string) {
    if (!confirm('¿Rechazar esta solicitud?')) return
    setBusy(id)
    const { error } = await supabase.rpc('reject_user', { target: id })
    setBusy(null)
    if (error) { alert(error.message); return }
    setItems(items.filter(i => i.id !== id)); router.refresh()
  }

  if (items.length === 0) {
    return (
      <div className="card-soft bg-white border border-slate-100 rounded-2xl p-10 text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto grid place-items-center" style={{ background: 'rgba(22,181,124,0.12)', color: '#16B57C' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><path d="M20 7L9.5 17.5 4 12" /></svg>
        </div>
        <p className="mt-4 text-[15px] font-bold text-slate-800">Todo al día</p>
        <p className="text-[13px] text-slate-400 mt-1">No hay solicitudes pendientes.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map(u => {
        const r = ROLE(u.requested_role)
        const name = u.full_name || '(sin nombre)'
        const ini = name.replace(/[()]/g, '').trim().split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || '?'
        return (
          <div key={u.id} className="card-soft bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5 flex-wrap">
            <div className="w-11 h-11 rounded-xl grad-accent text-white grid place-items-center text-[13px] font-bold shrink-0">{ini}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-bold text-slate-900 truncate">{name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: r.bg, color: r.fg }}>{r.label}</span>
                <span className="text-[11.5px] text-slate-400">solicitado {hace(u.created_at)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approve(u.id, u.requested_role)} disabled={busy === u.id}
                className="px-4 py-2 rounded-xl grad-accent text-white text-[13px] font-bold glow-brand disabled:opacity-50">
                {busy === u.id ? '…' : 'Aprobar'}
              </button>
              <button onClick={() => reject(u.id)} disabled={busy === u.id}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-semibold hover:border-slate-300 hover:text-slate-700 disabled:opacity-50">
                Rechazar
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
