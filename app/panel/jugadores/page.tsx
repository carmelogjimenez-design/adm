import Link from 'next/link'
import { getPlayers } from '@/lib/queries'

const STAGE_NAMES: Record<string, string> = {
  lead: 'Lead detectado', first_contact: 'Primer contacto', interested: 'Interesado',
  docs_requested: 'Doc. solicitada', contract_sent: 'Contrato enviado',
  contract_signed: 'Contrato firmado', initial_paid: 'Pago inicial', active: 'Cliente activo',
}
function divLabel(d: string | null) { return d ? d.replace('NCAA_', '').replace('NJCAA', 'JUCO') : '—' }

export default async function JugadoresPage() {
  const players = await getPlayers()
  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="fade-up">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Cartera</div>
        <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Jugadores</h1>
        <p className="text-slate-500 text-[15px] mt-1.5">{players.length} {players.length === 1 ? 'jugador' : 'jugadores'} en cartera.</p>
      </div>

      {players.length === 0 ? (
        <div className="fade-up mt-7 bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <p className="text-sm text-slate-500">Aún no hay jugadores. Cuando una familia complete el formulario, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="fade-up mt-7 bg-white border border-slate-100 rounded-2xl overflow-hidden card-soft">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/70">
                {['Jugador', 'Posición', 'Graduación', 'Estado', 'Nivel', 'Potencial', ''].map((h, i) => (
                  <th key={i} className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4 py-3 border-b border-slate-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-[#0F5EFF]/[0.03] transition">
                  <td className="px-4 py-3">
                    <Link href={`/panel/jugadores/${p.id}`} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl grad-accent text-white grid place-items-center text-[11px] font-bold">
                        {(p.first_name?.[0] ?? '') + (p.last_name?.[0] ?? '')}
                      </div>
                      <div className="leading-tight">
                        <div className="text-[13.5px] font-bold text-slate-900">{p.first_name} {p.last_name}</div>
                        <div className="text-[11px] text-slate-400">{p.current_club || '—'}{p.category ? ` · ${p.category}` : ''}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-700">{p.primary_position || '—'}</td>
                  <td className="px-4 py-3 text-[13px] font-mono text-slate-600 tabular-nums">{p.graduation_year || '—'}</td>
                  <td className="px-4 py-3"><span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0F5EFF]/10 text-[#0F5EFF]">{STAGE_NAMES[p.stage] ?? p.stage}</span></td>
                  <td className="px-4 py-3"><span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{divLabel(p.target_division)}</span></td>
                  <td className="px-4 py-3 text-[13px] font-mono font-bold text-slate-700 tabular-nums">{p.potential_score ?? '—'}</td>
                  <td className="px-4 py-3 text-right"><Link href={`/panel/jugadores/${p.id}`} className="text-[12px] font-semibold grad-text">Ver →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
