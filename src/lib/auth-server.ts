import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'
import type { User } from '@supabase/supabase-js'

/**
 * Retrieve current logged-in user + profile row (for Server Components / Pages)
 */
export async function getCurrentUser(): Promise<{ user: User; profile: Profile } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // If no profile row exists for this authenticated user, create one on the fly
  if (!profile) {
    const userEmail = user.email || (user.user_metadata?.email as string) || ''
    const newProfile = {
      id: user.id,
      phone: user.phone || (user.user_metadata?.phone as string) || null,
      email: userEmail,
      full_name: (user.user_metadata?.full_name as string) || 'Diner',
      role: 'customer' as const,
      food_preference: (user.user_metadata?.food_preference as any) || 'all',
      updated_at: new Date().toISOString(),
    }
    const { data: createdProfile } = await supabase
      .from('profiles')
      .upsert(newProfile)
      .select()
      .maybeSingle()

    return { user, profile: (createdProfile || newProfile) as Profile }
  }

  return { user, profile: profile as Profile }
}
