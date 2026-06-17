'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { openContractPrint } from '@/lib/contractPdf'

export default function ContractSign({ contract }: { contract: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const has = useRef(false)

  useEffect(() => {
    if (!open || !canvas.current) return
    const cv = canvas.current
    const ctx = cv.getContext('2d')!
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = '#15233a'
    const pos = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) } }
    const down = (e: PointerEvent) => { drawing.current = true; has.current = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); cv.setPointerCapture(e.pointerId) }
    const move = (e: PointerEvent) => { if (!drawing.current) return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke() }
    const up = () => { drawing.current = false }
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
    return () => { cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  }, [open])

  function clear() { const cv = canvas.current!; cv.getContext('2d')!.clearRect(0, 0, cv.width, cv.height); has.current = false }

  async function sign() {
    if (!name.trim()) { alert('Escribe tu nombre completo'); return }
    if (!has.current) { alert('Dibuja tu firma'); return }
    setBusy(true)
    const dataUrl = canvas.current!.toDataURL('image/png')
    const { error } = await supabase.rpc('sign_contract', { p_contract: contract.id, p_name: name.trim(), p_signature: dataUrl })
    setBusy(false)
    if (error) { alert(error.message); return }
    setOpen(false); router.refresh()
  }

  const terms = contract.terms ?? {}

  if (contract.status === 'signed') {
    return (
      <div className="card-soft bg-white rounded-2xl p-5 border border-[#39E6A5]/40 mt-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div><div className="text-[12.5px] font-semibold text-slate-500">Contrato</div><div className="text-[15px] font-extrabold text-emerald-600">✓ Firmado el {contract.signed_at ? new Date(contract.signed_at).toLocaleDateString('es-ES') : ''}</div></div>
          <button onClick={() => openContractPrint(terms, contract.family_signature, contract.signer_name, contract.signed_at)} className="px-4 py-2 rounded-xl grad-accent text-white text-[13px] font-bold glow-brand">Descargar PDF</button>
        </div>
      </div>
    )
  }
  if (contract.status !== 'sent') return null

  return (
    <div className="card-soft bg-white rounded-2xl p-5 border border-amber-200 mt-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-600">Acción requerida</div><div className="text-[16px] font-extrabold text-slate-900">Tienes un contrato para firmar</div></div>
        <button onClick={() => openContractPrint(terms)} className="text-[12.5px] font-semibold grad-text">Leer contrato (PDF) →</button>
      </div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-4 w-full py-2.5 rounded-xl grad-accent text-white text-[14px] font-bold glow-brand">Firmar ahora</button>
      ) : (
        <div className="mt-4">
          <label className="block mb-2"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Nombre completo de quien firma</span>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:border-[#0F5EFF] focus:outline-none" /></label>
          <span className="block text-[11px] font-semibold text-slate-500 mb-1">Firma aquí</span>
          <canvas ref={canvas} width={500} height={150} className="w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 touch-none" style={{ height: 150 }} />
          <div className="flex gap-2 mt-3">
            <button onClick={sign} disabled={busy} className="flex-1 py-2.5 rounded-xl grad-accent text-white text-[13.5px] font-bold disabled:opacity-50 glow-brand">{busy ? 'Firmando…' : 'Firmar y enviar'}</button>
            <button onClick={clear} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-semibold">Borrar</button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Al firmar aceptas las condiciones del contrato de servicios con ADM Sports Group.</p>
        </div>
      )}
    </div>
  )
}
