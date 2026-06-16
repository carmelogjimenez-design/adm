'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Pending = { id: string; full_name: string | null; requested_role: string; created_at: string }

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
    setItems(items.filter(i => i.id !== id))
    router.refresh()
  }

  async function reject(id: string) {
    setBusy(id)
    const { error } = await supabase.rpc('reject_user', { target: id })
    setBusy(null)
    if (error) { alert(error.message); return }
    setItems(items.filter(i => i.id !== id))
    router.refresh()
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
        No hay solicitudes pendientes.
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
      {items.map(u => (
        <div key={u.id} className="flex items-center gap-3 px-4 py-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">
              {u.full_name || '(sin nombre)'}
            </div>
            <div className="text-xs text-slate-400">
              Solicita: <b className="text-slate-500">{u.requested_role === 'admin' ? 'Admin' : 'Familia'}</b>
            </div>
          </div>
          <button
            onClick={() => approve(u.id, u.requested_role)} disabled={busy === u.id}
            className="px-3 py-1.5 rounded-lg bg-[#39E6A5] text-slate-900 text-sm font-semibold disabled:opacity-50">
            Aprobar
          </button>
          <button
            onClick={() => reject(u.id)} disabled={busy === u.id}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:border-slate-300 disabled:opacity-50">
            Rechazar
          </button>
        </div>
      ))}
    </div>
  )
}
