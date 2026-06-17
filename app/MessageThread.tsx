'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function ago(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function MessageThread({ playerId, height = 380 }: { playerId: string; height?: number }) {
  const supabase = createClient()
  const [msgs, setMsgs] = useState<any[]>([])
  const [uid, setUid] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  async function load(scroll = false) {
    const { data } = await supabase.from('messages')
      .select('id, body, created_at, sender_id, profiles(full_name, role)')
      .eq('player_id', playerId).order('created_at', { ascending: true })
    setMsgs(data ?? [])
    if (scroll) setTimeout(() => end.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUid(user?.id ?? null)
      await load(true)
    })()
    const t = setInterval(() => load(false), 8000)
    return () => clearInterval(t)
  }, [playerId])

  async function send() {
    const body = text.trim()
    if (!body || !uid) return
    setBusy(true); setText('')
    const { error } = await supabase.from('messages').insert({ player_id: playerId, sender_id: uid, body, channel: 'internal' })
    setBusy(false)
    if (error) { alert(error.message); setText(body); return }
    load(true)
  }

  return (
    <div className="card-soft bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="#0F5EFF" strokeWidth="1.9" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text">Mensajes con tu asesor</h2>
      </div>
      <div className="overflow-y-auto p-4 flex flex-col gap-2.5" style={{ height }}>
        {msgs.length === 0 ? (
          <div className="m-auto text-center text-[13px] text-slate-400">Aún no hay mensajes.<br />Escribe la primera pregunta a tu asesor 👋</div>
        ) : msgs.map(m => {
          const mine = m.sender_id === uid
          const prof = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
          const who = mine ? 'Tú' : (prof?.role === 'family' ? (prof?.full_name || 'Familia') : 'Asesor ADM')
          return (
            <div key={m.id} className={'flex flex-col max-w-[80%] ' + (mine ? 'self-end items-end' : 'self-start items-start')}>
              <div className={'rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug ' + (mine ? 'grad-accent text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md')}>{m.body}</div>
              <div className="text-[10.5px] text-slate-400 mt-1 px-1">{who} · {ago(m.created_at)}</div>
            </div>
          )
        })}
        <div ref={end} />
      </div>
      <div className="border-t border-slate-100 p-3 flex items-end gap-2">
        <textarea value={text} onChange={e => setText(e.target.value)} rows={1} placeholder="Escribe un mensaje…"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          className="flex-1 resize-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13.5px] focus:border-[#0F5EFF] focus:outline-none max-h-28" />
        <button onClick={send} disabled={busy || !text.trim()} className="px-4 py-2.5 rounded-xl grad-accent text-white text-[13px] font-bold disabled:opacity-40 shrink-0">Enviar</button>
      </div>
    </div>
  )
}
