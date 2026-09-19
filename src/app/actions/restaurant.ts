'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MenuItem, MenuCategory, RestaurantSettings, RestaurantHours, RestaurantTable, ReservationSlot, ReservationStatus } from '@/types/database'

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
  
  // If it is numeric id
  const isNumeric = !isNaN(Number(idOrSlug))
  let query = supabase.from('menu_items').select('*, media_assets(*), menu_item_nutrition(*)')
  
  if (isNumeric) {
    query = query.eq('id', Number(idOrSlug))
  } else {
    // Search by decoded name or slug
    const decoded = decodeURIComponent(String(idOrSlug)).replace(/-/g, ' ')
    query = query.ilike('name', `%${decoded}%`)
  }

  const { data, error } = await query.maybeSingle()
  if (error) return null
  return data
}

export async function upsertMenuItemNutrition(nutrition: {
  item_id: number
  calories?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  fiber_g?: number | null
  allergens?: string[]
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_item_nutrition')
    .upsert(nutrition, { onConflict: 'item_id' })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/menu')
  revalidatePath('/admin/menu')
  return { success: true, data }
}

export async function upsertMenuItem(item: Partial<MenuItem>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(item)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/menu')
  revalidatePath('/admin/menu')
  return { success: true, data }
}

export async function deleteMenuItem(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/menu')
  revalidatePath('/admin/menu')
  return { success: true }
}

export async function toggleMenuItemAvailability(id: number, is_available: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('menu_items')
    .update({ is_available })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/menu')
  revalidatePath('/admin/menu')
  return { success: true }
}

// ==================== RESERVATIONS & CALENDAR ====================

export interface DateOccupancyInfo {
  date: string;
  density: 'low' | 'medium' | 'high' | 'full' | 'closed';
  bookedCount: number;
  maxCount: number;
  remainingTables: number;
  isClosed: boolean;
  reason?: string;
}

export async function getReservationCalendarData(daysAhead: number = 45) {
  const supabase = await createClient()

  // 1. Fetch tables, slots, hours, closures
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

  // 2. Fetch reservations within the date window
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

  const existingReservations = reservations || []

  // 3. Compute density mapping for each day
  const dateOccupancyMap: Record<string, DateOccupancyInfo> = {}

  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayOfWeek = d.getDay() // 0 = Sun, 1 = Mon...

    // Check weekly closures
    const daySchedule = activeHours.find((h) => h.day_of_week === dayOfWeek)
    const isDayClosed = daySchedule?.is_closed ?? false

    // Check specific custom closures
    const closureRecord = activeClosures.find((c) => c.close_date === dateStr)
    const isCustomClosed = !!closureRecord

    const isClosed = isDayClosed || isCustomClosed
    const closeReason = closureRecord?.reason || (isDayClosed ? 'Weekly Rest Day' : undefined)

    // Count non-cancelled bookings for this date
    const dayBookings = existingReservations.filter((r) => r.reservation_date === dateStr)
    const bookedCount = dayBookings.length
    const remaining = Math.max(0, maxDailyBookings - bookedCount)

    let density: DateOccupancyInfo['density'] = 'low'

    if (isClosed) {
      density = 'closed'
    } else if (bookedCount >= maxDailyBookings) {
      density = 'full'
    } else if (bookedCount > Math.floor(maxDailyBookings * 0.6)) {
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

export async function getDateSlotAndTableAvailability(date: string) {
  const supabase = await createClient()

  const [{ data: tables }, { data: slots }, { data: existingReservations }] = await Promise.all([
    supabase.from('restaurant_tables').select('*').eq('is_active', true).order('capacity', { ascending: true }),
    supabase.from('reservation_slots').select('*').eq('is_active', true).order('start_time', { ascending: true }),
    supabase
      .from('reservations')
      .select('table_id, slot_id, status')
      .eq('reservation_date', date)
      .neq('status', 'CANCELLED'),
  ])

  const activeTables = tables || []
  const activeSlots = slots || []
  const bookings = existingReservations || []

  // For each slot, calculate which tables are still free
  const slotsWithTables = activeSlots.map((slot) => {
    const bookedTableIds = new Set(
      bookings.filter((b) => b.slot_id === slot.id).map((b) => b.table_id)
    )

    const freeTables = activeTables.filter((t) => !bookedTableIds.has(t.id))

    return {
      slot,
      availableTables: freeTables,
      availableTableCount: freeTables.length,
      isAvailable: freeTables.length > 0,
    }
  })

  return slotsWithTables
}

export async function getAvailableSlots() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservation_slots')
    .select('*')
    .eq('is_active', true)
    .order('start_time', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getAvailableTables(partySize: number, date: string, slotId: number) {
  const supabase = await createClient()

  // 1. Get candidate tables with sufficient capacity
  const { data: tables, error: tableError } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('is_active', true)
    .gte('capacity', partySize)
    .order('capacity', { ascending: true })

  if (tableError) throw new Error(tableError.message)
  if (!tables || tables.length === 0) return []

  // 2. Filter out tables that already have active reservations on that date & slot
  const { data: existingReservations } = await supabase
    .from('reservations')
    .select('table_id')
    .eq('reservation_date', date)
    .eq('slot_id', slotId)
    .neq('status', 'CANCELLED')

  const bookedTableIds = new Set(existingReservations?.map((r) => r.table_id) || [])
  return tables.filter((t) => !bookedTableIds.has(t.id))
}

export async function createReservation(bookingData: {
  table_id: number
  slot_id: number
  reservation_date: string
  customer_name: string
  customer_phone: string
  customer_email: string
  party_size: number
  special_request?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Mandatory email verification check
  const cleanEmail = bookingData.customer_email?.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, error: 'A valid email address is mandatory for table reservations so we can send your confirmation.' }
  }

  // If user is authenticated and their profile has no email, automatically sync it
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    if (!profile?.email) {
      await supabase
        .from('profiles')
        .update({ email: cleanEmail, updated_at: new Date().toISOString() })
        .eq('id', user.id)
    }
  }

  // Check if table is already reserved on that date & slot
  const { data: collision } = await supabase
    .from('reservations')
    .select('id')
    .eq('table_id', bookingData.table_id)
    .eq('slot_id', bookingData.slot_id)
    .eq('reservation_date', bookingData.reservation_date)
    .neq('status', 'CANCELLED')
    .maybeSingle()

  if (collision) {
    return {
      success: false,
      error: 'This specific table was just reserved by another guest for this time. Please select another table.',
    }
  }

  // Insert reservation with PENDING status (requires admin approval)
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      table_id: bookingData.table_id,
      slot_id: bookingData.slot_id,
      reservation_date: bookingData.reservation_date,
      customer_name: bookingData.customer_name.trim(),
      customer_phone: bookingData.customer_phone.trim(),
      customer_email: cleanEmail,
      party_size: bookingData.party_size,
      special_request: bookingData.special_request?.trim() || null,
      user_id: user?.id || null,
      status: 'PENDING',
    })
    .select('*, restaurant_tables(*), reservation_slots(*)')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/reserve')
  revalidatePath('/admin')
  revalidatePath('/admin/reservations')
  revalidatePath('/my-reservations')

  return { success: true, data }
}

export async function adminApproveReservation(id: string) {
  const supabase = await createClient()

  // 1. Fetch reservation details
  const { data: res, error: fetchErr } = await supabase
    .from('reservations')
    .select('*, restaurant_tables(*), reservation_slots(*)')
    .eq('id', id)
    .single()

  if (fetchErr || !res) {
    return { success: false, error: fetchErr?.message || 'Reservation not found' }
  }

  // 2. Update status to CONFIRMED (Locks table)
  const { error: updateErr } = await supabase
    .from('reservations')
    .update({ status: 'CONFIRMED', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateErr) return { success: false, error: updateErr.message }

  // 3. Generate pre-formatted approval email response
  const tableName = res.restaurant_tables?.table_number ? `Table ${res.restaurant_tables.table_number}` : 'your reserved table'
  const timeSlot = res.reservation_slots?.start_time || 'scheduled time'
  const subject = encodeURIComponent(`Reservation Approved: ${tableName} at Calvary Restaurant`)
  const body = encodeURIComponent(
    `Dear ${res.customer_name},\n\n` +
    `We are delighted to inform you that your table reservation at Calvary Fine Dining has been APPROVED!\n\n` +
    `Reservation Details:\n` +
    `• Date: ${res.reservation_date}\n` +
    `• Time: ${timeSlot}\n` +
    `• Table: ${tableName} (${res.restaurant_tables?.capacity || res.party_size} Guests)\n` +
    `• Party Size: ${res.party_size} Guests\n` +
    `• Booking ID: ${res.id}\n\n` +
    `Your table is now locked and confirmed. We look forward to offering you an unforgettable culinary evening!\n\n` +
    `Warm regards,\n` +
    `Calvary Restaurant Management\n` +
    `+91 98765 43210`
  )

  const mailtoLink = `mailto:${res.customer_email}?subject=${subject}&body=${body}`

  revalidatePath('/reserve')
  revalidatePath('/admin')
  revalidatePath('/admin/reservations')
  revalidatePath('/my-reservations')

  return {
    success: true,
    reservation: res,
    mailtoLink,
    emailSubject: `Reservation Approved: ${tableName} at Calvary Restaurant`,
  }
}

export async function adminRejectReservation(id: string, reason?: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/reserve')
  revalidatePath('/admin')
  revalidatePath('/admin/reservations')
  revalidatePath('/my-reservations')

  return { success: true }
}

export async function updateReservationStatus(id: string, status: ReservationStatus) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  revalidatePath('/admin/reservations')
  revalidatePath('/my-reservations')
  return { success: true }
}

export async function getAllReservations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservations')
    .select('*, restaurant_tables(*), reservation_slots(*)')
    .order('reservation_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

// ==================== RESTAURANT SETTINGS & HOURS ====================

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

export async function updateRestaurantSettings(settings: Partial<RestaurantSettings>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('restaurant_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) return { success: false, error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
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

// ==================== CONTACT MESSAGES ====================

export async function submitContactMessage(formData: {
  name: string
  email: string
  phone?: string | null
  message: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .insert({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || null,
      message: formData.message.trim(),
      status: 'UNREAD',
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function getContactMessages() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get contact messages:', error.message)
    return []
  }
  return data || []
}

export async function updateContactMessageStatus(id: number, status: 'UNREAD' | 'READ' | 'ARCHIVED') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteContactMessage(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  return { success: true }
}
