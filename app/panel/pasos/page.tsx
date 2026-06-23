import { getPhases } from '@/lib/queries'
import PasosEditor from './PasosEditor'

export default async function PasosPage() {
  const phases = await getPhases()
  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <div className="fade-up">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Contenido</div>
        <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Editar pasos del proceso</h1>
        <p className="text-slate-500 text-[15px] mt-1.5">Cambia el nombre y la descripción de cada paso, u oculta los que no apliquen. La familia lo ve al instante en “Mi camino”.</p>
      </div>
      <PasosEditor initial={phases as any} />
    </div>
  )
}
