'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Item = {
  categoryId: number; name: string; required: boolean
  doc: { id: string; status: string; storage_path: string | null; external_url: string | null } | null
}
const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Sin subir', cls: 'bg-slate-100 text-slate-400' },
  uploaded: { label: 'Subido', cls: 'bg-[#0F5EFF]/10 text-[#0F5EFF]' },
  reviewed: { label: 'En revisión', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Aprobado', cls: 'bg-[#39E6A5]/20 text-emerald-700' },
  correction_required: { label: 'Corregir', cls: 'bg-red-100 text-red-600' },
}

export default function DocReview({ items }: { items: Item[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [state, setState] = useState<Record<number, string>>(
    Object.fromEntries(items.map(i => [i.categoryId, i.doc?.status ?? 'pending']))
  )
  const [busy, setBusy] = useState<string | null>(null)

  async function setStatus(docId: string, catId: number, status: string) {
    setBusy(docId)
    const { error } = await supabase.from('documents').update({ status }).eq('id', docId)
    setBusy(null)
    if (error) { alert(error.message); return }
    setState(s => ({ ...s, [catId]: status }))
    router.refresh()
  }

  async function view(doc: NonNullable<Item['doc']>) {
    if (doc.external_url) { window.open(doc.external_url, '_blank'); return }
    if (doc.storage_path) {
      const { data } = await supabase.storage.from('documentos').createSignedUrl(doc.storage_path, 3600)
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
      {items.map((it, i) => {
        const st = STATUS[state[it.categoryId] ?? 'pending'] ?? STATUS.pending
        return (
          <div key={it.categoryId} className="flex items-center gap-3 px-4 py-3 flex-wrap">
            <span className="w-6 text-[11px] font-mono font-bold text-slate-300">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-slate-800">{it.name}{!it.required && <span className="ml-2 text-[10px] font-bold text-slate-300">OPCIONAL</span>}</div>
            </div>
            <span className={'text-[10.5px] font-bold px-2 py-0.5 rounded-full ' + st.cls}>{st.label}</span>
            {it.doc ? (
              <div className="flex items-center gap-1.5">
                <button onClick={() => view(it.doc!)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-600 hover:border-slate-300">Ver</button>
                <button onClick={() => setStatus(it.doc!.id, it.categoryId, 'approved')} disabled={busy === it.doc.id}
                  className="px-2.5 py-1.5 rounded-lg bg-[#39E6A5] text-slate-900 text-[12px] font-semibold disabled:opacity-50">Aprobar</button>
                <button onClick={() => setStatus(it.doc!.id, it.categoryId, 'correction_required')} disabled={busy === it.doc.id}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-red-200 text-red-500 text-[12px] font-semibold hover:bg-red-50">Corregir</button>
              </div>
            ) : (
              <span className="text-[12px] text-slate-300">—</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
