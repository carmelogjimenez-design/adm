'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const STAGES: [string, string][] = [
  ['lead', 'Lead detectado'], ['first_contact', 'Primer contacto'], ['interested', 'Interesado'],
  ['docs_requested', 'Doc. solicitada'], ['contract_sent', 'Contrato enviado'],
  ['contract_signed', 'Contrato firmado'], ['initial_paid', 'Pago inicial'], ['active', 'Cliente activo'],
]

export default function StageSelect({ playerId, current }: { playerId: string; current: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [stage, setStage] = useState(current)
  const [saving, setSaving] = useState(false)

  async function change(next: string) {
    setStage(next); setSaving(true)
    const { error } = await supabase.from('players')
      .update({ stage: next, is_active: next === 'active' }).eq('id', playerId)
    setSaving(false)
    if (error) { alert(error.message); setStage(current); return }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <select value={stage} onChange={e => change(e.target.value)} disabled={saving}
        className="text-[13px] font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-[#0F5EFF] focus:outline-none">
        {STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {saving && <span className="text-[11px] text-slate-400">Guardando…</span>}
    </div>
  )
}
