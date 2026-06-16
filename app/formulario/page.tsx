import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getMyPlayer } from '@/lib/queries'
import IntakeForm from './IntakeForm'
import FamilyNav from '../FamilyNav'

export default async function FormularioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getMyProfile()
  if (!profile || profile.status !== 'approved') redirect('/pendiente')
  if (profile.role !== 'family') redirect('/panel')

  const player = await getMyPlayer()

  return (
    <div className="min-h-screen bg-[#FBFCFE]">
      <FamilyNav />
      <IntakeForm
        initial={player}
        defaultName={profile.full_name ?? ''}
        defaultEmail={user.email ?? ''}
      />
    </div>
  )
}
