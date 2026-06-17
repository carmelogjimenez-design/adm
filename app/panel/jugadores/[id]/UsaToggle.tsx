'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UsaToggle({ playerId, current }: { playerId: string; current: boolean }) {
  const supabase = createClient()
  const router = useRouter()
  const [on, setOn] = useState(!!current)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    const next = !on
    if (next && !confirm('¿Marcar como EN EE. UU.? Saldrá del tablero de Captación (proceso cerrado).')) return
    setOn(next); setBusy(true)
    const { error } = await supabase.from('players').update({ in_usa: next }).eq('id', playerId)
    setBusy(false)
    if (error) { alert(error.message); setOn(!next); return }
    router.refresh()
  }

  return (
    <button onClick={toggle} disabled={busy}
      className={'mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition disabled:opacity-50 ' +
        (on ? 'bg-[#39E6A5]/20 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
      <span className={'w-2 h-2 rounded-full ' + (on ? 'bg-emerald-500' : 'bg-slate-400')} />
      {on ? 'En EE. UU.' : 'Marcar En EE. UU.'}
    </button>
  )
}
