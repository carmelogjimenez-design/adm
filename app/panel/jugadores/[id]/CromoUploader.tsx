'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CromoUploader({ playerId, initialPath }: { playerId: string; initialPath: string | null }) {
  const supabase = createClient()
  const router = useRouter()
  const [path, setPath] = useState<string | null>(initialPath)
  const [url, setUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  async function sign(p: string) {
    const { data } = await supabase.storage.from('documentos').createSignedUrl(p, 3600)
    setUrl(data?.signedUrl ?? null)
  }
  useEffect(() => { if (path) sign(path) }, [path])

  async function upload(file: File) {
    if (!file.type.startsWith('image/')) { setErr('Sube una imagen (JPG o PNG).'); return }
    setBusy(true); setErr(null)
    try {
      const safe = file.name.replace(/[^\w.\-]/g, '_')
      const p = `${playerId}/cromo/${Date.now()}-${safe}`
      const { error: upErr } = await supabase.storage.from('documentos').upload(p, file, { upsert: true })
      if (upErr) throw upErr
      const { error: dbErr } = await supabase.from('players').update({ card_photo_path: p }).eq('id', playerId)
      if (dbErr) throw dbErr
      setPath(p); router.refresh()
    } catch (e: any) { setErr(e.message ?? 'Error al subir') }
    setBusy(false)
  }
  async function remove() {
    if (!confirm('¿Quitar el cromo del jugador?')) return
    setBusy(true)
    await supabase.from('players').update({ card_photo_path: null }).eq('id', playerId)
    setPath(null); setUrl(null); setBusy(false); router.refresh()
  }

  return (
    <div className="fade-up card-soft bg-white border border-slate-100 rounded-2xl p-5">
      <h3 className="font-bold text-[14.5px] text-slate-900 mb-3">Cromo del jugador</h3>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-[88px] h-[112px] rounded-xl overflow-hidden border border-slate-100 grid place-items-center shrink-0" style={{ background: url ? '#fff' : 'rgba(15,94,255,0.06)' }}>
          {url
            ? <img src={url} alt="Cromo" className="w-full h-full object-cover" />
            : <svg viewBox="0 0 24 24" fill="none" stroke="#9aa4b2" strokeWidth="1.6" className="w-7 h-7"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5L5 21" /></svg>}
        </div>
        <div className="min-w-0">
          <p className="text-[12.5px] text-slate-500 mb-2 max-w-xs">Esta foto se muestra en el panel de la familia. Usa una imagen vertical tipo cromo (JPG o PNG).</p>
          <div className="flex gap-2">
            <input ref={input} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} />
            <button onClick={() => input.current?.click()} disabled={busy} className="px-3.5 py-2 rounded-xl grad-accent text-white text-[13px] font-bold glow-brand disabled:opacity-50">{busy ? 'Subiendo…' : (path ? 'Cambiar cromo' : 'Subir cromo')}</button>
            {path && <button onClick={remove} disabled={busy} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-semibold">Quitar</button>}
          </div>
          {err && <p className="text-[12px] text-red-600 mt-2">{err}</p>}
        </div>
      </div>
    </div>
  )
}
