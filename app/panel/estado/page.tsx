import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const STATES: { key: string; label: string; color: string; bg: string }[] = [
  { key: 'activo', label: 'Activo', color: '#0F5EFF', bg: 'rgba(15,94,255,0.10)' },
  { key: 'en_usa', label: 'En activo en USA', color: '#16B57C', bg: 'rgba(22,181,124,0.12)' },
  { key: 'abandono', label: 'Abandonó el proceso', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  { key: 'graduado', label: 'Graduado', color: '#7B61FF', bg: 'rgba(123,97,255,0.12)' },
]
const divLabel = (d: string | null) => d ? d.replace('NCAA_', '').replace('NJCAA', 'JUCO') : null

export default async function EstadoPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('players')
    .select('id, first_name, last_name, primary_position, target_division, lifecycle_status')
    .order('first_name')
  const players = (data ?? []) as any[]
  const by: Record<string, any[]> = { activo: [], en_usa: [], abandono: [], graduado: [] }
  for (const p of players) { const k = p.lifecycle_status ?? 'activo'; (by[k] ??= []).push(p) }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="fade-up">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Cartera</div>
        <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Jugadores por estado</h1>
        <p className="text-slate-500 text-[15px] mt-1.5">El estado lo marcas en cada ficha. Aquí ves el recuento y quién está en cada uno.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-7">
        {STATES.map((s, i) => (
          <div key={s.key} className="fade-up card-soft card-hover bg-white rounded-2xl p-5 pt-6 border border-slate-100 relative overflow-hidden" style={{ animationDelay: `${i * 55}ms` }}>
            <span className="absolute left-0 right-0 top-0 h-1" style={{ background: s.color }} />
            <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: s.bg, color: s.color }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            </div>
            <div className="mt-4 text-[34px] leading-none font-extrabold tracking-tight tabular-nums text-slate-900">{(by[s.key] ?? []).length}</div>
            <div className="mt-2 text-[13px] font-semibold text-slate-700">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6 overflow-x-auto pb-4">
        {STATES.map(s => {
          const col = by[s.key] ?? []
          return (
            <div key={s.key} className="shrink-0 w-[290px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-[13.5px] font-extrabold text-slate-900">{s.label}</span>
                </div>
                <span className="text-[11px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: s.color }}>{col.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {col.map(p => (
                  <Link key={p.id} href={`/panel/jugadores/${p.id}`} className="block bg-white border border-slate-100 rounded-xl p-3.5 card-soft card-hover">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl grad-accent text-white grid place-items-center text-[11px] font-bold shrink-0">{(p.first_name?.[0] ?? '') + (p.last_name?.[0] ?? '')}</div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-bold text-slate-900 truncate">{p.first_name} {p.last_name}</div>
                        <div className="text-[11.5px] text-slate-400">{p.primary_position || '—'}{divLabel(p.target_division) ? ` · ${divLabel(p.target_division)}` : ''}</div>
                      </div>
                    </div>
                  </Link>
                ))}
                {col.length === 0 && <p className="text-[12px] text-slate-300 px-1">Nadie aquí</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
