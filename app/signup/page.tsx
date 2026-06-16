'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true); setError(null); setMessage(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    setLoading(false)
    if (error) { setError(error.message); return }

    // Si "Confirm email" esta desactivado en Supabase, hay sesion -> entra directo.
    if (data.session) {
      router.push('/panel')
      router.refresh()
    } else {
      // Si esta activado, hay que confirmar por correo.
      setMessage('Cuenta creada. Revisa tu correo para confirmar y luego inicia sesion.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white grid place-items-center font-black text-sm tracking-tight">ADM</div>
          <span className="font-bold text-slate-900">Crear cuenta</span>
        </div>
        <input
          className="w-full mb-3 px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
          type="text" placeholder="Nombre completo"
          value={fullName} onChange={e => setFullName(e.target.value)} />
        <input
          className="w-full mb-3 px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
          type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input
          className="w-full mb-4 px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
          type="password" placeholder="Contrasena (min. 6 caracteres)"
          value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {message && <p className="text-sm text-emerald-600 mb-3">{message}</p>}
        <button
          onClick={handleSignup} disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#0F5EFF] text-white font-semibold text-sm disabled:opacity-50">
          {loading ? 'Creando...' : 'Crear cuenta'}
        </button>
        <p className="text-sm text-slate-500 text-center mt-5">
          Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#0F5EFF] font-semibold">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
