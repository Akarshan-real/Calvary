'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Validates and normalizes an Indian mobile phone number.
 * Accepts formats like: "9876543210", "+919876543210", "09876543210", "98765 43210"
 * Returns the E.164 standard: "+91XXXXXXXXXX"
 */
function formatIndianPhoneNumber(phone: string): { valid: boolean; formatted: string; error?: string } {
  if (!phone) {
    return { valid: false, formatted: '', error: 'Phone number is required.' }
  }

  // Remove spaces, hyphens, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '')

  // Strip leading +91, 91, or 0
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3)
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2)
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1)
  }

  // Valid Indian mobile numbers are exactly 10 digits starting with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/
  if (!indianMobileRegex.test(cleaned)) {
    return {
      valid: false,
      formatted: '',
      error: 'Please enter a valid 10-digit mobile number (starting with 6, 7, 8, or 9).',
    }
  }

  return { valid: true, formatted: `+91${cleaned}` }
}

/**
 * Step 1: Send SMS OTP to mandatory Indian phone number
 * Requires Full Name AND Phone Number, with optional email and food_preference
 */
export async function sendPhoneOtp({
  fullName,
  phone,
  email,
  foodPreference = 'all',
}: {
  fullName: string
  phone: string
  email?: string
  foodPreference?: string
}) {
  const cleanName = fullName?.trim()
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Full name is mandatory and must be at least 2 characters.' }
  }

  const phoneCheck = formatIndianPhoneNumber(phone)
  if (!phoneCheck.valid) {
    return { success: false, error: phoneCheck.error }
  }

  const supabase = await createClient()

  const cleanEmail = email?.trim() || null

  // Send OTP with metadata saved in Supabase Auth
  const { error } = await supabase.auth.signInWithOtp({
    phone: phoneCheck.formatted,
    options: {
      data: {
        full_name: cleanName,
        phone: phoneCheck.formatted,
        email: cleanEmail,
        food_preference: foodPreference,
        role: 'customer',
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, formattedPhone: phoneCheck.formatted, error: null }
}

/**
 * Step 2: Verify the 6-digit SMS OTP token
 * Confirms OTP, establishes cookie session, and synchronizes profile details (email, food_preference)
 */
export async function verifyPhoneOtp(formData: FormData) {
  const supabase = await createClient()

  const phone = (formData.get('phone') as string)?.trim()
  const token = (formData.get('token') as string)?.trim()
  const fullName = (formData.get('fullName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || null
  const foodPreference = (formData.get('foodPreference') as string)?.trim() || 'all'

  if (!fullName) {
    return { success: false, error: 'Full name is mandatory.' }
  }

  const phoneCheck = formatIndianPhoneNumber(phone)
  if (!phoneCheck.valid) {
    return { success: false, error: phoneCheck.error }
  }

  if (!token || token.length !== 6) {
    return { success: false, error: 'Please enter a valid 6-digit OTP code.' }
  }

  // Verify OTP via Supabase Auth
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneCheck.formatted,
    token,
    type: 'sms',
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const user = data.user
  if (user) {
    // Fetch existing profile first to avoid overwriting existing name/details on sign-in
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('full_name, email, food_preference')
      .eq('id', user.id)
      .maybeSingle()

    const resolvedFullName =
      fullName && fullName !== 'Customer'
        ? fullName
        : existingProfile?.full_name || 'Customer'

    const updates: Record<string, any> = {
      full_name: resolvedFullName,
      phone: phoneCheck.formatted,
      updated_at: new Date().toISOString(),
    }

    if (foodPreference && foodPreference !== 'all') {
      updates.food_preference = foodPreference
    } else if (!existingProfile?.food_preference) {
      updates.food_preference = 'all'
    }

    if (email) {
      updates.email = email
    }

    await supabase.from('profiles').update(updates).eq('id', user.id)
  }

  revalidatePath('/', 'layout')
  return { success: true, user }
}

/**
 * Sign out user & clear session cookies
 */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * Retrieve current logged-in user + profile row
 */
export async function getCurrentUser() {
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
    const newProfile = {
      id: user.id,
      phone: user.phone || null,
      email: user.email || null,
      full_name: (user.user_metadata?.full_name as string) || 'Diner',
      role: 'customer',
      updated_at: new Date().toISOString(),
    }
    const { data: createdProfile } = await supabase
      .from('profiles')
      .upsert(newProfile)
      .select()
      .maybeSingle()

    return { user, profile: createdProfile || (newProfile as any) }
  }

  return { user, profile }
}

/**
 * Update current user's profile email (required for table reservations)
 */
export async function updateUserProfileEmail(email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in to update your profile email.' }
  }

  const cleanEmail = email?.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ email: cleanEmail, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/reserve')
  return { success: true, email: cleanEmail }
}
