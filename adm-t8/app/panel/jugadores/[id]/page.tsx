import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPlayerById, getPlayerDocuments, getDocCategories, getPlayerPhases } from '@/lib/queries'
import StageSelect from './StageSelect'
import AdminDocs from './AdminDocs'
import PlayerEdit from './PlayerEdit'
import UsaToggle from './UsaToggle'
import PhaseTimeline from './PhaseTimeline'
import Matching from './Matching'
import OffersEditor from './OffersEditor'
import FinanceEditor from './FinanceEditor'
import MessageThread from '../../../MessageThread'

const FOOT: Record<string, string> = { right: 'Derecho', left: 'Izquierdo', both: 'Ambos' }
const REGION: Record<string, string> = { west: 'West Coast', east: 'East Coast', midwest: 'Midwest', south: 'Southern States' }
function divLabel(d: string | null) { return d ? d.replace('NCAA_', '').replace('NJCAA', 'JUCO') : '—' }

function Field({ k, v }: { k: string; v: any }) {
  return (
    <div>
      <div className="text-[11px] text-slate-400 font-semibold">{k}</div>
      <div className="text-[13px] font-medium text-slate-800">{v === null || v === undefined || v === '' ? '—' : String(v)}</div>
    </div>
  )
}
function Section({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) {
  return (
    <div className="fade-up card-soft bg-white border border-slate-100 rounded-2xl p-5" style={{ animationDelay: `${delay}ms` }}>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-3.5">{children}</div>
    </div>
  )
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await getPlayerById(id)
  if (!p) notFound()

  const [docs, categories, phases] = await Promise.all([getPlayerDocuments(id), getDocCategories(), getPlayerPhases(id)])
  const approved = docs.filter((d: any) => d.status === 'approved').length

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <Link href="/panel/jugadores" className="text-[13px] font-semibold grad-text">&larr; Jugadores</Link>

      <div className="fade-up flex items-start justify-between gap-4 flex-wrap mt-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl grad-accent text-white grid place-items-center text-xl font-extrabold glow-brand">
            {(p.first_name?.[0] ?? '') + (p.last_name?.[0] ?? '')}
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">{p.first_name} {p.last_name}</h1>
            <p className="text-[14px] text-slate-500 mt-0.5">{p.primary_position || '—'} · {divLabel(p.target_division)}{p.current_club ? ` · ${p.current_club}` : ''}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400 font-semibold mb-1.5">Fase del pipeline</div>
          <StageSelect playerId={p.id} current={p.stage} />
          <div><UsaToggle playerId={p.id} current={p.in_usa} /></div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <PlayerEdit player={p} />

        <PhaseTimeline phases={phases as any} />

        <Matching playerId={p.id} />

        <OffersEditor playerId={p.id} />

        <FinanceEditor playerId={p.id} />

        <MessageThread playerId={p.id} height={340} />

        <Section title="Datos personales" delay={60}>
          <Field k="Nombre" v={`${p.first_name} ${p.last_name}`} />
          <Field k="Fecha nacimiento" v={p.birth_date} />
          <Field k="Nacionalidad" v={p.nationality} />
          <Field k="Móvil" v={p.phone} />
          <Field k="Email" v={p.email} />
          <Field k="Instagram" v={p.instagram} />
          <Field k="Persona de contacto" v={p.contact_name} />
          <Field k="Tel. contacto" v={p.contact_phone} />
          <Field k="Presupuesto" v={p.budget_range} />
        </Section>

        <Section title="Académico" delay={110}>
          <Field k="Colegio" v={p.school} />
          <Field k="Media Bach." v={p.highschool_average} />
          <Field k="GPA" v={p.gpa} />
          <Field k="Inglés" v={p.english_level} />
          <Field k="Duolingo" v={p.duolingo_score} />
          <Field k="SAT" v={p.sat_score} />
          <Field k="TOEFL" v={p.toefl_score} />
          <Field k="Carrera deseada" v={p.desired_major} />
          <Field k="Top 50% clase" v={p.top_half_class === null ? null : (p.top_half_class ? 'Sí' : 'No')} />
        </Section>

        <Section title="Deportivo" delay={160}>
          <Field k="Posición" v={p.primary_position} />
          <Field k="Pos. secundaria" v={p.secondary_position} />
          <Field k="Pie" v={p.foot ? FOOT[p.foot] : null} />
          <Field k="Peso (lb)" v={p.weight_lb} />
          <Field k="Altura (ft)" v={p.height_ft} />
          <Field k="Club" v={p.current_club} />
          <Field k="Categoría" v={p.category} />
          <Field k="Nivel objetivo" v={divLabel(p.target_division)} />
          <Field k="Potencial" v={p.potential_score} />
        </Section>

        {(p.preferred_campus_size || p.preferred_region || p.motivation) && (
          <Section title="Preferencias" delay={200}>
            <Field k="Tamaño campus" v={p.preferred_campus_size} />
            <Field k="Región" v={p.preferred_region ? REGION[p.preferred_region] : null} />
            <div className="col-span-2 sm:col-span-3"><Field k="Motivación" v={p.motivation} /></div>
          </Section>
        )}

        {(p.self_description || p.major_injuries || p.previous_clubs || p.notes) && (
          <Section title="Notas" delay={230}>
            <div className="col-span-2 sm:col-span-3"><Field k="Descripción como jugador" v={p.self_description} /></div>
            <div className="col-span-2 sm:col-span-3"><Field k="Equipos anteriores" v={p.previous_clubs} /></div>
            <div className="col-span-2 sm:col-span-3"><Field k="Lesiones" v={p.major_injuries} /></div>
            <div className="col-span-2 sm:col-span-3"><Field k="Notas internas" v={p.notes} /></div>
          </Section>
        )}

        <div className="fade-up" style={{ animationDelay: '260ms' }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] grad-text inline-block">Documentos</h2>
            <span className="text-[12px] font-bold font-mono text-slate-400 tabular-nums">{approved}/{categories.length} aprobados</span>
          </div>
          <AdminDocs playerId={p.id} categories={categories as any} initialDocs={docs as any} />
        </div>
      </div>
    </div>
  )
}
