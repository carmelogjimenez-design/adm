'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'

const DIVS: [string, string][] = [['', '—'], ['NCAA_D1', 'NCAA D1'], ['NCAA_D2', 'NCAA D2'], ['NCAA_D3', 'NCAA D3'], ['NAIA', 'NAIA'], ['NJCAA', 'JUCO']]
function toDivision(raw?: string): string | null {
  const t = (raw || '').toUpperCase().replace(/\s+/g, ' ').trim()
  if (!t) return null
  if (t.includes('JUCO') || t.includes('NJCAA')) return 'NJCAA'
  if (t.includes('NAIA')) return 'NAIA'
  if (t.includes('III') || t.includes('D3') || t.includes('DIII')) return 'NCAA_D3'
  if (t.includes('II') || t.includes('D2') || t.includes('DII')) return 'NCAA_D2'
  if (t.includes('NCAA') || t.includes('D1') || t.includes('DI')) return 'NCAA_D1'
  return null
}
function splitName(full: string) {
  const parts = (full || '').trim().replace(/\s+/g, ' ').split(' ')
  return { first: parts[0] || '', last: parts.slice(1).join(' ') || '-' }
}
const numOrNull = (x: any) => { const n = parseFloat(String(x ?? '').replace(',', '.')); return isFinite(n) ? n : null }

type Lead = { first_name: string; last_name: string; primary_position: string | null; secondary_position: string | null; current_club: string | null; target_division: string | null; budget_range: string | null; highlight_video_url: string | null; duolingo_score: number | null; highschool_average: number | null }

export default function LeadTools() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<null | 'manual' | 'excel'>(null)
  const [busy, setBusy] = useState(false)

  // ---- manual ----
  const [m, setM] = useState({ first_name: '', last_name: '', primary_position: '', current_club: '', target_division: '', budget_range: '', phone: '', email: '', highlight_video_url: '' })
  const setMf = (k: string, v: string) => setM(s => ({ ...s, [k]: v }))
  async function createManual() {
    if (!m.first_name.trim()) { alert('Indica al menos el nombre'); return }
    setBusy(true)
    const { error } = await supabase.from('players').insert({
      first_name: m.first_name.trim(), last_name: m.last_name.trim() || '-',
      primary_position: m.primary_position || null, current_club: m.current_club || null,
      target_division: m.target_division || null, budget_range: m.budget_range || null,
      phone: m.phone || null, email: m.email || null, highlight_video_url: m.highlight_video_url || null,
      stage: 'lead', is_active: false,
    })
    setBusy(false)
    if (error) { alert(error.message); return }
    setMode(null); setM({ first_name: '', last_name: '', primary_position: '', current_club: '', target_division: '', budget_range: '', phone: '', email: '', highlight_video_url: '' })
    router.refresh()
  }

  // ---- excel ----
  const [sheets, setSheets] = useState<string[]>([])
  const [wb, setWb] = useState<XLSX.WorkBook | null>(null)
  const [leads, setLeads] = useState<(Lead & { _check: boolean; _dup: boolean })[]>([])
  const [existing, setExisting] = useState<Set<string>>(new Set())

  async function onFile(file: File) {
    setBusy(true)
    try {
      const buf = await file.arrayBuffer()
      const book = XLSX.read(buf, { type: 'array' })
      setWb(book); setSheets(book.SheetNames)
      const { data } = await supabase.from('players').select('first_name, last_name')
      setExisting(new Set((data ?? []).map((p: any) => `${p.first_name} ${p.last_name}`.toLowerCase().trim())))
      parseSheet(book, book.SheetNames[0], new Set((data ?? []).map((p: any) => `${p.first_name} ${p.last_name}`.toLowerCase().trim())))
    } catch (e: any) { alert('No se pudo leer el Excel: ' + e.message) }
    setBusy(false)
  }

  function parseSheet(book: XLSX.WorkBook, sheetName: string, exist: Set<string>) {
    const ws = book.Sheets[sheetName]
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false })
    // localizar cabecera (fila que contiene "nombre")
    let hi = rows.findIndex(r => r.some(c => String(c ?? '').toLowerCase().includes('nombre')))
    if (hi < 0) hi = 0
    const header = rows[hi].map((c: any) => String(c ?? '').toLowerCase().trim())
    const col = (kw: string) => header.findIndex(h => h.includes(kw))
    const idx = { name: col('nombre'), pos: col('posicion'), div: col('nivel'), club: (col('equipo') >= 0 ? col('equipo') : col('club')), budget: col('presupuesto'), video: col('video'), duo: col('duolingo'), avg: col('media notas') }
    const out: (Lead & { _check: boolean; _dup: boolean })[] = []
    for (let i = hi + 1; i < rows.length; i++) {
      const r = rows[i]; if (!r) continue
      const name = String(r[idx.name] ?? '').trim()
      if (!name || name.toLowerCase() === 'nombre del jugador') continue
      const { first, last } = splitName(name)
      const pos = String(r[idx.pos] ?? '').trim()
      const [p1, p2] = pos.split(/[,/]/).map(s => s.trim())
      const video = String(r[idx.video] ?? '').trim()
      const dup = exist.has(name.toLowerCase())
      out.push({
        first_name: first, last_name: last,
        primary_position: p1 || null, secondary_position: p2 || null,
        current_club: idx.club >= 0 ? (String(r[idx.club] ?? '').trim() || null) : null,
        target_division: toDivision(String(r[idx.div] ?? '')),
        budget_range: idx.budget >= 0 ? (String(r[idx.budget] ?? '').trim() || null) : null,
        highlight_video_url: /^https?:\/\//i.test(video) ? video : null,
        duolingo_score: idx.duo >= 0 ? (numOrNull(r[idx.duo]) as any) : null,
        highschool_average: idx.avg >= 0 ? numOrNull(r[idx.avg]) : null,
        _check: !dup, _dup: dup,
      })
    }
    setLeads(out)
  }

  async function importChecked() {
    const sel = leads.filter(l => l._check)
    if (sel.length === 0) { alert('No hay leads marcados'); return }
    if (!confirm(`¿Crear ${sel.length} leads?`)) return
    setBusy(true)
    const payload = sel.map(({ _check, _dup, ...l }) => ({ ...l, stage: 'lead', is_active: false }))
    // por lotes de 100
    for (let i = 0; i < payload.length; i += 100) {
      const { error } = await supabase.from('players').insert(payload.slice(i, i + 100))
      if (error) { setBusy(false); alert('Error al crear: ' + error.message); return }
    }
    setBusy(false); setMode(null); setLeads([]); setWb(null); router.refresh()
    alert(`${sel.length} leads creados.`)
  }

  const inp = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:border-[#0F5EFF] focus:outline-none bg-white'
  const checked = leads.filter(l => l._check).length

  return (
    <div className="flex gap-2">
      <button onClick={() => setMode('manual')} className="px-3.5 py-2 rounded-xl grad-accent text-white text-[13px] font-bold glow-brand">+ Nuevo lead</button>
      <button onClick={() => setMode('excel')} className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-semibold bg-white">Importar Excel</button>

      {mode && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[8vh] px-4" onMouseDown={() => !busy && setMode(null)}>
          <div className="fixed inset-0" style={{ background: 'rgba(15,23,42,0.55)' }} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-100 card-soft max-h-[82vh] overflow-y-auto isolate" style={{ background: '#ffffff' }} onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0" style={{ background: '#ffffff' }}>
              <h2 className="text-[15px] font-extrabold text-slate-900">{mode === 'manual' ? 'Nuevo lead' : 'Importar leads desde Excel'}</h2>
              <button onClick={() => setMode(null)} className="text-slate-400 text-[13px] font-semibold">Cerrar</button>
            </div>

            {mode === 'manual' ? (
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {([['first_name', 'Nombre'], ['last_name', 'Apellidos'], ['primary_position', 'Posición'], ['current_club', 'Club actual'], ['budget_range', 'Presupuesto'], ['phone', 'Teléfono'], ['email', 'Email'], ['highlight_video_url', 'Vídeo highlights (URL)']] as [string, string][]).map(([k, l]) => (
                    <label key={k} className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">{l}</span><input className={inp} value={(m as any)[k]} onChange={e => setMf(k, e.target.value)} /></label>
                  ))}
                  <label className="block"><span className="block text-[11px] font-semibold text-slate-500 mb-1">Nivel objetivo</span>
                    <select className={inp} value={m.target_division} onChange={e => setMf('target_division', e.target.value)}>{DIVS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                </div>
                <button onClick={createManual} disabled={busy} className="mt-4 w-full py-2.5 rounded-xl grad-accent text-white text-[14px] font-bold disabled:opacity-50 glow-brand">{busy ? 'Creando…' : 'Crear lead'}</button>
              </div>
            ) : (
              <div className="p-5">
                {leads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[13.5px] text-slate-500 mb-4">Sube tu Excel de jugadores. Detectamos las columnas (Nombre, Nivel, Posición, Club, Presupuesto, Vídeo, Duolingo…) automáticamente.</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl grad-accent text-white text-[13.5px] font-bold cursor-pointer glow-brand">
                      {busy ? 'Leyendo…' : 'Elegir archivo .xlsx'}
                      <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      {sheets.length > 1 && (
                        <select className={inp + ' max-w-[180px]'} onChange={e => wb && parseSheet(wb, e.target.value, existing)}>
                          {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                      <span className="text-[12px] text-slate-400">{leads.length} filas · {leads.filter(l => l._dup).length} duplicados</span>
                      <div className="flex gap-2">
                        <button onClick={() => setLeads(ls => ls.map(l => ({ ...l, _check: !l._dup })))} className="text-[11.5px] font-semibold grad-text">Marcar nuevos</button>
                        <button onClick={() => setLeads(ls => ls.map(l => ({ ...l, _check: false })))} className="text-[11.5px] font-semibold text-slate-400">Ninguno</button>
                      </div>
                    </div>
                    <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[40vh] overflow-y-auto">
                      <table className="w-full border-collapse text-[12.5px]">
                        <thead className="sticky top-0 bg-slate-50"><tr>{['', 'Jugador', 'Pos.', 'Nivel', 'Club'].map((h, i) => <th key={i} className="text-left font-bold text-slate-400 px-3 py-2 text-[10.5px] uppercase">{h}</th>)}</tr></thead>
                        <tbody>
                          {leads.map((l, i) => (
                            <tr key={i} className={'border-t border-slate-50 ' + (l._dup ? 'bg-amber-50/50' : '')}>
                              <td className="px-3 py-2"><input type="checkbox" checked={l._check} onChange={e => setLeads(ls => ls.map((x, j) => j === i ? { ...x, _check: e.target.checked } : x))} className="accent-[#0F5EFF]" /></td>
                              <td className="px-3 py-2 font-semibold text-slate-800">{l.first_name} {l.last_name}{l._dup && <span className="ml-1.5 text-[10px] font-bold text-amber-600">ya existe</span>}</td>
                              <td className="px-3 py-2 text-slate-500">{l.primary_position || '—'}</td>
                              <td className="px-3 py-2 text-slate-500">{l.target_division ? l.target_division.replace('NCAA_', '').replace('NJCAA', 'JUCO') : '—'}</td>
                              <td className="px-3 py-2 text-slate-500">{l.current_club || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button onClick={importChecked} disabled={busy || checked === 0} className="mt-4 w-full py-2.5 rounded-xl grad-accent text-white text-[14px] font-bold disabled:opacity-50 glow-brand">{busy ? 'Creando…' : `Crear ${checked} leads`}</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
