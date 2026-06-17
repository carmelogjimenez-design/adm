import Link from 'next/link'
import { getAlumni } from '@/lib/queries'

const divLabel = (d: string | null) => d ? d.replace('NCAA_', '').replace('NJCAA', 'JUCO') : null
function usaFromNotes(notes?: string | null) {
  if (!notes) return null
  const m = notes.split('·').find(s => s.trim().startsWith('USA:'))
  return m ? m.replace('USA:', '').trim() : null
}

export default async function AlumniBoardPage() {
  const alumni = await getAlumni()
  const years = Array.from(new Set(alumni.map((a: any) => a.cohort_year).filter(Boolean))).sort((a, b) => (b as number) - (a as number)) as number[]
  const byYear: Record<string, any[]> = {}
  for (const a of alumni as any[]) { const k = String(a.cohort_year ?? 'Sin año'); (byYear[k] ||= []).push(a) }

  return (
    <div className="px-8 py-8">
      <div className="fade-up flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Histórico</div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Alumni por años</h1>
          <p className="text-slate-500 text-[15px] mt-1.5">{alumni.length} jugadores que ya pasaron por EE. UU., agrupados por su año.</p>
        </div>
        <Link href="/panel/jugadores?segmento=pasados" className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-semibold bg-white">Ver en lista</Link>
      </div>

      <div className="fade-up flex gap-4 mt-6 overflow-x-auto pb-4">
        {years.map(y => {
          const col = byYear[String(y)] ?? []
          return (
            <div key={y} className="shrink-0 w-[300px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[14px] font-extrabold text-slate-900">{y}</span>
                <span className="text-[11px] font-bold text-white grad-accent rounded-full px-2 py-0.5">{col.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {col.map(a => {
                  const usa = usaFromNotes(a.notes)
                  return (
                    <Link key={a.id} href={`/panel/jugadores/${a.id}`} className="block bg-white border border-slate-100 rounded-xl p-3.5 card-soft card-hover">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl grad-accent text-white grid place-items-center text-[11px] font-bold shrink-0">{(a.first_name?.[0] ?? '') + (a.last_name?.[0] ?? '')}</div>
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-bold text-slate-900 truncate">{a.first_name} {a.last_name}</div>
                          <div className="text-[11.5px] text-slate-400">{a.primary_position || '—'}{divLabel(a.target_division) ? ` · ${divLabel(a.target_division)}` : ''}</div>
                        </div>
                      </div>
                      {usa && <div className="mt-2 text-[11.5px] font-semibold text-emerald-600 truncate">🇺🇸 {usa}</div>}
                    </Link>
                  )
                })}
                {col.length === 0 && <p className="text-[12px] text-slate-300 px-1">—</p>}
              </div>
            </div>
          )
        })}
        {years.length === 0 && <p className="text-[13px] text-slate-400">Aún no hay alumni importados.</p>}
      </div>
    </div>
  )
}
