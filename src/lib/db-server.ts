import { createClient } from '@/lib/supabase/server'
import {
  MenuItem,
  MenuCategory,
  RestaurantSettings,
  RestaurantHours,
  ContactMessage,
  GalleryItem,
  UserReservation,
} from '@/types/database'
import galleryData from '@/data/gallery.json'

// ==================== MENU & CATEGORIES ====================

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, media_assets(*), menu_item_nutrition(*)')
    .order('display_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getMenuItemById(idOrSlug: string | number): Promise<MenuItem | null> {
  const supabase = await createClient()
  const isNumeric = !isNaN(Number(idOrSlug))
  let query = supabase.from('menu_items').select('*, media_assets(*), menu_item_nutrition(*)')

  if (isNumeric) {
    query = query.eq('id', Number(idOrSlug))
  } else {
    const decoded = decodeURIComponent(String(idOrSlug)).replace(/-/g, ' ')
    query = query.ilike('name', `%${decoded}%`)
  }

  const { data, error } = await query.maybeSingle()
  if (error) return null
  return data
}

// ==================== SETTINGS & HOURS ====================

export async function getRestaurantSettings(): Promise<RestaurantSettings | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) return null
  return data
}

export async function getRestaurantHours(): Promise<RestaurantHours[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('restaurant_hours')
    .select('*')
    .order('day_of_week', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

// ==================== RESERVATIONS ====================

export async function getReservationCalendarData(daysAhead: number = 45) {
  const supabase = await createClient()

  const [
    { data: tables, error: tErr },
    { data: slots, error: sErr },
    { data: hours, error: hErr },
    { data: closures, error: cErr },
  ] = await Promise.all([
    supabase.from('restaurant_tables').select('*').eq('is_active', true).order('capacity', { ascending: true }),
    supabase.from('reservation_slots').select('*').eq('is_active', true).order('start_time', { ascending: true }),
    supabase.from('restaurant_hours').select('*').order('day_of_week', { ascending: true }),
    supabase.from('restaurant_closures').select('*'),
  ])

  if (tErr) throw new Error(tErr.message)
  if (sErr) throw new Error(sErr.message)

  const activeTables = tables || []
  const activeSlots = slots || []
  const activeHours = hours || []
  const activeClosures = closures || []

  const totalTables = activeTables.length
  const totalSlots = activeSlots.length
  const maxDailyBookings = Math.max(1, totalTables * totalSlots)

  const today = new Date()
  const startDateStr = today.toISOString().split('T')[0]
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + daysAhead)
  const endDateStr = endDate.toISOString().split('T')[0]

  const { data: reservations } = await supabase
    .from('reservations')
    .select('id, table_id, slot_id, reservation_date, status')
    .gte('reservation_date', startDateStr)
    .lte('reservation_date', endDateStr)
    .neq('status', 'CANCELLED')

  const bookingsByDate: Record<string, number> = {}
  if (reservations) {
    for (const r of reservations) {
      bookingsByDate[r.reservation_date] = (bookingsByDate[r.reservation_date] || 0) + 1
    }
  }

  const hoursMap: Record<number, boolean> = {}
  for (const h of activeHours) {
    hoursMap[h.day_of_week] = h.is_closed
  }

  const closureMap: Record<string, string | null> = {}
  for (const c of activeClosures) {
    closureMap[c.close_date] = c.reason || 'Closed'
  }

  const dateOccupancyMap: Record<string, any> = {}

  for (let i = 0; i < daysAhead; i++) {
    const curDate = new Date(today)
    curDate.setDate(today.getDate() + i)
    const dateStr = curDate.toISOString().split('T')[0]
    const dayOfWeek = curDate.getDay()

    let isClosed = !!hoursMap[dayOfWeek]
    let closeReason: string | undefined = isClosed ? 'Weekly Rest Day' : undefined

    if (closureMap[dateStr]) {
      isClosed = true
      closeReason = closureMap[dateStr] || 'Restaurant Holiday'
    }

    const bookedCount = bookingsByDate[dateStr] || 0
    const remaining = Math.max(0, maxDailyBookings - bookedCount)

    let density: 'low' | 'medium' | 'high' | 'full' | 'closed' = 'low'
    if (isClosed) {
      density = 'closed'
    } else if (remaining === 0) {
      density = 'full'
    } else if (bookedCount > Math.floor(maxDailyBookings * 0.65)) {
      density = 'high'
    } else if (bookedCount > Math.floor(maxDailyBookings * 0.25)) {
      density = 'medium'
    } else {
      density = 'low'
    }

    dateOccupancyMap[dateStr] = {
      date: dateStr,
      density,
      bookedCount,
      maxCount: maxDailyBookings,
      remainingTables: remaining,
      isClosed,
      reason: closeReason,
    }
  }

  return {
    tables: activeTables,
    slots: activeSlots,
    dateOccupancyMap,
  }
}

export async function getUserReservations(): Promise<UserReservation[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const userPhone = user.phone
  const userEmail = user.email

  let query = supabase
    .from('reservations')
    .select('*, restaurant_tables(*), reservation_slots(*)')
    .order('reservation_date', { ascending: false })

  if (userPhone && userEmail) {
    query = query.or(`user_id.eq.${user.id},customer_phone.eq.${userPhone},customer_email.eq.${userEmail}`)
  } else if (userEmail) {
    query = query.or(`user_id.eq.${user.id},customer_email.eq.${userEmail}`)
  } else {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch user reservations:', error.message)
    return []
  }
  return data || []
}

export async function getAllReservationsAdmin() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservations')
    .select('*, restaurant_tables(*), reservation_slots(*)')
    .order('reservation_date', { ascending: false })

  if (error) {
    console.error('Failed to fetch reservations for admin:', error.message)
    return []
  }
  return data || []
}

// ==================== GALLERY ====================

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const supabase = await createClient()
    const { data: customAssets, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('folder', 'displayAssets')
      .order('created_at', { ascending: false })

    const staticItems: GalleryItem[] = (galleryData as any[]).map((item) => ({
      ...item,
      isCustom: false,
    }))

    if (error || !customAssets) return staticItems

    const dynamicItems: GalleryItem[] = customAssets.map((asset) => {
      let meta = { category: 'dishes' as const, tag: 'Artisanal Selection', aspect: 'aspect-[4/3]' }
      if (asset.alt_text) {
        try {
          const parsed = JSON.parse(asset.alt_text)
          if (parsed && typeof parsed === 'object') {
            meta = {
              category: parsed.category || 'dishes',
              tag: parsed.tag || 'Artisanal Selection',
              aspect: parsed.aspect || 'aspect-[4/3]',
            }
          }
        } catch {
          // fallback
        }
      }
      return {
        id: asset.id,
        title: asset.file_name || 'Artisanal Selection',
        category: meta.category,
        image: asset.public_url,
        aspect: meta.aspect || 'aspect-[4/3]',
        tag: meta.tag || 'Artisanal Craft',
        isCustom: true,
      }
    })

    return [...dynamicItems, ...staticItems]
  } catch (err) {
    console.error('Failed to get gallery items:', err)
    return galleryData as GalleryItem[]
  }
}

// ==================== CONTACT MESSAGES ====================

export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}