import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/queries'
import Sidebar from './Sidebar'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getMyProfile()
  if (!profile || profile.status !== 'approved') redirect('/pendiente')
  if (profile.role === 'family') redirect('/formulario')

  return (
    <div className="min-h-screen bg-[#F1F3F8] flex">
      <Sidebar
        name={profile.full_name || user.email || ''}
        role={profile.role || ''}
        isSuperadmin={!!profile.is_superadmin}
      />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
