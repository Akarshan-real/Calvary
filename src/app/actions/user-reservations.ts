'use server';

import { createClient } from '@/lib/supabase/server';

export interface UserReservation {
  id: string;
  table_id: number;
  slot_id: number;
  reservation_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  party_size: number;
  special_request: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  created_at: string;
  restaurant_tables?: {
    id: number;
    table_number: string;
    capacity: number;
  } | null;
  reservation_slots?: {
    id: number;
    start_time: string;
    duration_minutes: number;
  } | null;
}

export async function getUserReservations(): Promise<UserReservation[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Look up reservations by user_id OR phone / email
  const userPhone = user.phone;
  const userEmail = user.email;

  let query = supabase
    .from('reservations')
    .select('*, restaurant_tables(*), reservation_slots(*)')
    .order('reservation_date', { ascending: false });

  if (userPhone && userEmail) {
    query = query.or(`user_id.eq.${user.id},customer_phone.eq.${userPhone},customer_email.eq.${userEmail}`);
  } else if (userPhone) {
    query = query.or(`user_id.eq.${user.id},customer_phone.eq.${userPhone}`);
  } else if (userEmail) {
    query = query.or(`user_id.eq.${user.id},customer_email.eq.${userEmail}`);
  } else {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to load user reservations:', error.message);
    return [];
  }

  return data || [];
}

export async function cancelUserReservation(reservationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    // Check if reservation belongs to user
    const { data: reservation, error: fetchErr } = await supabase
      .from('reservations')
      .select('id, user_id, customer_phone, customer_email, status')
      .eq('id', reservationId)
      .maybeSingle();

    if (fetchErr || !reservation) {
      return { success: false, error: 'Reservation not found.' };
    }

    const isOwner =
      reservation.user_id === user.id ||
      (user.phone && reservation.customer_phone === user.phone) ||
      (user.email && reservation.customer_email === user.email);

    if (!isOwner) {
      return { success: false, error: 'You do not have permission to cancel this booking.' };
    }

    if (reservation.status === 'CANCELLED') {
      return { success: true };
    }

    const { error: updateErr } = await supabase
      .from('reservations')
      .update({ status: 'CANCELLED' })
      .eq('id', reservationId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to cancel reservation.' };
  }
}
