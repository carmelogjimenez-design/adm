import { redirect } from 'next/navigation'

// Mensajes de familia OCULTO (se usan los grupos de WhatsApp).
// Se mantiene la ruta para no romper enlaces; redirige a Inicio.
// El chat con el asesor sigue disponible en el panel de admin (MessageThread).
export default function MensajesPage() {
  redirect('/inicio')
}
