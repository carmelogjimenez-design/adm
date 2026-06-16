import { getPlayers } from '@/lib/queries'

const STAGE_NAMES: Record<string, string> = {
  lead: 'Lead detectado', first_contact: 'Primer contacto', interested: 'Interesado',
  docs_requested: 'Doc. solicitada', contract_sent: 'Contrato enviado',
  contract_signed: 'Contrato firmado', initial_paid: 'Pago inicial', active: 'Cliente activo',
}
function divLabel(d: string | null) {
  if (!d) return '—'
  return d.replace('NCAA_', '').replace('NJCAA', 'JUCO')
}

export default async function JugadoresPage() {
  const players = await getPlayers()

  return (
    <div className="max-w-5xl mx-auto px-8 py-7">
      <div className="text-[11px] font-bold uppercase tracking-widest text-[#0F5EFF] mb-1.5">Cartera</div>
      <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Jugadores</h1>
      <p className="text-slate-500 text-sm mt-1.5 mb-6">{players.length} {players.length === 1 ? 'jugador' : 'jugadores'} en cartera.</p>

      {players.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <p className="text-sm text-slate-500">Aún no hay jugadores. Cuando una familia complete el formulario de solicitud, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Jugador', 'Posición', 'Graduación', 'Estado', 'Nivel', 'Potencial'].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4 py-3 border-b border-slate-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center text-[11px] font-bold text-slate-500">
                        {(p.first_name?.[0] ?? '') + (p.last_name?.[0] ?? '')}
                      </div>
                      <div className="leading-tight">
                        <div className="text-[13px] font-bold text-slate-900">{p.first_name} {p.last_name}</div>
                        <div className="text-[11px] text-slate-400">{p.current_club || '—'}{p.category ? ` · ${p.category}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-700">{p.primary_position || '—'}</td>
                  <td className="px-4 py-3 text-[13px] font-mono text-slate-600">{p.graduation_year || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0F5EFF]/10 text-[#0F5EFF]">{STAGE_NAMES[p.stage] ?? p.stage}</span>
                  </td>
                  <td className="px-4 py-3"><span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{divLabel(p.target_division)}</span></td>
                  <td className="px-4 py-3 text-[13px] font-mono font-bold text-slate-700">{p.potential_score ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
