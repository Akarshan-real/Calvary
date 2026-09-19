'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MediaAsset } from '@/types/database'
import { BUCKET_NAME, ImageFolder } from '@/lib/supabase/storage'

/**
 * Uploads an image file to Supabase Storage and records it in public.media_assets table
 */
export async function uploadMediaAsset(
  folder: ImageFolder,
  formData: FormData
): Promise<{ success: boolean; data?: MediaAsset; error?: string }> {
  const supabase = await createClient()

  const file = formData.get('file') as File
  const displayName = (formData.get('fileName') as string) || file.name
  const altText = (formData.get('altText') as string) || ''

  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' }
  }

  // 1. Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
  const filePath = `${folder}/${Date.now()}_${cleanBase}.${fileExt}`

  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (storageError) {
    return { success: false, error: storageError.message }
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  // 2. Insert record into public.media_assets
  const { data: asset, error: dbError } = await supabase
    .from('media_assets')
    .insert({
      file_path: filePath,
      file_name: displayName,
      public_url: urlData.publicUrl,
      folder,
      alt_text: altText,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single()

  if (dbError) {
    return { success: false, error: dbError.message }
  }

  revalidatePath('/admin/media')
  revalidatePath('/admin/menu')
  return { success: true, data: asset }
}

/**
 * Fetches all media assets, optionally filtered by folder ('items' or 'displayAssets')
 */
export async function getMediaAssets(folder?: ImageFolder): Promise<MediaAsset[]> {
  const supabase = await createClient()
  let query = supabase.from('media_assets').select('*').order('created_at', { ascending: false })

  if (folder) {
    query = query.eq('folder', folder)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}

/**
 * Updates metadata of a media asset (e.g. rename display name, update alt text)
 */
export async function updateMediaAssetMetadata(
  id: string,
  updates: { file_name?: string; alt_text?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('media_assets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/media')
  return { success: true }
}

/**
 * Deletes a media asset from both the database and the Supabase Storage bucket
 */
export async function deleteMediaAsset(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // 1. Get the file path first
  const { data: asset, error: fetchError } = await supabase
    .from('media_assets')
    .select('file_path')
    .eq('id', id)
    .single()

  if (fetchError || !asset) {
    return { success: false, error: fetchError?.message || 'Asset not found' }
  }

  // 2. Remove from Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([asset.file_path])

  if (storageError) {
    // Continue anyway to delete db row if file is already gone
    console.error('Storage deletion error:', storageError.message)
  }

  // 3. Delete from DB
  const { error: dbError } = await supabase.from('media_assets').delete().eq('id', id)
  if (dbError) return { success: false, error: dbError.message }

  revalidatePath('/admin/media')
  revalidatePath('/admin/menu')
  return { success: true }
}
