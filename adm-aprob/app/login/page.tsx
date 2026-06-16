'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/panel')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white grid place-items-center font-black text-sm tracking-tight">ADM</div>
          <span className="font-bold text-slate-900">Acceso</span>
        </div>
        <input
          className="w-full mb-3 px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
          type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input
          className="w-full mb-4 px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
          type="password" placeholder="Contrasena"
          value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          onClick={handleLogin} disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#0F5EFF] text-white font-semibold text-sm disabled:opacity-50">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="text-sm text-slate-500 text-center mt-5">
          No tienes cuenta?{' '}
          <Link href="/signup" className="text-[#0F5EFF] font-semibold">Crear cuenta</Link>
        </p>
      </div>
    </div>
  )
}
