'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const OPTS: [string, string][] = [
  ['activo', 'Activo'],
  ['en_usa', 'En activo en USA'],
  ['abandono', 'Abandonó'],
  ['graduado', 'Graduado'],
]
const COLOR: Record<string, string> = { activo: '#0F5EFF', en_usa: '#16B57C', abandono: '#EF4444', graduado: '#7B61FF' }

export default function LifecycleSelect({ playerId, current }: { playerId: string; current: string | null }) {
  const supabase = createClient()
  const router = useRouter()
  const [val, setVal] = useState(current ?? 'activo')
  const [busy, setBusy] = useState(false)

  async function change(next: string) {
    setVal(next); setBusy(true)
    const { error } = await supabase.from('players').update({ lifecycle_status: next }).eq('id', playerId)
    setBusy(false)
    if (error) { alert(error.message); setVal(current ?? 'activo'); return }
    router.refresh()
  }
  return (
    <div className="mt-2">
      <div className="text-[11px] text-slate-400 font-semibold mb-1">Estado del jugador</div>
      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
        <span className="w-2 h-2 rounded-full" style={{ background: COLOR[val] }} />
        <select value={val} disabled={busy} onChange={e => change(e.target.value)}
          className="text-[13px] font-semibold text-slate-700 bg-transparent focus:outline-none">
          {OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
    </div>
  )
}
