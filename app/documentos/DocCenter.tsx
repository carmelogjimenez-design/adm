'use client'
import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FamilyNav from '../FamilyNav'

type Cat = { id: number; code: string; name: string; description: string | null; required: boolean; sort_order: number }
type Doc = { id: string; category_id: number; name: string | null; status: string; storage_path: string | null; external_url: string | null }

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-slate-100 text-slate-500' },
  uploaded: { label: 'Subido', cls: 'bg-[#0F5EFF]/10 text-[#0F5EFF]' },
  reviewed: { label: 'En revisión', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Aprobado', cls: 'bg-[#39E6A5]/20 text-emerald-700' },
  correction_required: { label: 'Corregir', cls: 'bg-red-100 text-red-600' },
}

// Las 22 categorias agrupadas en pasos logicos del proceso
const GROUPS: { title: string; sub: string; ids: number[] }[] = [
  { title: 'Datos personales', sub: 'Para identificarte', ids: [1, 2] },
  { title: 'Expediente académico', sub: 'Tus notas y títulos', ids: [3, 4, 5, 17, 18] },
  { title: 'Inglés y exámenes', sub: 'Acredita tu nivel de inglés', ids: [9, 10, 11] },
  { title: 'Vídeos de juego', sub: 'Para que te vean los coaches', ids: [12, 13] },
  { title: 'Registros y admisión', sub: 'Inscripciones y solicitud', ids: [7, 8, 16, 15, 19] },
  { title: 'Visado y solvencia', sub: 'Para el I-20 y el visado', ids: [6, 14] },
  { title: 'Llegada a EE. UU.', sub: 'Últimos pasos antes de volar', ids: [20, 21, 22] },
]

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
  const [step, setStep] = useState(0)
  const inputs = useRef<Record<number, HTMLInputElement | null>>({})

  const byId = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c])), [categories])
  const steps = useMemo(() => GROUPS.map(g => ({
    ...g, cats: g.ids.map(id => byId[id]).filter(Boolean) as Cat[],
  })).filter(s => s.cats.length), [byId])

  const requiredCats = categories.filter(c => c.required)
  const doneRequired = requiredCats.filter(c => docs[c.id]).length
  const pct = Math.round((doneRequired / Math.max(requiredCats.length, 1)) * 100)
  const allDone = doneRequired === requiredCats.length

  const stepComplete = (s: { cats: Cat[] }) => s.cats.filter(c => c.required).every(c => docs[c.id])
  const cur = steps[step]

  async function uploadFile(cat: Cat, file: File) {
    setBusy(cat.id); setError(null)
    try {
      const safe = file.name.replace(/[^\w.\-]/g, '_')
      const path = `${playerId}/${cat.code}/${Date.now()}-${safe}`
      const { error: upErr } = await supabase.storage.from('documentos').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { error: rpcErr } = await supabase.rpc('upsert_document', { p_category: cat.id, p_path: path, p_name: file.name, p_url: null })
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
    const { error: rpcErr } = await supabase.rpc('upsert_document', { p_category: cat.id, p_path: null, p_name: 'Enlace', p_url: url })
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
    <div className="app-aurora min-h-screen bg-[#FBFCFE]">
      <FamilyNav />
      <div className="max-w-2xl mx-auto px-5 py-7">
        <div className="fade-up">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">Centro documental</div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Tus documentos</h1>
          <p className="text-slate-500 text-[14.5px] mt-1.5">{playerName} · ve paso a paso, sin agobios. Puedes subir un archivo o pegar un enlace.</p>
        </div>

        {/* progreso global */}
        <div className="fade-up card-soft bg-white rounded-2xl p-4 border border-slate-100 mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] font-semibold text-slate-600">{allDone ? '¡Todo lo obligatorio está completo!' : 'Progreso de documentos obligatorios'}</span>
            <span className="text-[12.5px] font-bold font-mono tabular-nums text-slate-700">{doneRequired}/{requiredCats.length}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full grad-accent transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* rail de pasos */}
        <div className="fade-up flex gap-2 mt-4 overflow-x-auto pb-1">
          {steps.map((s, i) => {
            const done = stepComplete(s)
            const active = i === step
            return (
              <button key={i} onClick={() => setStep(i)}
                className={'shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-[12.5px] font-semibold transition ' +
                  (active ? 'grad-accent text-white border-transparent glow-brand'
                    : done ? 'bg-[#39E6A5]/15 text-emerald-700 border-[#39E6A5]/30'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300')}>
                <span className={'w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold ' +
                  (active ? 'bg-white/25' : done ? 'bg-[#16B57C] text-white' : 'bg-slate-100 text-slate-400')}>
                  {done && !active ? '✓' : i + 1}
                </span>
                <span className="whitespace-nowrap">{s.title}</span>
              </button>
            )
          })}
        </div>

        {error && <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

        {/* paso actual */}
        <div key={step} className="fade-up mt-4">
          <div className="mb-3">
            <div className="text-[11px] font-semibold text-slate-400">Paso {step + 1} de {steps.length}</div>
            <h2 className="text-[19px] font-extrabold tracking-tight text-slate-900">{cur.title}</h2>
            <p className="text-[13px] text-slate-400">{cur.sub}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {cur.cats.map(cat => {
              const doc = docs[cat.id]
              const st = STATUS[doc?.status ?? 'pending'] ?? STATUS.pending
              const has = !!doc
              return (
                <div key={cat.id} className={'card-soft bg-white border rounded-2xl p-4 transition ' + (has ? 'border-[#39E6A5]/40' : 'border-slate-100')}>
                  <div className="flex items-start gap-3">
                    <div className={'w-9 h-9 rounded-xl grid place-items-center shrink-0 ' + (has ? 'bg-[#39E6A5]/20 text-emerald-600' : 'bg-slate-100 text-slate-300')}>
                      {has
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="w-4 h-4"><path d="M5 12l5 5L20 7" /></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 16V4m0 0L8 8m4-4l4 4M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1" /></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-bold text-slate-900">{cat.name}</span>
                        {!cat.required && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">Opcional</span>}
                        <span className={'text-[10.5px] font-bold px-2 py-0.5 rounded-full ' + st.cls}>{st.label}</span>
                      </div>
                      {cat.description && <p className="text-[12px] text-slate-400 mt-0.5">{cat.description}</p>}
                      {doc && (
                        <button onClick={() => view(doc)} className="text-[12px] font-semibold grad-text mt-1.5 inline-flex items-center gap-1">
                          Ver {doc.external_url ? 'enlace' : 'archivo'} →
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <input ref={el => { inputs.current[cat.id] = el }} type="file" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(cat, f) }} />
                      <button onClick={() => inputs.current[cat.id]?.click()} disabled={busy === cat.id}
                        className="px-3 py-1.5 rounded-lg grad-accent text-white text-[12px] font-semibold disabled:opacity-50 whitespace-nowrap">
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

          {/* navegacion */}
          <div className="flex items-center justify-between mt-5">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-semibold disabled:opacity-40">
              ← Anterior
            </button>
            {step < steps.length - 1
              ? <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                  className="px-5 py-2.5 rounded-xl grad-accent text-white text-[13px] font-bold glow-brand">Siguiente →</button>
              : <span className="text-[13px] font-bold text-emerald-600">{allDone ? '¡Has completado todo! 🎉' : 'Último paso'}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
