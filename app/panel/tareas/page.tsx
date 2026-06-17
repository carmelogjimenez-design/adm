import TasksWidget from '../TasksWidget'

export default function TareasPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <div className="fade-up">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] grad-text inline-block mb-2">Productividad</div>
        <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">Tareas</h1>
        <p className="text-slate-500 text-[15px] mt-1.5">Tu día a día del equipo: crea, prioriza y marca como hechas. Las de hoy también te avisan en la campana.</p>
      </div>
      <div className="mt-6"><TasksWidget /></div>
    </div>
  )
}
