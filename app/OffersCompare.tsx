'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DIV: Record<string, string> = { NCAA_D1: 'NCAA D1', NCAA_D2: 'NCAA D2', NCAA_D3: 'NCAA D3', NAIA: 'NAIA', NJCAA: 'JUCO' }

export default function OffersCompare({ offers }: { offers: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const accepted = offers.find(o => o.status === 'accepted')

  async function choose(id: string, uni: string) {
    if (!confirm(`¿Elegir ${uni}? Se marcará como tu universidad y se avisará a tu asesor.`)) return
    setBusy(id)
    const { error } = await supabase.rpc('choose_offer', { p_offer: id })
    setBusy(null)
    if (error) { alert(error.message); return }
    router.refresh()
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {offers.map(o => {
        const uni = Array.isArray(o.universities) ? o.universities[0] : o.universities
        const gastos = o.family_cost_range && String(o.family_cost_range).trim() ? String(o.family_cost_range).trim() : null
        const isAcc = o.status === 'accepted'
        return (
          <div key={o.id} className={'shrink-0 w-[240px] rounded-2xl border p-4 card-soft ' + (isAcc ? 'border-[#16B57C] ring-2 ring-[#39E6A5]/30' : 'border-slate-100')}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg grad-accent text-white grid place-items-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M3 9l9-5 9 5-9 5-9-5z" /><path d="M21 9v5" /></svg>
              </div>
              {isAcc && <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#16B57C] text-white">✓ Elegida</span>}
            </div>
            <div className="text-[15px] font-extrabold text-slate-900 mt-2.5 leading-tight">{uni?.name ?? 'Universidad'}</div>
            <div className="text-[11.5px] text-slate-400">{uni?.division ? DIV[uni.division] : ''}{uni?.state ? ` · ${uni.state}` : ''}</div>

            <div className="mt-3">
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Gastos estimados</div>
                <div className="text-[15px] font-extrabold grad-text mt-0.5">{gastos ?? 'Te lo detalla tu asesor'}</div>
                <div className="text-[10.5px] text-slate-400 mt-0.5">aproximado por año</div>
              </div>
              <div className="mt-2"><Row k="Fecha límite" v={o.deadline ? new Date(o.deadline).toLocaleDateString('es-ES') : '—'} /></div>
            </div>

            {accepted ? (
              isAcc ? <div className="mt-3 text-center text-[12px] font-bold text-emerald-600">Tu elección</div>
                : <div className="mt-3 text-center text-[12px] text-slate-300 font-semibold">—</div>
            ) : (
              <button onClick={() => choose(o.id, uni?.name ?? 'esta universidad')} disabled={busy === o.id}
                className="mt-3 w-full py-2 rounded-xl grad-accent text-white text-[12.5px] font-bold disabled:opacity-50 glow-brand">
                {busy === o.id ? 'Eligiendo…' : 'Elegir esta'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
function Row({ k, v, hot }: { k: string; v: string; hot?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11.5px] text-slate-400">{k}</span>
      <span className={hot ? 'text-[15px] font-extrabold grad-text' : 'text-[12.5px] font-semibold text-slate-700'}>{v}</span>
    </div>
  )
}
