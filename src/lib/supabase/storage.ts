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

export async function renameImage(
  fromPath: string,
  toPath: string
): Promise<{ success: boolean; newUrl: string | null; error: string | null }> {
  const supabase = await createClient()

  const cleanFrom = fromPath.replace(`${BUCKET_NAME}/`, '')
  const cleanTo = toPath.replace(`${BUCKET_NAME}/`, '')

  const { error } = await supabase.storage.from(BUCKET_NAME).move(cleanFrom, cleanTo)

  if (error) {
    return { success: false, newUrl: null, error: error.message }
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(cleanTo)
  return { success: true, newUrl: data.publicUrl, error: null }
}

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
