'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type Step = { route?: string; sel: string; title: string; text: string; place?: 'bottom' | 'top' | 'right' }
const STEPS: Step[] = [
  { sel: '[data-tour="menu"]', title: 'Tu menú', text: 'Desde aquí navegas por todo el panel. Te lo enseño sección a sección.', place: 'right' },
  { route: '/panel', sel: '[data-tour="kpis"]', title: 'Tu dashboard', text: 'Tus números en vivo: conversión, ofertas del mes, jugadores camino a EE. UU. y en riesgo.', place: 'bottom' },
  { route: '/panel', sel: '[data-tour="tasks"]', title: 'Tu día a día', text: 'Crea tareas con prioridad y fecha. Las de hoy te saltan también en la campana.', place: 'top' },
  { route: '/panel/captacion', sel: 'a[href="/panel/captacion"]', title: 'Captación', text: 'Arrastra jugadores entre fases. Crea un lead a mano o importa un Excel. Busca al instante con ⌘K.', place: 'right' },
  { route: '/panel/jugadores', sel: 'a[href="/panel/jugadores"]', title: 'Jugadores', text: 'Toda tu cartera. Filtra por estado (camino / en EE. UU.) y por universidad de destino.', place: 'right' },
  { route: '/panel/universidades', sel: 'a[href="/panel/universidades"]', title: 'Universidades', text: 'Cientos de contactos de coaches que alimentan el matching de cada jugador.', place: 'right' },
  { route: '/panel/finanzas', sel: 'a[href="/panel/finanzas"]', title: 'Finanzas', text: 'Control de cobros. Y en cada ficha: contrato firmable y facturas en PDF.', place: 'right' },
  { sel: '[data-tour="bell"]', title: 'Novedades', text: 'La campana te avisa de documentos, ofertas, mensajes y lo que tienes para hoy. ¡Listo!', place: 'right' },
]

export default function AdminTour() {
  const pathname = usePathname()
  const router = useRouter()
  const [active, setActive] = useState(false)
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const seeking = useRef(false)

  useEffect(() => {
    const start = () => { setI(0); setActive(true) }
    window.addEventListener('adm-tour-start', start)
    return () => window.removeEventListener('adm-tour-start', start)
  }, [])

  useEffect(() => {
    if (!active) return
    const step = STEPS[i]
    if (step.route && pathname !== step.route) { seeking.current = true; setRect(null); router.push(step.route); return }
    let tries = 0
    const find = () => {
      const el = document.querySelector(step.sel) as HTMLElement | null
      if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => setRect(el.getBoundingClientRect()), 280); return true }
      return false
    }
    if (find()) return
    const id = setInterval(() => { tries++; if (find() || tries > 25) clearInterval(id) }, 100)
    return () => clearInterval(id)
  }, [active, i, pathname])

  useEffect(() => {
    if (!active) return
    const upd = () => { const el = document.querySelector(STEPS[i].sel) as HTMLElement | null; if (el) setRect(el.getBoundingClientRect()) }
    window.addEventListener('resize', upd); window.addEventListener('scroll', upd, true)
    return () => { window.removeEventListener('resize', upd); window.removeEventListener('scroll', upd, true) }
  }, [active, i])

  if (!active) return null
  const step = STEPS[i]
  const pad = 8
  const last = i === STEPS.length - 1
  const close = () => { setActive(false); setRect(null) }

  // posicion del tooltip
  let tip: React.CSSProperties = { maxWidth: 320 }
  if (rect) {
    const place = step.place || 'bottom'
    if (place === 'bottom') tip = { ...tip, top: rect.bottom + 14, left: Math.max(12, Math.min(rect.left, window.innerWidth - 332)) }
    else if (place === 'top') tip = { ...tip, top: Math.max(12, rect.top - 150), left: Math.max(12, Math.min(rect.left, window.innerWidth - 332)) }
    else tip = { ...tip, top: Math.max(12, rect.top), left: Math.min(rect.right + 14, window.innerWidth - 332) }
  } else {
    tip = { ...tip, top: '40%', left: '50%', transform: 'translate(-50%,-50%)' }
  }

  return (
    <div className="fixed inset-0 z-[200]" style={{ pointerEvents: 'none' }}>
      {rect && (
        <div style={{
          position: 'fixed', top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2,
          borderRadius: 14, boxShadow: '0 0 0 9999px rgba(15,23,42,0.55)', transition: 'all .25s ease', pointerEvents: 'none',
          outline: '2px solid rgba(57,230,165,0.9)',
        }} />
      )}
      <div className="card-soft bg-white rounded-2xl p-5 border border-slate-100" style={{ position: 'fixed', pointerEvents: 'auto', ...tip }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text">{step.title}</span>
          <span className="text-[11px] font-semibold text-slate-300">{i + 1}/{STEPS.length}</span>
        </div>
        <p className="text-[13.5px] text-slate-600 leading-relaxed">{step.text}</p>
        <div className="flex items-center justify-between mt-4">
          <button onClick={close} className="text-[12px] font-semibold text-slate-400">Saltar</button>
          <div className="flex gap-2">
            {i > 0 && <button onClick={() => setI(i - 1)} className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12.5px] font-semibold">Atrás</button>}
            <button onClick={() => last ? close() : setI(i + 1)} className="px-4 py-1.5 rounded-lg grad-accent text-white text-[12.5px] font-bold glow-brand">{last ? 'Entendido' : 'Siguiente'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
