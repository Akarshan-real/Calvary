export type UserRole = 'customer' | 'staff' | 'admin'
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
export type MessageStatus = 'UNREAD' | 'READ' | 'ARCHIVED'

export type FoodPreference = 'all' | 'veg' | 'non-veg' | 'vegan'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  email: string
  avatar_url: string | null
  birthday: string | null
  food_preference: FoodPreference
  dietary_notes: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface RestaurantSettings {
  id: number
  name: string
  tagline: string | null
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  currency: string
  logo_url: string | null
  cover_image_url: string | null
  timezone: string
  reservation_enabled: boolean
  updated_at: string
}

export interface RestaurantHours {
  id: number
  day_of_week: number // 0 = Sunday, 1 = Monday, etc.
  is_closed: boolean
  open_time: string | null
  close_time: string | null
}

export interface RestaurantClosure {
  id: number
  close_date: string
  reason: string | null
}

export interface RestaurantTable {
  id: number
  table_number: string
  capacity: number
  is_active: boolean
  zone?: string | null
  zone_slug?: string | null
  description?: string | null
  shape?: 'round' | 'rectangle' | 'booth' | 'square' | null
  min_capacity?: number | null
  is_vip?: boolean | null
  sort_order?: number | null
  floor?: string | null
  created_at?: string
  updated_at?: string
}

export interface ReservationSlot {
  id: number
  start_time: string
  duration_minutes: number
  is_active: boolean
}

export interface MediaAsset {
  id: string
  file_path: string
  file_name: string
  public_url: string
  folder: 'items' | 'displayAssets'
  alt_text: string | null
  mime_type: string | null
  size_bytes: number | null
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: number
  name: string
  description: string | null
  display_order: number
  is_active: boolean
}

export interface MenuItemNutrition {
  id: string
  item_id: number
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  allergens: string[]
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: number
  category_id: number | null
  name: string
  description: string | null
  price: number
  image_id?: string | null
  image_url: string | null
  is_available: boolean
  is_vegetarian: boolean
  is_featured: boolean
  display_order: number
  created_at: string
  portion_size?: string | null
  quantity?: string | null
  media_assets?: MediaAsset | null
  menu_item_nutrition?: MenuItemNutrition | null
}

export interface Reservation {
  id: string
  user_id: string | null
  table_id: number
  slot_id: number
  reservation_date: string
  customer_name: string
  customer_phone: string
  customer_email: string
  party_size: number
  special_request: string | null
  cancellation_reason?: string | null
  status: ReservationStatus
  created_at: string
  updated_at: string
  // Joined relation types
  restaurant_tables?: RestaurantTable
  reservation_slots?: ReservationSlot
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  status: MessageStatus
  created_at: string
}

export interface UserReservation {
  id: string
  user_id: string | null
  table_id: number
  slot_id: number
  reservation_date: string
  customer_name: string
  customer_phone: string
  customer_email: string
  party_size: number
  special_request: string | null
  cancellation_reason?: string | null
  feedback_rating?: number | null
  feedback_comment?: string | null
  status: ReservationStatus
  created_at: string
  updated_at: string
  restaurant_tables?: {
    id: number
    table_number: string
    capacity: number
    zone?: string | null
    zone_slug?: string | null
    description?: string | null
    shape?: string | null
    min_capacity?: number | null
    is_vip?: boolean | null
    sort_order?: number | null
    floor?: string | null
  } | null
  reservation_slots?: {
    id: number
    start_time: string
    duration_minutes: number
  } | null
}

export interface DateOccupancyInfo {
  date: string
  density: 'low' | 'medium' | 'high' | 'full' | 'closed'
  bookedCount: number
  maxCount: number
  remainingTables: number
  isClosed: boolean
  reason?: string
}

export interface GalleryItem {
  id: number
  title: string
  category: 'dishes' | 'ambiance' | 'cocktails' | 'kitchen'
  image: string
  aspect: string
  tag: string
  isCustom?: boolean
}