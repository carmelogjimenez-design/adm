import { getPlayers } from '@/lib/queries'
import CaptacionBoard from './CaptacionBoard'
import LeadTools from './LeadTools'

export default async function CaptacionPage() {
  const players = await getPlayers()
  return (
    <div className="px-8 py-8">
      <div className="fade-up flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Pipeline</div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Captación</h1>
          <p className="text-slate-500 text-[15px] mt-1.5">Del primer contacto a cliente activo. Pulsa una tarjeta para abrir la ficha.</p>
        </div>
        <LeadTools />
      </div>
      <CaptacionBoard players={players as any} />
    </div>
  )
}
