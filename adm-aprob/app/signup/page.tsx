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
  const [role, setRole] = useState<'family' | 'admin'>('family')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, requested_role: role } },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/pendiente')
    router.refresh()
  }

  const roleBtn = (value: 'family' | 'admin', label: string) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      className={
        'flex-1 py-2.5 rounded-lg text-sm font-semibold border transition ' +
        (role === value
          ? 'bg-[#0F5EFF] text-white border-[#0F5EFF]'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300')
      }>
      {label}
    </button>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white grid place-items-center font-black text-sm tracking-tight">ADM</div>
          <span className="font-bold text-slate-900">Crear cuenta</span>
        </div>

        <label className="block text-xs font-semibold text-slate-500 mb-2">Tipo de cuenta</label>
        <div className="flex gap-2 mb-4">
          {roleBtn('family', 'Familia')}
          {roleBtn('admin', 'Admin')}
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

        <button
          onClick={handleSignup} disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#0F5EFF] text-white font-semibold text-sm disabled:opacity-50">
          {loading ? 'Creando...' : 'Solicitar cuenta'}
        </button>

        <p className="text-xs text-slate-400 text-center mt-3">
          Tu cuenta quedara pendiente de aprobacion por un administrador.
        </p>
        <p className="text-sm text-slate-500 text-center mt-4">
          Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#0F5EFF] font-semibold">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
