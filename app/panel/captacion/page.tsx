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
const DIV_META: Record<string, { label: string; color: string }> = {
  NCAA_D1: { label: 'D1', color: '#0F5EFF' }, NCAA_D2: { label: 'D2', color: '#0FB5A5' },
  NCAA_D3: { label: 'D3', color: '#7B61FF' }, NAIA: { label: 'NAIA', color: '#E0A526' },
  NJCAA: { label: 'JUCO', color: '#64748B' },
}
const dm = (d: string | null) => DIV_META[d ?? ''] ?? null

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
        <p className="text-slate-500 text-[15px] mt-1.5">Del primer contacto a cliente activo. Pulsa una tarjeta para abrir la ficha y cambiar de fase.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 mt-7" style={{ height: 'calc(100vh - 210px)', minHeight: 440 }}>
        {STAGES.map(([id, label, color], si) => {
          const cards = byStage[id] ?? []
          return (
            <div key={id} className="fade-up w-[284px] shrink-0 flex flex-col rounded-2xl bg-white/55 backdrop-blur border border-slate-200/70 overflow-hidden"
              style={{ animationDelay: `${si * 45}ms` }}>
              <div className="h-1 w-full" style={{ background: color }} />
              <div className="flex items-center gap-2 px-3.5 py-3 border-b border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-[13px] font-bold text-slate-800">{label}</span>
                <span className="ml-auto text-[11px] font-bold font-mono tabular-nums text-slate-500 bg-slate-100 rounded-full min-w-[22px] h-[22px] grid place-items-center px-1.5">{cards.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
                {cards.length === 0 ? (
                  <div className="h-full min-h-[120px] grid place-items-center">
                    <div className="text-center">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 grid place-items-center mx-auto mb-2 text-slate-300">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>
                      </div>
                      <div className="text-[11.5px] text-slate-300 font-medium">Aún nadie aquí</div>
                    </div>
                  </div>
                ) : cards.map(p => {
                  const d = dm(p.target_division)
                  return (
                    <Link key={p.id} href={`/panel/jugadores/${p.id}`}
                      className="block bg-white border border-slate-100 rounded-xl p-3 card-soft card-hover">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg grad-accent text-white grid place-items-center text-[11px] font-bold shrink-0">
                          {(p.first_name?.[0] ?? '') + (p.last_name?.[0] ?? '')}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold tracking-tight text-slate-900 truncate">{p.first_name} {p.last_name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{p.primary_position || '—'}{p.current_club ? ` · ${p.current_club}` : ''}</div>
                        </div>
                      </div>
                      {d && (
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md" style={{ background: `${d.color}1a`, color: d.color }}>{d.label}</span>
                          {p.potential_score != null && <span className="text-[10.5px] font-semibold text-slate-400">· potencial {p.potential_score}</span>}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
