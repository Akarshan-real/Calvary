'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { BUCKET_NAME } from '@/lib/supabase/storage'
import { FoodPreference, Profile } from '@/types/database'

// 2MB Size Limit for user profile photos
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

/**
 * Uploads or updates a user profile photo to 'images/userPfp/'
 * Enforces a 2MB size limit and updates the user's profile avatar_url
 */
export async function uploadUserAvatar(
  formData: FormData,
  targetUserId?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  // Users can only upload for themselves unless they are admin
  const userId = targetUserId || user.id
  if (userId !== user.id) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') {
      return { success: false, error: 'Forbidden. You cannot update another user profile.' }
    }
  }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) {
    return { success: false, error: 'No image file provided.' }
  }

  // Enforce 2MB size limit
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return { success: false, error: 'File size exceeds the 2MB limit. Please upload a smaller image.' }
  }

  // Enforce image mime type
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' }
  }

  const fileExt = file.name.split('.').pop() || 'jpg'
  // File named after user ID for clean upsert: userPfp/{userId}.{ext}
  const filePath = `userPfp/${userId}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '0',
      upsert: true, // replace previous avatar
    })

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}` // bust cache

  // Update profiles table
  const { error: dbError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (dbError) {
    return { success: false, error: dbError.message }
  }

  revalidatePath('/', 'layout')
  return { success: true, url: avatarUrl }
}

/**
 * Removes user profile photo from storage and clears avatar_url in profiles
 */
export async function deleteUserAvatar(targetUserId?: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized.' }

  const userId = targetUserId || user.id
  if (userId !== user.id) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') {
      return { success: false, error: 'Forbidden.' }
    }
  }

  // Get current avatar url to find file extension
  const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', userId).maybeSingle()
  if (profile?.avatar_url) {
    const possibleExts = ['jpg', 'jpeg', 'png', 'webp']
    const pathsToRemove = possibleExts.map((ext) => `userPfp/${userId}.${ext}`)
    await supabase.storage.from(BUCKET_NAME).remove(pathsToRemove)
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * Updates user profile details after account creation:
 * - full_name, email, birthday, food_preference, dietary_notes
 */
export async function updateUserProfile(updates: {
  full_name?: string
  email?: string
  birthday?: string | null
  food_preference?: FoodPreference
  dietary_notes?: string | null
}): Promise<{ success: boolean; data?: Profile; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized.' }

  // Clean updates: remove undefined values
  const payload: Record<string, any> = {
    id: user.id,
    updated_at: new Date().toISOString(),
  }

  if (updates.full_name !== undefined) payload.full_name = updates.full_name
  if (updates.email !== undefined) payload.email = updates.email || null
  if (updates.birthday !== undefined) payload.birthday = updates.birthday
  if (updates.food_preference !== undefined) payload.food_preference = updates.food_preference
  if (updates.dietary_notes !== undefined) payload.dietary_notes = updates.dietary_notes

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/profile')
  return { success: true, data: data as Profile }
}

/**
 * Permanently deletes the user's profile and cleans up storage assets
 */
export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized.' }

  // 1. Remove user avatar from storage if present
  try {
    const possibleExts = ['jpg', 'jpeg', 'png', 'webp']
    const pathsToRemove = possibleExts.map((ext) => `userPfp/${user.id}.${ext}`)
    await supabase.storage.from(BUCKET_NAME).remove(pathsToRemove)
  } catch (err) {
    console.error('Failed to clean up avatar images:', err)
  }

  // 2. Delete user's profile row
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  // 3. Sign out session
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  return { success: true }
}
