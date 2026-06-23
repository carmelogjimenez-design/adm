import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getDocCategories, getFaqs, getHelpLinks } from '@/lib/queries'
import FamilyNav from '../FamilyNav'
import { GUIAS } from '../guias'

type QA = { q: string; a: string }

function Faq({ items }: { items: QA[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((it, i) => (
        <details key={i} className="group card-soft bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <summary className="list-none cursor-pointer flex items-center gap-3 px-4 py-3.5 select-none">
            <span className="flex-1 text-[14px] font-bold text-slate-900">{it.q}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 shrink-0"><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          <div className="px-4 pb-4 -mt-1 text-[13.5px] leading-relaxed text-slate-500">{it.a}</div>
        </details>
      ))}
    </div>
  )
}

export default async function AyudaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getMyProfile()
  if (!profile || profile.status !== 'approved') redirect('/pendiente')
  if (profile.role !== 'family') redirect('/panel')

  const categories = (await getDocCategories()) as any[]
  const withGuide = categories.filter(c => GUIAS[c.code]?.info || GUIAS[c.code]?.info_naia || GUIAS[c.code]?.ejemplo)
  const [faqs, links] = await Promise.all([getFaqs(), getHelpLinks()])

  return (
    <div className="app-aurora min-h-screen bg-[#FBFCFE]">
      <FamilyNav />
      <div className="max-w-3xl mx-auto px-5 py-7">
        <div className="fade-up">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">Estamos contigo</div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Ayuda y dudas</h1>
          <p className="text-slate-500 text-[15px] mt-1.5">Guías oficiales de ADM y respuestas a lo que más preguntan las familias.</p>
        </div>

        {/* guias esenciales */}
        <h2 className="fade-up text-[12px] font-bold uppercase tracking-[0.14em] grad-text inline-block mt-7 mb-3">Guías esenciales</h2>
        <div className="fade-up grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ animationDelay: '60ms' }}>
          {links.map((g: any) => (
            <a key={g.id} href={g.url || '#'} target="_blank" rel="noopener"
              className="card-soft card-hover bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl grad-accent text-white grid place-items-center shrink-0 glow-brand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /></svg>
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-slate-900">{g.title}</div>
                <div className="text-[12px] text-slate-400">{g.subtitle}</div>
              </div>
            </a>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="fade-up text-[12px] font-bold uppercase tracking-[0.14em] grad-text inline-block mt-8 mb-3">Preguntas frecuentes</h2>
        <div className="fade-up" style={{ animationDelay: '60ms' }}><Faq items={faqs.map((x: any) => ({ q: x.question, a: x.answer }))} /></div>

        {/* guias por documento */}
        <h2 className="fade-up text-[12px] font-bold uppercase tracking-[0.14em] grad-text inline-block mt-8 mb-3">Guías por documento</h2>
        <p className="fade-up text-[13px] text-slate-400 mb-3">Cómo conseguir cada documento, con ejemplos.</p>
        <div className="fade-up card-soft bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
          {withGuide.map(c => {
            const g = GUIAS[c.code]
            return (
              <div key={c.code} className="flex items-center gap-3 px-4 py-3 flex-wrap">
                <span className="flex-1 min-w-0 text-[13.5px] font-bold text-slate-900">{c.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {g.info && <a href={g.info} target="_blank" rel="noopener" className="text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-[#0F5EFF]/[0.08] text-[#0F5EFF]">Guía</a>}
                  {g.info_naia && <a href={g.info_naia} target="_blank" rel="noopener" className="text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-[#0F5EFF]/[0.08] text-[#0F5EFF]">Guía NAIA</a>}
                  {g.info_ncaa && <a href={g.info_ncaa} target="_blank" rel="noopener" className="text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-[#0F5EFF]/[0.08] text-[#0F5EFF]">Guía NCAA</a>}
                  {g.ejemplo && <a href={g.ejemplo} target="_blank" rel="noopener" className="text-[12px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500">Ejemplo</a>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="fade-up card-soft grad-accent text-white rounded-2xl p-5 mt-7 glow-brand">
          <div className="text-[15px] font-extrabold">¿No encuentras tu respuesta?</div>
          <p className="text-[13.5px] opacity-95 mt-1">Tu asesor de ADM está para ayudarte en cualquier paso. Escríbele y te guía.</p>
          <Link href="/documentos" className="inline-flex items-center gap-1 mt-3 bg-white/20 rounded-lg px-3 py-1.5 text-[13px] font-bold">Ir a mis documentos →</Link>
        </div>
      </div>
    </div>
  )
}
