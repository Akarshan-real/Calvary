import { createClient } from '@/lib/supabase/server'

export const BUCKET_NAME = 'images'

export type ImageFolder = 'items' | 'displayAssets' | 'userPfp'

export interface StorageImageFile {
  name: string
  id: string | null
  updated_at: string | null
  created_at: string | null
  last_accessed_at: string | null
  metadata: Record<string, any> | null
  publicUrl: string
  path: string
}

/**
 * Uploads an image file to the Supabase 'images' bucket.
 * Supports overwrite/upsert if requested.
 */
export async function uploadImage(
  folder: ImageFolder,
  file: File,
  customName?: string,
  upsert = false
): Promise<{ url: string | null; path: string | null; error: string | null }> {
  const supabase = await createClient()

  const fileExt = file.name.split('.').pop()
  const baseName = customName
    ? customName.replace(/[^a-zA-Z0-9_-]/g, '_')
    : `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`
  
  const filePath = `${folder}/${baseName}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert,
    })

  if (uploadError) {
    return { url: null, path: null, error: uploadError.message }
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  return {
    url: data.publicUrl,
    path: filePath,
    error: null,
  }
}

/**
 * Lists all image files in a specific folder ('items' or 'displayAssets') with their public URLs.
 * Gives admin a full media gallery view.
 */
export async function listImages(folder: ImageFolder): Promise<{ images: StorageImageFile[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folder, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  })

  if (error) {
    return { images: [], error: error.message }
  }

  // Filter out placeholder directories if any, and map to full image items
  const images: StorageImageFile[] = (data || [])
    .filter((item) => item.name && item.id)
    .map((file) => {
      const filePath = `${folder}/${file.name}`
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
      return {
        ...file,
        path: filePath,
        publicUrl: urlData.publicUrl,
      }
    })

  return { images, error: null }
}

/**
 * Renames or moves an image file within the bucket.
 * e.g., renameImage('items/123_burger.jpg', 'items/signature_wagyu_burger.jpg')
 */
export async function renameImage(
  fromPath: string,
  toPath: string
): Promise<{ success: boolean; newUrl: string | null; error: string | null }> {
  const supabase = await createClient()

  // Clean bucket prefixes if provided
  const cleanFrom = fromPath.replace(`${BUCKET_NAME}/`, '')
  const cleanTo = toPath.replace(`${BUCKET_NAME}/`, '')

  const { error } = await supabase.storage.from(BUCKET_NAME).move(cleanFrom, cleanTo)

  if (error) {
    return { success: false, newUrl: null, error: error.message }
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(cleanTo)
  return { success: true, newUrl: data.publicUrl, error: null }
}

/**
 * Updates/replaces an existing image file in-place (same path) with a new file.
 */
export async function replaceImage(
  targetPath: string,
  newFile: File
): Promise<{ success: boolean; url: string | null; error: string | null }> {
  const supabase = await createClient()
  const cleanPath = targetPath.replace(`${BUCKET_NAME}/`, '')

  const { error } = await supabase.storage.from(BUCKET_NAME).update(cleanPath, newFile, {
    cacheControl: '0', // bypass cache to see immediate updates
    upsert: true,
  })

  if (error) {
    return { success: false, url: null, error: error.message }
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(cleanPath)
  return { success: true, url: data.publicUrl, error: null }
}

/**
 * Deletes an image from the Supabase 'images' bucket given its path or full public URL.
 */
export async function deleteImage(publicUrlOrPath: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  let path = publicUrlOrPath
  if (publicUrlOrPath.includes(`/${BUCKET_NAME}/`)) {
    path = publicUrlOrPath.split(`/${BUCKET_NAME}/`)[1]
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])
  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
