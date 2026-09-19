'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { uploadMediaAsset, deleteMediaAsset } from './media';
import galleryData from '@/data/gallery.json';

export interface GalleryItem {
  id: number | string;
  title: string;
  category: 'all' | 'dishes' | 'cocktails' | 'ambiance' | 'kitchen';
  image: string;
  aspect: string;
  tag: string;
  isCustom?: boolean;
}

/**
 * Encodes category, tag, and aspect ratio into alt_text cleanly
 */
function packAltText(category: string, tag: string, aspect: string): string {
  return JSON.stringify({ category, tag, aspect });
}

/**
 * Decodes packed alt_text or falls back to legacy string inspection
 */
function unpackAltText(altText: string | null | undefined): {
  category: GalleryItem['category'];
  tag: string;
  aspect: string;
} {
  if (!altText) {
    return { category: 'dishes', tag: 'Artisanal Selection', aspect: 'aspect-[4/3]' };
  }

  try {
    const parsed = JSON.parse(altText);
    if (parsed && typeof parsed === 'object') {
      return {
        category: parsed.category || 'dishes',
        tag: parsed.tag || 'Artisanal Selection',
        aspect: parsed.aspect || 'aspect-[4/3]',
      };
    }
  } catch {
    // Legacy altText fallback
  }

  const alt = altText.toLowerCase();
  let cat: GalleryItem['category'] = 'dishes';
  if (alt.includes('cocktail') || alt.includes('drink') || alt.includes('bar')) cat = 'cocktails';
  else if (alt.includes('ambiance') || alt.includes('dining') || alt.includes('hall')) cat = 'ambiance';
  else if (alt.includes('kitchen') || alt.includes('chef')) cat = 'kitchen';
  else if (alt.includes('dish') || alt.includes('food')) cat = 'dishes';

  return {
    category: cat,
    tag: altText,
    aspect: 'aspect-[4/3]',
  };
}

/**
 * Fetches gallery items, merging static base photos with dynamic uploads from media_assets (displayAssets)
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const supabase = await createClient();
    const { data: customAssets, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('folder', 'displayAssets')
      .order('created_at', { ascending: false });

    const staticItems: GalleryItem[] = (galleryData as any[]).map((item) => ({
      ...item,
      isCustom: false,
    }));

    if (error || !customAssets) {
      return staticItems;
    }

    const dynamicItems: GalleryItem[] = customAssets.map((asset) => {
      const meta = unpackAltText(asset.alt_text);
      return {
        id: asset.id,
        title: asset.file_name || 'Artisanal Selection',
        category: meta.category,
        image: asset.public_url,
        aspect: meta.aspect || 'aspect-[4/3]',
        tag: meta.tag || 'Artisanal Craft',
        isCustom: true,
      };
    });

    return [...dynamicItems, ...staticItems];
  } catch (err) {
    console.error('Failed to get dynamic gallery items:', err);
    return galleryData as GalleryItem[];
  }
}

/**
 * Adds a new image to the gallery using Supabase Storage and media_assets (File upload)
 */
export async function addGalleryPhoto(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await uploadMediaAsset('displayAssets', formData);
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to upload photo.' };
    }

    revalidatePath('/galary');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while uploading.' };
  }
}

/**
 * Adds a new image to the gallery via external image URL
 */
export async function addGalleryPhotoUrl(data: {
  title: string;
  imageUrl: string;
  category: GalleryItem['category'];
  tag: string;
  aspect?: string;
}): Promise<{ success: boolean; data?: GalleryItem; error?: string }> {
  try {
    const supabase = await createClient();
    const packed = packAltText(data.category, data.tag.trim() || 'Artisanal Craft', data.aspect || 'aspect-[4/3]');

    const { data: asset, error } = await supabase
      .from('media_assets')
      .insert({
        file_path: `url_${Date.now()}`,
        file_name: data.title.trim() || 'Artisanal Selection',
        public_url: data.imageUrl.trim(),
        folder: 'displayAssets',
        alt_text: packed,
        mime_type: 'image/external',
        size_bytes: 0,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/galary');
    revalidatePath('/admin');

    const meta = unpackAltText(asset.alt_text);
    return {
      success: true,
      data: {
        id: asset.id,
        title: asset.file_name,
        category: meta.category,
        image: asset.public_url,
        aspect: meta.aspect,
        tag: meta.tag,
        isCustom: true,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add image URL.' };
  }
}

/**
 * Updates metadata / photo details of an existing gallery item
 */
export async function updateGalleryPhoto(
  id: string,
  data: {
    title: string;
    category: GalleryItem['category'];
    tag: string;
    imageUrl?: string;
    aspect?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const packed = packAltText(data.category, data.tag.trim() || 'Artisanal Craft', data.aspect || 'aspect-[4/3]');

    const updates: Record<string, any> = {
      file_name: data.title.trim(),
      alt_text: packed,
      updated_at: new Date().toISOString(),
    };

    if (data.imageUrl && data.imageUrl.trim()) {
      updates.public_url = data.imageUrl.trim();
    }

    const { error } = await supabase
      .from('media_assets')
      .update(updates)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/galary');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update photo.' };
  }
}

/**
 * Removes a custom gallery photo from the database and storage
 */
export async function deleteGalleryPhoto(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteMediaAsset(id);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    revalidatePath('/galary');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete photo.' };
  }
}
