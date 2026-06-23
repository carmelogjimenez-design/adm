type Phase = { id: string; status: string; phases: { phase_order: number; name: string; description: string | null } | null }

export default function CaminoHorizontal({ phases, compact = false }: { phases: Phase[]; compact?: boolean }) {
  const total = phases.length
  const done = phases.filter(p => p.status === 'done').length
  const pct = total ? Math.round((done / total) * 100) : 0
  const ball = compact ? 18 : 24

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-slate-500">Progreso del proceso</span>
        <span className="text-[12px] font-bold font-mono text-slate-700 tabular-nums">{done}/{total}</span>
      </div>

      {/* barra con balon que rueda segun el % */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes admRollIn { from { left: 0% } to { left: ${pct}% } }
        @keyframes admSpin { to { transform: rotate(360deg) } }
      ` }} />
      <div className="relative mb-5" style={{ height: ball }}>
        <div className="bar-track h-2.5 absolute left-0 right-0 top-1/2" style={{ transform: 'translateY(-50%)' }}>
          <div className="bar-fill h-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="absolute top-1/2" style={{ left: `${pct}%`, transform: 'translate(-50%,-50%)', animation: 'admRollIn 1.2s cubic-bezier(.22,1,.36,1) both' }}>
          <div style={{ width: ball, height: ball, display: 'grid', placeItems: 'center', animation: 'admSpin 2.2s linear infinite', filter: 'drop-shadow(0 2px 3px rgba(15,30,70,.25))' }}>
            <span style={{ fontSize: ball, lineHeight: 1 }}>⚽</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <ol className="flex min-w-max">
          {phases.map((p, i) => {
            const st = p.status
            const isDone = st === 'done'
            const isCurrent = st === 'in_progress'
            const isBlocked = st === 'blocked'
            const prevDone = i > 0 && phases[i - 1].status === 'done'
            const w = compact ? 84 : 104
            return (
              <li key={p.id} className="flex flex-col items-center" style={{ width: w }}>
                <div className="flex items-center w-full">
                  <span className="h-1 flex-1 rounded-full" style={{ background: i === 0 ? 'transparent' : (prevDone ? '#39E6A5' : '#E6EAF3') }} />
                  <span className="grid place-items-center rounded-full shrink-0 text-[11px] font-bold"
                    style={{
                      width: compact ? 26 : 32, height: compact ? 26 : 32,
                      background: isDone ? '#16B57C' : isCurrent ? '#fff' : isBlocked ? '#FEE2E2' : '#F1F4F9',
                      color: isDone ? '#fff' : isCurrent ? '#0F5EFF' : isBlocked ? '#DC2626' : '#94A3B8',
                      border: isCurrent ? '2px solid #0F5EFF' : 'none',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(15,94,255,.12)' : 'none',
                    }}>
                    {isDone ? '✓' : (p.phases?.phase_order ?? i + 1)}
                  </span>
                  <span className="h-1 flex-1 rounded-full" style={{ background: i === total - 1 ? 'transparent' : (isDone ? '#39E6A5' : '#E6EAF3') }} />
                </div>
                {!compact && (
                  <div className="mt-2 text-center px-1">
                    <div className={'text-[11px] leading-tight font-semibold ' + (isDone || isCurrent ? 'text-slate-800' : 'text-slate-400')}>
                      {p.phases?.name ?? 'Fase'}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
