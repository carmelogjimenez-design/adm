import { getAllFaqs, getAllHelpLinks } from '@/lib/queries'
import AyudaEditor from './AyudaEditor'

export default async function EditarAyudaPage() {
  const [faqs, links] = await Promise.all([getAllFaqs(), getAllHelpLinks()])
  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <div className="fade-up">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Contenido</div>
        <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Editar ayuda</h1>
        <p className="text-slate-500 text-[15px] mt-1.5">Gestiona las guías con enlaces web y las preguntas frecuentes. La familia lo ve al instante en su sección de Ayuda.</p>
      </div>
      <AyudaEditor initialFaqs={faqs as any} initialLinks={links as any} />
    </div>
  )
}
