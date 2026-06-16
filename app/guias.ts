export type Guia = { info?: string; ejemplo?: string; info_naia?: string; info_ncaa?: string }

export const GUIAS: Record<string, Guia> = {
 "toefl": {
  "info": "/guias/toefl/info.pdf",
  "ejemplo": "/guias/toefl/ejemplo.pdf"
 },
 "sat": {
  "info": "/guias/sat/info.pdf"
 },
 "partidos": {
  "info": "/guias/partidos/info.pdf"
 },
 "cortes": {
  "info": "/guias/cortes/info.pdf"
 },
 "formulario_adm": {
  "info": "/guias/formulario_adm/info.pdf"
 },
 "incred": {
  "info": "/guias/incred/info.pdf"
 },
 "eval_notas": {
  "info": "/guias/eval_notas/info.pdf"
 },
 "notas_carrera": {
  "info": "/guias/notas_carrera/info.pdf"
 },
 "reference_letter": {
  "info": "/guias/reference_letter/info.pdf",
  "ejemplo": "/guias/reference_letter/ejemplo.pdf"
 },
 "pasaporte": {
  "info": "/guias/pasaporte/info.pdf"
 },
 "seguro_medico": {
  "info": "/guias/seguro_medico/info.pdf"
 },
 "vuelos": {
  "info": "/guias/vuelos/info.pdf"
 },
 "housing": {
  "info": "/guias/housing/info.pdf"
 },
 "notas_eso": {
  "info": "/guias/notas_eso/info.pdf",
  "ejemplo": "/guias/notas_eso/ejemplo.pdf"
 },
 "notas_bach": {
  "info": "/guias/notas_bach/info.pdf",
  "ejemplo": "/guias/notas_bach/ejemplo.pdf"
 },
 "titulo_bach": {
  "info": "/guias/titulo_bach/info.pdf",
  "ejemplo": "/guias/titulo_bach/ejemplo.pdf"
 },
 "carta_banco": {
  "info": "/guias/carta_banco/info.pdf",
  "ejemplo": "/guias/carta_banco/ejemplo.pdf"
 },
 "registro_liga": {
  "info_naia": "/guias/registro_liga/info-naia.pdf",
  "info_ncaa": "/guias/registro_liga/info-ncaa.pdf"
 },
 "registro_uni": {
  "info": "/guias/registro_uni/info.pdf"
 },
 "duolingo": {
  "info": "/guias/duolingo/info.pdf",
  "ejemplo": "/guias/duolingo/ejemplo.pdf"
 }
}

export const GUIAS_GENERAL: { title: string; sub: string; href: string }[] = [
  { title: 'Preguntas frecuentes', sub: 'La guía completa para familias', href: '/guias/general/faq.pdf' },
  { title: 'Proceso de visado (F-1)', sub: 'Cómo conseguir el visado de estudiante', href: '/guias/general/visado.pdf' },
  { title: 'El viaje a EE. UU.', sub: 'Qué llevar y cómo preparar la llegada', href: '/guias/general/viaje.pdf' },
  { title: 'Código ADM', sub: 'Tu código y cómo usarlo', href: '/guias/general/codigo-adm.pdf' },
]
