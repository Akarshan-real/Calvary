import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { getUserReservations } from '@/lib/db-server';
import MyBookingsClientView from './MyBookingsClientView';

export const metadata = {
  title: 'My Bookings | Calvary Artisanal Cuisine',
  description: 'View and manage all your table reservations, dining schedules, and booking statuses at Calvary.',
};

export default async function MyBookingsPage() {
  const authData = await getCurrentUser();

  if (!authData?.user) {
    redirect('/login');
  }

  const reservations = await getUserReservations();

  return (
    <MyBookingsClientView
      user={{
        id: authData.user.id,
        phone: authData.user.phone || authData.profile?.phone || null,
        email: authData.user.email || authData.profile?.email || null,
        name: authData.profile?.full_name || null,
        avatar: authData.profile?.avatar_url || null,
        role: authData.profile?.role || 'customer',
      }}
      initialReservations={reservations}
    />
  );
}
