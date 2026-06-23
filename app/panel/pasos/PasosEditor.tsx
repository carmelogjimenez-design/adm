'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Phase = { id: string; phase_order: number; code: string; name: string; description: string | null; visible: boolean }

export default function PasosEditor({ initial }: { initial: Phase[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [rows, setRows] = useState<Phase[]>(initial)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  const edit = (id: string, k: 'name' | 'description', v: string) =>
    setRows(rs => rs.map(r => r.id === id ? { ...r, [k]: v } : r))

  async function save(p: Phase) {
    setSavingId(p.id)
    const { error } = await supabase.from('phases')
      .update({ name: p.name.trim() || p.code, description: p.description })
      .eq('id', p.id)
    setSavingId(null)
    if (error) { alert(error.message); return }
    setSavedId(p.id); setTimeout(() => setSavedId(s => s === p.id ? null : s), 1800)
    router.refresh()
  }
  async function toggle(p: Phase) {
    const next = !p.visible
    setRows(rs => rs.map(r => r.id === p.id ? { ...r, visible: next } : r))
    const { error } = await supabase.from('phases').update({ visible: next }).eq('id', p.id)
    if (error) { alert(error.message); setRows(rs => rs.map(r => r.id === p.id ? { ...r, visible: !next } : r)); return }
    router.refresh()
  }

  const inp = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-[13.5px] focus:border-[#0F5EFF] focus:outline-none bg-white'

  return (
    <div className="flex flex-col gap-3 mt-6">
      {rows.map(p => (
        <div key={p.id} className={'fade-up card-soft bg-white border rounded-2xl p-4 ' + (p.visible ? 'border-slate-100' : 'border-amber-200 bg-amber-50/40')}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl grad-accent text-white grid place-items-center text-[13px] font-extrabold shrink-0 mt-0.5">{p.phase_order}</div>
            <div className="flex-1 min-w-0">
              <input className={inp + ' font-bold'} value={p.name} onChange={e => edit(p.id, 'name', e.target.value)} placeholder="Nombre del paso" />
              <textarea className={inp + ' mt-2 resize-none'} rows={2} value={p.description ?? ''} onChange={e => edit(p.id, 'description', e.target.value)} placeholder="Descripción (lo que ve la familia)" />
              <div className="flex items-center gap-3 mt-2.5">
                <button onClick={() => save(p)} disabled={savingId === p.id} className="px-3.5 py-1.5 rounded-lg grad-accent text-white text-[12.5px] font-bold disabled:opacity-50 glow-brand">
                  {savingId === p.id ? 'Guardando…' : 'Guardar'}
                </button>
                {savedId === p.id && <span className="text-[12px] font-bold text-emerald-600">✓ Guardado</span>}
                <button onClick={() => toggle(p)} className="ml-auto inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-500">
                  <span className={'w-9 h-5 rounded-full relative transition ' + (p.visible ? 'bg-[#16B57C]' : 'bg-slate-300')}>
                    <span className={'absolute top-0.5 w-4 h-4 rounded-full bg-white transition ' + (p.visible ? 'left-[18px]' : 'left-0.5')} />
                  </span>
                  {p.visible ? 'Visible' : 'Oculto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
