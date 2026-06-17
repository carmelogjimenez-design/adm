'use client'
import { useEffect, useState } from 'react'

type Step = { eyebrow: string; title: string; text: string; icon: React.ReactNode; accent?: boolean }
const STEPS: Step[] = [
  {
    eyebrow: 'Bienvenido', title: 'ADM Operations', accent: true,
    text: 'Tu centro de mando para llevar a cada jugador de España al campus en EE. UU. Te enseñamos lo esencial en 30 segundos.',
    icon: <><path d="M3 9l9-5 9 5-9 5-9-5z" /><path d="M21 9v6M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5" /></>,
  },
  {
    eyebrow: 'Tu día', title: 'Dashboard y tareas',
    text: 'KPIs en vivo: conversión, ofertas del mes y jugadores en riesgo. Y “Tu día a día” para organizar tus tareas con prioridad y fecha.',
    icon: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  },
  {
    eyebrow: 'Pipeline', title: 'Captación y búsqueda',
    text: 'Arrastra jugadores entre fases en el Kanban y cambia su estado al soltar. Pulsa ⌘K (o Ctrl+K) en cualquier momento para buscar jugadores y universidades.',
    icon: <><path d="M4 7h10M4 12h16M4 17h7" /><circle cx="18" cy="7" r="2" fill="currentColor" /><circle cx="14" cy="17" r="2" fill="currentColor" /></>,
  },
  {
    eyebrow: 'Cada jugador', title: 'La ficha lo es todo',
    text: 'Fases del proceso, matching de universidades, ofertas de beca, finanzas, documentos (subir y aprobar) y mensajes con la familia — todo en un único sitio.',
    icon: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.6" /><path d="M16 14.5a4.5 4.5 0 0 1 5 4.5" /></>,
  },
  {
    eyebrow: 'Siempre al día', title: 'Universidades y avisos',
    text: '600+ contactos de coaches que alimentan el matching. Y la campanita 🔔 te avisa de novedades y de lo que tienes para hoy.',
    icon: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  },
]

export default function AdminOnboarding() {
  const [show, setShow] = useState(false)
  const [i, setI] = useState(0)
  const [dontShow, setDontShow] = useState(false)

  useEffect(() => {
    try {
      const force = new URLSearchParams(window.location.search).get('tour') === '1'
      if (force) { setShow(true); return }
      if (localStorage.getItem('adm_onboarding_off') === '1') return
      if (sessionStorage.getItem('adm_onboarding_seen') === '1') return
      setShow(true)
    } catch { setShow(true) }
  }, [])

  function close() {
    try {
      sessionStorage.setItem('adm_onboarding_seen', '1')
      if (dontShow) localStorage.setItem('adm_onboarding_off', '1')
    } catch {}
    setShow(false)
  }

  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') setI(v => Math.min(STEPS.length - 1, v + 1))
      if (e.key === 'ArrowLeft') setI(v => Math.max(0, v - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show, dontShow])

  if (!show) return null
  const s = STEPS[i]
  const last = i === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl" style={{ animation: 'fadeUp .35s ease both' }}>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}}' }} />
        {/* cabecera con gradiente */}
        <div className="grad-accent text-white px-7 pt-7 pb-8 relative">
          <button onClick={close} className="absolute top-4 right-4 text-white/70 hover:text-white text-[12.5px] font-semibold">Saltar</button>
          <div className="w-14 h-14 rounded-2xl bg-white/15 grid place-items-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-7 h-7">{s.icon}</svg>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-90">{s.eyebrow}</div>
          <div className="text-[24px] font-extrabold tracking-tight mt-1">{s.title}</div>
        </div>
        {/* cuerpo */}
        <div className="px-7 py-6">
          <p className="text-[14.5px] leading-relaxed text-slate-600">{s.text}</p>

          <div className="flex items-center gap-1.5 mt-6">
            {STEPS.map((_, k) => (
              <button key={k} onClick={() => setI(k)}
                className={'h-1.5 rounded-full transition-all ' + (k === i ? 'w-6 grad-accent' : 'w-1.5 bg-slate-200')} />
            ))}
            <span className="ml-auto text-[11.5px] font-semibold text-slate-400">{i + 1} / {STEPS.length}</span>
          </div>

          <div className="flex items-center gap-2 mt-5">
            {i > 0 && <button onClick={() => setI(i - 1)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-semibold">Atrás</button>}
            {last
              ? <button onClick={close} className="flex-1 py-2.5 rounded-xl grad-accent text-white text-[13.5px] font-bold glow-brand">¡Vamos! 🚀</button>
              : <button onClick={() => setI(i + 1)} className="flex-1 py-2.5 rounded-xl grad-accent text-white text-[13.5px] font-bold glow-brand">Siguiente →</button>}
          </div>

          <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
            <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)} className="accent-[#0F5EFF]" />
            <span className="text-[12px] text-slate-400">No volver a mostrar</span>
          </label>
        </div>
      </div>
    </div>
  )
}
