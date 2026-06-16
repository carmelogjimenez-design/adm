import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getMyPlayer, getDocCategories, getMyDocuments } from '@/lib/queries'
import DocCenter from './DocCenter'

export default async function DocumentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getMyProfile()
  if (!profile || profile.status !== 'approved') redirect('/pendiente')
  if (profile.role !== 'family') redirect('/panel')

  const player = await getMyPlayer()
  if (!player || !player.intake_completed) redirect('/formulario')

  const categories = await getDocCategories()
  const docs = await getMyDocuments(player.id)

  return (
    <DocCenter
      playerId={player.id}
      playerName={`${player.first_name} ${player.last_name}`}
      categories={categories as any}
      initialDocs={docs as any}
    />
  )
}
