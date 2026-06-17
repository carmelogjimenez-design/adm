import { getPlayersForList } from '@/lib/queries'
import JugadoresTable from './JugadoresTable'

export default async function JugadoresPage({ searchParams }: { searchParams: Promise<{ segmento?: string }> }) {
  const players = await getPlayersForList()
  const { segmento } = await searchParams

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="fade-up">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Cartera</div>
        <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Jugadores</h1>
        <p className="text-slate-500 text-[15px] mt-1.5">Filtra por estado y por universidad de destino.</p>
      </div>
      {players.length === 0 ? (
        <div className="fade-up mt-7 bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <p className="text-sm text-slate-500">Aún no hay jugadores. Cuando una familia complete el formulario, aparecerá aquí.</p>
        </div>
      ) : (
        <JugadoresTable players={players} initialSegment={segmento === 'usa' ? 'usa' : segmento === 'proceso' ? 'proceso' : 'todos'} />
      )}
    </div>
  )
}
