import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/queries'
import FamilyNav from '../FamilyNav'

type QA = { q: string; a: string }

const PROCESO: QA[] = [
  { q: '¿Qué hace ADM por mi hijo/a?', a: 'ADM acompaña todo el proceso para conseguir una beca deportiva en una universidad de EE. UU.: contacto con los coaches, elegibilidad, admisión, visado y la llegada al campus. En tu camino ves en qué fase estás en cada momento.' },
  { q: '¿Cuánto dura el proceso?', a: 'Suele llevar varios meses y depende de los exámenes de inglés, la documentación y las respuestas de las universidades. Lo importante es ir completando cada fase; nosotros te avisamos de los siguientes pasos.' },
  { q: '¿Qué es la elegibilidad (NCAA / NAIA)?', a: 'Es el registro oficial que valida las notas y el historial deportivo del jugador para poder competir en EE. UU. Es un paso obligatorio y lo gestionamos contigo.' },
  { q: '¿Qué nivel de inglés se necesita?', a: 'Normalmente se acredita con el Duolingo English Test o el TOEFL. Cada universidad pide un mínimo distinto; te orientamos sobre cuál te conviene y qué nota buscar.' },
  { q: '¿Qué son el I-20 y el visado?', a: 'El I-20 es un documento que emite la universidad cuando el jugador es admitido. Con él se solicita el visado de estudiante (F-1) para poder viajar y estudiar en EE. UU.' },
]

const DOCS: QA[] = [
  { q: '¿Cómo subo un documento?', a: 'Entra en la sección Documentos. En cada paso, pulsa "Subir" para adjuntar un archivo desde tu móvil u ordenador, o "Enlace" para pegar un enlace.' },
  { q: '¿Qué formatos puedo subir?', a: 'PDF e imágenes (por ejemplo, foto del pasaporte o de las notas). Si un archivo pesa demasiado, súbelo a Google Drive y pega el enlace con el botón "Enlace".' },
  { q: '¿Y los vídeos de los partidos?', a: 'Los vídeos van mejor por enlace. Súbelos a YouTube, Drive o Veo y usa el botón "Enlace" en "2 partidos completos" y en "Cortes".' },
  { q: '¿Qué significa cada estado?', a: 'Pendiente: aún no lo has subido. Subido: lo hemos recibido. En revisión: tu asesor lo está comprobando. Aprobado: todo correcto. Corregir: hay que volver a enviarlo.' },
  { q: '¿Puedo cambiar un documento ya subido?', a: 'Sí. En ese documento aparece el botón "Cambiar"; súbelo de nuevo y se reemplaza por la versión nueva.' },
  { q: '¿Es seguro subir mis documentos aquí?', a: 'Sí. Se guardan de forma privada y solo tú y el equipo de ADM podéis verlos.' },
]

function Faq({ items }: { items: QA[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((it, i) => (
        <details key={i} className="group card-soft bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <summary className="list-none cursor-pointer flex items-center gap-3 px-4 py-3.5 select-none">
            <span className="flex-1 text-[14px] font-bold text-slate-900">{it.q}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 shrink-0"><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          <div className="px-4 pb-4 -mt-1 text-[13.5px] leading-relaxed text-slate-500">{it.a}</div>
        </details>
      ))}
    </div>
  )
}

export default async function AyudaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getMyProfile()
  if (!profile || profile.status !== 'approved') redirect('/pendiente')
  if (profile.role !== 'family') redirect('/panel')

  return (
    <div className="app-aurora min-h-screen bg-[#FBFCFE]">
      <FamilyNav />
      <div className="max-w-3xl mx-auto px-5 py-7">
        <div className="fade-up">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-1.5">Estamos contigo</div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">Ayuda y dudas</h1>
          <p className="text-slate-500 text-[15px] mt-1.5">Lo que más preguntan las familias sobre el proceso y sobre cómo subir documentos.</p>
        </div>

        <h2 className="fade-up text-[12px] font-bold uppercase tracking-[0.14em] grad-text inline-block mt-7 mb-3">El proceso ADM</h2>
        <div className="fade-up" style={{ animationDelay: '60ms' }}><Faq items={PROCESO} /></div>

        <h2 className="fade-up text-[12px] font-bold uppercase tracking-[0.14em] grad-text inline-block mt-7 mb-3" style={{ animationDelay: '100ms' }}>Subir documentos</h2>
        <div className="fade-up" style={{ animationDelay: '140ms' }}><Faq items={DOCS} /></div>

        <div className="fade-up card-soft grad-accent text-white rounded-2xl p-5 mt-7 glow-brand" style={{ animationDelay: '180ms' }}>
          <div className="text-[15px] font-extrabold">¿No encuentras tu respuesta?</div>
          <p className="text-[13.5px] opacity-95 mt-1">Tu asesor de ADM está para ayudarte en cualquier paso. Escríbele y te guía.</p>
          <Link href="/documentos" className="inline-flex items-center gap-1 mt-3 bg-white/20 rounded-lg px-3 py-1.5 text-[13px] font-bold">Ir a mis documentos →</Link>
        </div>
      </div>
    </div>
  )
}
