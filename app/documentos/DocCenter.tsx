'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Cat = { id: number; code: string; name: string; description: string | null; required: boolean; sort_order: number }
type Doc = { id: string; category_id: number; name: string | null; status: string; storage_path: string | null; external_url: string | null }

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-slate-100 text-slate-500' },
  uploaded: { label: 'Subido', cls: 'bg-[#0F5EFF]/10 text-[#0F5EFF]' },
  reviewed: { label: 'En revisión', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Aprobado', cls: 'bg-[#39E6A5]/20 text-emerald-700' },
  correction_required: { label: 'Corregir', cls: 'bg-red-100 text-red-600' },
}

export default function DocCenter({
  playerId, playerName, categories, initialDocs,
}: { playerId: string; playerName: string; categories: Cat[]; initialDocs: Doc[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [docs, setDocs] = useState<Record<number, Doc>>(
    Object.fromEntries(initialDocs.map(d => [d.category_id, d]))
  )
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputs = useRef<Record<number, HTMLInputElement | null>>({})

  const requiredCats = categories.filter(c => c.required)
  const doneRequired = requiredCats.filter(c => docs[c.id]).length

  async function uploadFile(cat: Cat, file: File) {
    setBusy(cat.id); setError(null)
    try {
      const safe = file.name.replace(/[^\w.\-]/g, '_')
      const path = `${playerId}/${cat.code}/${Date.now()}-${safe}`
      const { error: upErr } = await supabase.storage.from('documentos').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { error: rpcErr } = await supabase.rpc('upsert_document', {
        p_category: cat.id, p_path: path, p_name: file.name, p_url: null,
      })
      if (rpcErr) throw rpcErr
      setDocs(d => ({ ...d, [cat.id]: { id: 'tmp', category_id: cat.id, name: file.name, status: 'uploaded', storage_path: path, external_url: null } }))
      router.refresh()
    } catch (e: any) { setError(e.message ?? 'Error al subir') }
    setBusy(null)
  }

  async function addLink(cat: Cat) {
    const url = window.prompt(`Pega el enlace para "${cat.name}" (YouTube, Drive, Veo...)`)
    if (!url) return
    setBusy(cat.id); setError(null)
    const { error: rpcErr } = await supabase.rpc('upsert_document', {
      p_category: cat.id, p_path: null, p_name: 'Enlace', p_url: url,
    })
    if (rpcErr) { setError(rpcErr.message); setBusy(null); return }
    setDocs(d => ({ ...d, [cat.id]: { id: 'tmp', category_id: cat.id, name: 'Enlace', status: 'uploaded', storage_path: null, external_url: url } }))
    setBusy(null); router.refresh()
  }

  async function view(doc: Doc) {
    if (doc.external_url) { window.open(doc.external_url, '_blank'); return }
    if (doc.storage_path) {
      const { data } = await supabase.storage.from('documentos').createSignedUrl(doc.storage_path, 3600)
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center font-black text-xs">ADM</div>
            <span className="font-bold text-slate-900 text-sm">Mis documentos</span>
          </div>
          <Link href="/formulario" className="text-sm font-semibold text-[#0F5EFF]">Mi solicitud</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Centro documental</h1>
        <p className="text-sm text-slate-500 mt-1">{playerName} · sube cada documento o pega un enlace.</p>

        <div className="mt-4 mb-6 bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] font-semibold text-slate-600">Progreso (obligatorios)</span>
            <span className="text-[12.5px] font-bold font-mono text-slate-700">{doneRequired}/{requiredCats.length}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0F5EFF] to-[#39E6A5] transition-all"
              style={{ width: `${(doneRequired / Math.max(requiredCats.length, 1)) * 100}%` }} />
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

        <div className="flex flex-col gap-2.5">
          {categories.map((cat, i) => {
            const doc = docs[cat.id]
            const st = STATUS[doc?.status ?? 'pending'] ?? STATUS.pending
            return (
              <div key={cat.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 grid place-items-center text-[11px] font-bold font-mono text-slate-400 shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-bold text-slate-900">{cat.name}</span>
                      {!cat.required && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">Opcional</span>}
                      <span className={'text-[10.5px] font-bold px-2 py-0.5 rounded-full ' + st.cls}>{st.label}</span>
                    </div>
                    {cat.description && <p className="text-[12px] text-slate-400 mt-0.5">{cat.description}</p>}
                    {doc && (
                      <button onClick={() => view(doc)} className="text-[12px] font-semibold text-[#0F5EFF] mt-1.5 inline-flex items-center gap-1">
                        Ver {doc.external_url ? 'enlace' : 'archivo'} →
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <input ref={el => { inputs.current[cat.id] = el }} type="file" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(cat, f) }} />
                    <button onClick={() => inputs.current[cat.id]?.click()} disabled={busy === cat.id}
                      className="px-3 py-1.5 rounded-lg bg-[#0F5EFF] text-white text-[12px] font-semibold disabled:opacity-50 whitespace-nowrap">
                      {busy === cat.id ? '...' : (doc ? 'Cambiar' : 'Subir')}
                    </button>
                    <button onClick={() => addLink(cat)} disabled={busy === cat.id}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] font-semibold hover:border-slate-300 whitespace-nowrap">
                      Enlace
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
