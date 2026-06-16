'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Player = Record<string, any> | null

export default function IntakeForm({
  initial, defaultName, defaultEmail,
}: { initial: Player; defaultName: string; defaultEmail: string }) {
  const router = useRouter()
  const supabase = createClient()

  const completed = !!initial?.intake_completed
  const [editing, setEditing] = useState(!completed)

  const nameParts = defaultName.trim().split(' ')
  const [form, setForm] = useState<Record<string, string>>({
    first_name: initial?.first_name ?? nameParts[0] ?? '',
    last_name: initial?.last_name ?? nameParts.slice(1).join(' ') ?? '',
    birth_date: initial?.birth_date ?? '',
    nationality: initial?.nationality ?? '',
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? defaultEmail,
    instagram: initial?.instagram ?? '',
    contact_name: initial?.contact_name ?? '',
    contact_phone: initial?.contact_phone ?? '',
    contact_email: initial?.contact_email ?? '',
    budget_range: initial?.budget_range ?? '',
    school: initial?.school ?? '',
    highschool_end_date: initial?.highschool_end_date ?? '',
    highschool_average: initial?.highschool_average?.toString() ?? '',
    gpa: initial?.gpa?.toString() ?? '',
    english_level: initial?.english_level ?? '',
    sat_score: initial?.sat_score?.toString() ?? '',
    sat_exam_date: initial?.sat_exam_date ?? '',
    toefl_score: initial?.toefl_score?.toString() ?? '',
    toefl_exam_date: initial?.toefl_exam_date ?? '',
    current_university: initial?.current_university ?? '',
    desired_major: initial?.desired_major ?? '',
    alternative_majors: initial?.alternative_majors ?? '',
    desired_start_date: initial?.desired_start_date ?? '',
    top_half_class: initial?.top_half_class === null || initial?.top_half_class === undefined ? '' : String(initial.top_half_class),
    preferred_campus_size: initial?.preferred_campus_size ?? '',
    preferred_region: initial?.preferred_region ?? '',
    motivation: initial?.motivation ?? '',
    sport: initial?.sport ?? 'Futbol',
    height_ft: initial?.height_ft ?? '',
    weight_lb: initial?.weight_lb?.toString() ?? '',
    primary_position: initial?.primary_position ?? '',
    secondary_position: initial?.secondary_position ?? '',
    foot: initial?.foot ?? '',
    current_club: initial?.current_club ?? '',
    category: initial?.category ?? '',
    club_location: initial?.club_location ?? '',
    previous_clubs: initial?.previous_clubs ?? '',
    physical_conditions: initial?.physical_conditions ?? '',
    major_injuries: initial?.major_injuries ?? '',
    self_description: initial?.self_description ?? '',
  })
  const set = (k: string, v: string) => setForm(s => ({ ...s, [k]: v }))

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ---- Firma ----
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    c.width = c.clientWidth
    c.height = 170
  }, [editing])

  function point(e: any) {
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    const t = e.touches ? e.touches[0] : e
    return { x: t.clientX - r.left, y: t.clientY - r.top }
  }
  function startDraw(e: any) {
    drawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y)
  }
  function draw(e: any) {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current!.getContext('2d')!
    const p = point(e)
    ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#0A0E1A'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.stroke()
    setSigned(true)
  }
  function endDraw() { drawing.current = false }
  function clearSig() {
    const c = canvasRef.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); setSigned(false)
  }

  async function submit() {
    setError(null)
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('El nombre y los apellidos son obligatorios.'); window.scrollTo(0, 0); return
    }
    if (!signed) { setError('Falta tu firma al final del formulario.'); return }
    setLoading(true)
    const signature = canvasRef.current!.toDataURL('image/png')
    const { error } = await supabase.rpc('submit_intake', { data: { ...form, intake_signature: signature } })
    setLoading(false)
    if (error) { setError(error.message); return }
    setEditing(false)
    router.refresh()
  }

  // ---------- Vista "solicitud enviada" ----------
  if (!editing) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-xl mx-auto">
          <Header />
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center mt-4">
            <div className="w-12 h-12 rounded-xl bg-[#39E6A5] grid place-items-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="3"><path d="M5 12l5 5L20 7"/></svg>
            </div>
            <h1 className="text-lg font-bold text-slate-900">Solicitud enviada</h1>
            <p className="text-sm text-slate-500 mt-2">
              Gracias {form.first_name}. Hemos recibido tu formulario y tu firma. Tu asesor de ADM revisara tu perfil y dara los siguientes pasos.
            </p>
            <button onClick={() => setEditing(true)} className="mt-6 text-sm font-semibold text-[#0F5EFF]">
              Editar mis datos
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Formulario ----------
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto pb-16">
        <Header />
        <h1 className="text-2xl font-bold text-slate-900 mt-4 tracking-tight">Formulario de solicitud</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Primer paso del proceso. Rellena tus datos y firma al final. Puedes editarlo despues.
        </p>

        {error && <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

        <Section title="Informacion personal">
          <Row><Field label="Nombre *" v={form.first_name} on={v => set('first_name', v)} /><Field label="Apellidos *" v={form.last_name} on={v => set('last_name', v)} /></Row>
          <Row><Field label="Fecha de nacimiento" type="date" v={form.birth_date} on={v => set('birth_date', v)} /><Field label="Nacionalidad" v={form.nationality} on={v => set('nationality', v)} /></Row>
          <Field label="Direccion" v={form.address} on={v => set('address', v)} />
          <Row><Field label="Movil" v={form.phone} on={v => set('phone', v)} /><Field label="Email" type="email" v={form.email} on={v => set('email', v)} /></Row>
          <Field label="Instagram" v={form.instagram} on={v => set('instagram', v)} />
          <div className="h-px bg-slate-100 my-2" />
          <Row><Field label="Persona de contacto" v={form.contact_name} on={v => set('contact_name', v)} /><Field label="Telefono de contacto" v={form.contact_phone} on={v => set('contact_phone', v)} /></Row>
          <Field label="Email de contacto" type="email" v={form.contact_email} on={v => set('contact_email', v)} />
          <Select label="Presupuesto anual previsto" v={form.budget_range} on={v => set('budget_range', v)}
            options={[['', 'Selecciona...'], ['6-8k', '6.000 - 8.000 EUR'], ['8-10k', '8.000 - 10.000 EUR'], ['10-12k', '10.000 - 12.000 EUR'], ['12-15k', '12.000 - 15.000 EUR']]} />
        </Section>

        <Section title="Informacion academica">
          <Field label="Nombre de tu colegio" v={form.school} on={v => set('school', v)} />
          <Row><Field label="Fin de Bachillerato" type="date" v={form.highschool_end_date} on={v => set('highschool_end_date', v)} /><Field label="Media de Bachillerato (0-10)" v={form.highschool_average} on={v => set('highschool_average', v)} /></Row>
          <Row><Field label="GPA traducido (aprox.)" v={form.gpa} on={v => set('gpa', v)} /><Field label="Nivel de ingles" v={form.english_level} on={v => set('english_level', v)} /></Row>
          <Row><Field label="SAT (puntuacion)" v={form.sat_score} on={v => set('sat_score', v)} /><Field label="SAT: fecha examen (si no tienes nota)" type="date" v={form.sat_exam_date} on={v => set('sat_exam_date', v)} /></Row>
          <Row><Field label="TOEFL (puntuacion)" v={form.toefl_score} on={v => set('toefl_score', v)} /><Field label="TOEFL: fecha examen (si no tienes nota)" type="date" v={form.toefl_exam_date} on={v => set('toefl_exam_date', v)} /></Row>
          <Field label="Universidad y carrera actual (si aplica)" v={form.current_university} on={v => set('current_university', v)} />
          <Row><Field label="Carrera que desea estudiar" v={form.desired_major} on={v => set('desired_major', v)} /><Field label="Carreras alternativas" v={form.alternative_majors} on={v => set('alternative_majors', v)} /></Row>
          <Row>
            <Field label="Fecha deseada de inicio universidad" type="date" v={form.desired_start_date} on={v => set('desired_start_date', v)} />
            <Select label="Te graduas en el primer 50% de tu clase?" v={form.top_half_class} on={v => set('top_half_class', v)} options={[['', 'Selecciona...'], ['true', 'Si'], ['false', 'No']]} />
          </Row>
        </Section>

        <Section title="Preferencias de universidad">
          <Select label="Tamano de la universidad" v={form.preferred_campus_size} on={v => set('preferred_campus_size', v)}
            options={[['', 'Selecciona...'], ['0-2000', '0 - 2.000 estudiantes'], ['2000-5000', '2.000 - 5.000 estudiantes'], ['+5000', '+5.000 estudiantes']]} />
          <Select label="Ubicacion preferida" v={form.preferred_region} on={v => set('preferred_region', v)}
            options={[['', 'Selecciona...'], ['west', 'West Coast'], ['east', 'East Coast'], ['midwest', 'Midwest'], ['south', 'Southern States']]} />
          <Area label="Por que quieres ir a EE.UU. y cuales son tus objetivos?" v={form.motivation} on={v => set('motivation', v)} />
        </Section>

        <Section title="Informacion deportiva">
          <Row><Field label="Deporte" v={form.sport} on={v => set('sport', v)} /><div /></Row>
          <Row><Field label="Peso (libras)" v={form.weight_lb} on={v => set('weight_lb', v)} /><Field label="Altura (pies, ej. 6'1)" v={form.height_ft} on={v => set('height_ft', v)} /></Row>
          <Row><Field label="Posicion" v={form.primary_position} on={v => set('primary_position', v)} /><Field label="Posicion secundaria" v={form.secondary_position} on={v => set('secondary_position', v)} /></Row>
          <Select label="Pie dominante" v={form.foot} on={v => set('foot', v)} options={[['', 'Selecciona...'], ['right', 'Derecho'], ['left', 'Izquierdo'], ['both', 'Ambos']]} />
          <Row><Field label="Equipo actual" v={form.current_club} on={v => set('current_club', v)} /><Field label="Categoria" v={form.category} on={v => set('category', v)} /></Row>
          <Field label="Localizacion del equipo actual" v={form.club_location} on={v => set('club_location', v)} />
          <Area label="Equipos donde hayas jugado" v={form.previous_clubs} on={v => set('previous_clubs', v)} />
          <Area label="Condiciones fisicas a tener en cuenta" v={form.physical_conditions} on={v => set('physical_conditions', v)} />
          <Area label="Lesiones importantes" v={form.major_injuries} on={v => set('major_injuries', v)} />
          <Area label="Describete brevemente como jugador" v={form.self_description} on={v => set('self_description', v)} />
        </Section>

        <Section title="Firma">
          <p className="text-sm text-slate-500 mb-3">Firma con el dedo o el raton dentro del recuadro.</p>
          <div className="rounded-xl border border-slate-300 bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full touch-none block"
              style={{ height: 170 }}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
            />
          </div>
          <button onClick={clearSig} className="mt-2 text-sm font-semibold text-slate-500 hover:text-slate-800">Borrar firma</button>
        </Section>

        {error && <div className="mt-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

        <button onClick={submit} disabled={loading}
          className="w-full mt-6 py-3 rounded-xl bg-[#0F5EFF] text-white font-semibold text-sm disabled:opacity-50">
          {loading ? 'Enviando...' : 'Firmar y enviar solicitud'}
        </button>
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-lg bg-slate-900 text-white grid place-items-center font-black text-sm tracking-tight">ADM</div>
      <span className="font-bold text-slate-900">ADM</span>
    </div>
  )
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F5EFF] mb-4">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
}
function Field({ label, v, on, type = 'text' }: { label: string; v: string; on: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1">{label}</span>
      <input type={type} value={v} onChange={e => on(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-[#0F5EFF] focus:outline-none" />
    </label>
  )
}
function Area({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1">{label}</span>
      <textarea value={v} onChange={e => on(e.target.value)} rows={3}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-[#0F5EFF] focus:outline-none resize-y" />
    </label>
  )
}
function Select({ label, v, on, options }: { label: string; v: string; on: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1">{label}</span>
      <select value={v} onChange={e => on(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:border-[#0F5EFF] focus:outline-none">
        {options.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
      </select>
    </label>
  )
}
