'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <button
      onClick={logout}
      className="text-sm font-semibold text-slate-500 hover:text-slate-800">
      Cerrar sesion
    </button>
  )
}
