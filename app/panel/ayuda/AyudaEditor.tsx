'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Faq = { id: string; question: string; answer: string; sort_order: number; visible: boolean }
type LinkRow = { id: string; title: string; subtitle: string | null; url: string; sort_order: number; visible: boolean }

const inp = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-[13.5px] focus:border-[#0F5EFF] focus:outline-none bg-white'

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-500">
      <span className={'w-9 h-5 rounded-full relative transition ' + (on ? 'bg-[#16B57C]' : 'bg-slate-300')}>
        <span className={'absolute top-0.5 w-4 h-4 rounded-full bg-white transition ' + (on ? 'left-[18px]' : 'left-0.5')} />
      </span>
      {on ? 'Visible' : 'Oculto'}
    </button>
  )
}

export default function AyudaEditor({ initialFaqs, initialLinks }: { initialFaqs: Faq[]; initialLinks: LinkRow[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs)
  const [links, setLinks] = useState<LinkRow[]>(initialLinks)
  const [saved, setSaved] = useState<string | null>(null)
  const flash = (id: string) => { setSaved(id); setTimeout(() => setSaved(s => s === id ? null : s), 1600) }

  // ---- FAQs ----
  const editFaq = (id: string, k: keyof Faq, v: any) => setFaqs(f => f.map(x => x.id === id ? { ...x, [k]: v } : x))
  async function saveFaq(x: Faq) {
    const { error } = await supabase.from('faqs').update({ question: x.question, answer: x.answer, sort_order: Number(x.sort_order) || 0, visible: x.visible }).eq('id', x.id)
    if (error) { alert(error.message); return }
    flash(x.id); router.refresh()
  }
  async function addFaq() {
    const order = (faqs.reduce((m, f) => Math.max(m, f.sort_order), 0)) + 1
    const { data, error } = await supabase.from('faqs').insert({ question: 'Nueva pregunta', answer: '', sort_order: order, visible: true }).select('id, question, answer, sort_order, visible').single()
    if (error) { alert(error.message); return }
    setFaqs(f => [...f, data as Faq]); router.refresh()
  }
  async function delFaq(id: string) {
    if (!confirm('¿Eliminar esta pregunta?')) return
    await supabase.from('faqs').delete().eq('id', id); setFaqs(f => f.filter(x => x.id !== id)); router.refresh()
  }

  // ---- Links ----
  const editLink = (id: string, k: keyof LinkRow, v: any) => setLinks(l => l.map(x => x.id === id ? { ...x, [k]: v } : x))
  async function saveLink(x: LinkRow) {
    const { error } = await supabase.from('help_links').update({ title: x.title, subtitle: x.subtitle, url: x.url, sort_order: Number(x.sort_order) || 0, visible: x.visible }).eq('id', x.id)
    if (error) { alert(error.message); return }
    flash(x.id); router.refresh()
  }
  async function addLink() {
    const order = (links.reduce((m, l) => Math.max(m, l.sort_order), 0)) + 1
    const { data, error } = await supabase.from('help_links').insert({ title: 'Nueva guía', subtitle: '', url: '', sort_order: order, visible: true }).select('id, title, subtitle, url, sort_order, visible').single()
    if (error) { alert(error.message); return }
    setLinks(l => [...l, data as LinkRow]); router.refresh()
  }
  async function delLink(id: string) {
    if (!confirm('¿Eliminar este enlace?')) return
    await supabase.from('help_links').delete().eq('id', id); setLinks(l => l.filter(x => x.id !== id)); router.refresh()
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      {/* GUIAS / ENLACES */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Guías y enlaces web</h2>
          <button onClick={addLink} className="text-[12.5px] font-bold grad-text">+ Nuevo enlace</button>
        </div>
        <div className="flex flex-col gap-3">
          {links.map(l => (
            <div key={l.id} className={'card-soft bg-white border rounded-2xl p-4 ' + (l.visible ? 'border-slate-100' : 'border-amber-200 bg-amber-50/40')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Título</span><input className={inp} value={l.title} onChange={e => editLink(l.id, 'title', e.target.value)} /></label>
                <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Subtítulo</span><input className={inp} value={l.subtitle ?? ''} onChange={e => editLink(l.id, 'subtitle', e.target.value)} /></label>
                <label className="block sm:col-span-2"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Enlace (URL)</span><input className={inp} placeholder="https://…" value={l.url} onChange={e => editLink(l.id, 'url', e.target.value)} /></label>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => saveLink(l)} className="px-3.5 py-1.5 rounded-lg grad-accent text-white text-[12.5px] font-bold glow-brand">Guardar</button>
                {saved === l.id && <span className="text-[12px] font-bold text-emerald-600">✓ Guardado</span>}
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400">orden <input type="number" className="w-14 px-2 py-1 rounded border border-slate-200 text-[12px]" value={l.sort_order} onChange={e => editLink(l.id, 'sort_order', Number(e.target.value))} /></label>
                <div className="ml-auto flex items-center gap-3">
                  <Toggle on={l.visible} onClick={() => editLink(l.id, 'visible', !l.visible)} />
                  <button onClick={() => delLink(l.id)} className="text-[12px] font-semibold text-red-500">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQS */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Preguntas frecuentes</h2>
          <button onClick={addFaq} className="text-[12.5px] font-bold grad-text">+ Nueva FAQ</button>
        </div>
        <div className="flex flex-col gap-3">
          {faqs.map(x => (
            <div key={x.id} className={'card-soft bg-white border rounded-2xl p-4 ' + (x.visible ? 'border-slate-100' : 'border-amber-200 bg-amber-50/40')}>
              <input className={inp + ' font-bold'} value={x.question} onChange={e => editFaq(x.id, 'question', e.target.value)} placeholder="Pregunta" />
              <textarea className={inp + ' mt-2 resize-none'} rows={3} value={x.answer} onChange={e => editFaq(x.id, 'answer', e.target.value)} placeholder="Respuesta" />
              <div className="flex items-center gap-3 mt-2.5">
                <button onClick={() => saveFaq(x)} className="px-3.5 py-1.5 rounded-lg grad-accent text-white text-[12.5px] font-bold glow-brand">Guardar</button>
                {saved === x.id && <span className="text-[12px] font-bold text-emerald-600">✓ Guardado</span>}
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400">orden <input type="number" className="w-14 px-2 py-1 rounded border border-slate-200 text-[12px]" value={x.sort_order} onChange={e => editFaq(x.id, 'sort_order', Number(e.target.value))} /></label>
                <div className="ml-auto flex items-center gap-3">
                  <Toggle on={x.visible} onClick={() => editFaq(x.id, 'visible', !x.visible)} />
                  <button onClick={() => delFaq(x.id)} className="text-[12px] font-semibold text-red-500">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
