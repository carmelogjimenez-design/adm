import Link from 'next/link'
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
function divLabel(d: string | null) { return d ? d.replace('NCAA_', '').replace('NJCAA', 'JUCO') : null }

export default async function CaptacionPage() {
  const players = await getPlayers()
  const byStage: Record<string, typeof players> = {}
  for (const [id] of STAGES) byStage[id] = []
  for (const p of players) (byStage[p.stage] ??= []).push(p)

  return (
    <div className="px-8 py-8">
      <div className="fade-up">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Pipeline</div>
        <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Captación</h1>
        <p className="text-slate-500 text-[15px] mt-1.5">Del primer contacto a cliente activo.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 mt-7">
        {STAGES.map(([id, label, color], si) => {
          const cards = byStage[id] ?? []
          return (
            <div key={id} className="fade-up shrink-0 w-64 rounded-2xl bg-white/60 backdrop-blur border border-slate-200/70 p-3" style={{ animationDelay: `${si * 50}ms` }}>
              <div className="flex items-center gap-2 px-1.5 py-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-[12.5px] font-bold text-slate-700">{label}</span>
                <span className="ml-auto text-[11px] text-slate-400 font-mono font-bold tabular-nums bg-slate-100 rounded-full px-2 py-0.5">{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {cards.map(p => (
                  <Link key={p.id} href={`/panel/jugadores/${p.id}`}
                    className="block bg-white border border-slate-100 rounded-xl p-3 card-soft card-hover">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg grad-accent text-white grid place-items-center text-[10.5px] font-bold">
                        {(p.first_name?.[0] ?? '') + (p.last_name?.[0] ?? '')}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <div className="text-[13px] font-bold tracking-tight text-slate-900 truncate">{p.first_name} {p.last_name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{p.primary_position || '—'}{p.current_club ? ` · ${p.current_club}` : ''}</div>
                      </div>
                    </div>
                    {divLabel(p.target_division) && (
                      <span className="inline-block mt-2 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#0F5EFF]/10 text-[#0F5EFF]">{divLabel(p.target_division)}</span>
                    )}
                  </Link>
                ))}
                {cards.length === 0 && <div className="text-[11.5px] text-slate-300 px-1.5 py-3 text-center">Vacío</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
