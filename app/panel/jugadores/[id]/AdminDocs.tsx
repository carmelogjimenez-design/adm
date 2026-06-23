'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Cat = { id: number; code: string; name: string; required: boolean }
type Doc = { id: string; category_id: number; status: string; storage_path: string | null; external_url: string | null; name?: string | null }
const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Sin subir', cls: 'bg-slate-100 text-slate-400' },
  uploaded: { label: 'Subido', cls: 'bg-[#0F5EFF]/10 text-[#0F5EFF]' },
  reviewed: { label: 'En revisión', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Aprobado', cls: 'bg-[#39E6A5]/20 text-emerald-700' },
  correction_required: { label: 'Corregir', cls: 'bg-red-100 text-red-600' },
}

export default function AdminDocs({ playerId, categories, initialDocs }: { playerId: string; categories: Cat[]; initialDocs: Doc[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [docs, setDocs] = useState<Record<number, Doc>>(Object.fromEntries(initialDocs.map(d => [d.category_id, d])))
  const [uid, setUid] = useState<string | null>(null)
  const [busy, setBusy] = useState<number | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [onlyPending, setOnlyPending] = useState(false)
  const inputs = useRef<Record<number, HTMLInputElement | null>>({})
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null)) }, [])

  async function persist(cat: Cat, patch: any) {
    const existing = docs[cat.id]
    if (existing?.id) {
      const { error } = await supabase.from('documents').update(patch).eq('id', existing.id)
      if (error) throw error
      setDocs(d => ({ ...d, [cat.id]: { ...existing, ...patch } }))
    } else {
      const { data, error } = await supabase.from('documents').insert({
        player_id: playerId, category_id: cat.id, name: patch.name ?? cat.name,
        status: patch.status ?? 'uploaded', storage_path: patch.storage_path ?? null,
        external_url: patch.external_url ?? null, uploaded_by: uid,
      }).select('id').single()
      if (error) throw error
      setDocs(d => ({ ...d, [cat.id]: { id: data.id, category_id: cat.id, status: 'uploaded', storage_path: patch.storage_path ?? null, external_url: patch.external_url ?? null } }))
    }
  }
  async function uploadFile(cat: Cat, file: File) {
    setBusy(cat.id); setErr(null)
    try {
      const safe = file.name.replace(/[^\w.\-]/g, '_')
      const path = `${playerId}/${cat.code}/${Date.now()}-${safe}`
      const { error: upErr } = await supabase.storage.from('documentos').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      await persist(cat, { storage_path: path, external_url: null, name: file.name, status: 'uploaded' })
      router.refresh()
    } catch (e: any) { setErr(e.message ?? 'Error al subir') }
    setBusy(null)
  }
  async function addLink(cat: Cat) {
    const url = window.prompt(`Enlace para "${cat.name}" (Drive, YouTube…)`)
    if (!url) return
    setBusy(cat.id); setErr(null)
    try { await persist(cat, { external_url: url, storage_path: null, name: 'Enlace', status: 'uploaded' }); router.refresh() }
    catch (e: any) { setErr(e.message) }
    setBusy(null)
  }
  async function setStatus(cat: Cat, status: string) {
    const d = docs[cat.id]; if (!d?.id) return
    setDocs(x => ({ ...x, [cat.id]: { ...d, status } }))
    await supabase.from('documents').update({ status }).eq('id', d.id); router.refresh()
  }
  async function view(d: Doc) {
    if (d.external_url) { window.open(d.external_url, '_blank'); return }
    if (d.storage_path) { const { data } = await supabase.storage.from('documentos').createSignedUrl(d.storage_path, 3600); if (data?.signedUrl) window.open(data.signedUrl, '_blank') }
  }
  async function download(d: Doc) {
    if (d.external_url) { window.open(d.external_url, '_blank'); return }
    if (d.storage_path) {
      const { data } = await supabase.storage.from('documentos').createSignedUrl(d.storage_path, 3600, { download: true })
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    }
  }

  const list = onlyPending ? categories.filter(c => !docs[c.id]) : categories
  const done = categories.filter(c => docs[c.id]).length

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[12px] text-slate-400">{done}/{categories.length} con archivo</span>
        <button onClick={() => setOnlyPending(o => !o)} className="text-[12px] font-semibold grad-text">{onlyPending ? 'Ver todos' : 'Solo pendientes'}</button>
      </div>
      {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-2">{err}</div>}
      <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 card-soft">
        {list.map(cat => {
          const doc = docs[cat.id]
          const st = STATUS[doc?.status ?? 'pending'] ?? STATUS.pending
          return (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-3 flex-wrap">
              <div className="flex-1 min-w-[160px]">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-bold text-slate-900">{cat.name}</span>
                  {!cat.required && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">Opcional</span>}
                </div>
                {doc && (
                  <div className="flex items-center gap-3 mt-0.5">
                    <button onClick={() => view(doc)} className="text-[11.5px] font-semibold grad-text">Ver {doc.external_url ? 'enlace' : 'archivo'} →</button>
                    {doc.storage_path && <button onClick={() => download(doc)} className="text-[11.5px] font-semibold text-slate-500 hover:text-slate-700">Descargar</button>}
                  </div>
                )}
              </div>
              <span className={'text-[10.5px] font-bold px-2 py-0.5 rounded-full ' + st.cls}>{st.label}</span>
              <input ref={el => { inputs.current[cat.id] = el }} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(cat, f) }} />
              <button onClick={() => inputs.current[cat.id]?.click()} disabled={busy === cat.id} className="px-3 py-1.5 rounded-lg grad-accent text-white text-[11.5px] font-semibold disabled:opacity-50">{busy === cat.id ? '...' : (doc ? 'Cambiar' : 'Subir')}</button>
              <button onClick={() => addLink(cat)} disabled={busy === cat.id} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] font-semibold">Enlace</button>
              {doc && (
                <div className="flex gap-1">
                  <button onClick={() => setStatus(cat, 'approved')} title="Aprobar" className="px-2 py-1.5 rounded-lg bg-[#39E6A5]/20 text-emerald-700 text-[11px] font-bold">✓</button>
                  <button onClick={() => setStatus(cat, 'correction_required')} title="Pedir corrección" className="px-2 py-1.5 rounded-lg bg-red-100 text-red-600 text-[11px] font-bold">✗</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
