import { getPlayers } from '@/lib/queries'

const STAGES: [string, string, string][] = [
  ['lead', 'Lead detectado', '#9AA3B2'],
  ['first_contact', 'Primer contacto', '#0F5EFF'],
  ['interested', 'Interesado', '#0F5EFF'],
  ['docs_requested', 'Doc. solicitada', '#7B61FF'],
  ['contract_sent', 'Contrato enviado', '#E0A526'],
  ['contract_signed', 'Contrato firmado', '#16B57C'],
  ['initial_paid', 'Pago inicial', '#16B57C'],
  ['active', 'Cliente activo', '#39E6A5'],
]

function divLabel(d: string | null) {
  if (!d) return null
  return d.replace('NCAA_', '').replace('NJCAA', 'JUCO')
}

export default async function CaptacionPage() {
  const players = await getPlayers()
  const byStage: Record<string, typeof players> = {}
  for (const [id] of STAGES) byStage[id] = []
  for (const p of players) (byStage[p.stage] ??= []).push(p)

  return (
    <div className="px-8 py-7">
      <div className="text-[11px] font-bold uppercase tracking-widest text-[#0F5EFF] mb-1.5">Pipeline</div>
      <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Captación</h1>
      <p className="text-slate-500 text-sm mt-1.5 mb-6">Del primer contacto a cliente activo.</p>

      <div className="flex gap-3.5 overflow-x-auto pb-4">
        {STAGES.map(([id, label, color]) => {
          const cards = byStage[id] ?? []
          return (
            <div key={id} className="shrink-0 w-60 bg-slate-100/70 rounded-2xl p-2.5">
              <div className="flex items-center gap-2 px-1.5 py-2 text-[12.5px] font-bold text-slate-700">
                <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                {label}
                <span className="ml-auto text-[11px] text-slate-400 font-mono">{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {cards.map(p => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 grid place-items-center text-[10.5px] font-bold text-slate-500">
                        {(p.first_name?.[0] ?? '') + (p.last_name?.[0] ?? '')}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <div className="text-[13px] font-bold tracking-tight text-slate-900 truncate">{p.first_name} {p.last_name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{p.primary_position || '—'}{p.current_club ? ` · ${p.current_club}` : ''}</div>
                      </div>
                    </div>
                    {divLabel(p.target_division) && (
                      <div className="mt-2">
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#0F5EFF]/10 text-[#0F5EFF]">{divLabel(p.target_division)}</span>
                      </div>
                    )}
                  </div>
                ))}
                {cards.length === 0 && <div className="text-[11.5px] text-slate-300 px-1.5 py-2">—</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
