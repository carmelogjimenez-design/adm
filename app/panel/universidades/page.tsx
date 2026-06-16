import { getUniversities } from '@/lib/queries'
import UniversitiesTable from './UniversitiesTable'

export default async function UniversidadesPage() {
  const unis = await getUniversities()
  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="fade-up">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Base de contactos</div>
        <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Universidades</h1>
        <p className="text-slate-500 text-[15px] mt-1.5">{unis.length} universidades · coaches, email y WhatsApp. Edita o completa lo que falte.</p>
      </div>
      <UniversitiesTable rows={unis as any} />
    </div>
  )
}
