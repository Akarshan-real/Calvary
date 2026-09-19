import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import { getUserReservations } from '@/app/actions/user-reservations';
import ProfileClientView from './ProfileClientView';

export const metadata = {
  title: 'My Profile | Calvary Artisanal Cuisine',
  description: 'Manage your profile details, avatar, and view your upcoming and past restaurant table reservations.',
};

export default async function ProfilePage() {
  const authData = await getCurrentUser();

  // If not authenticated, redirect to login
  if (!authData?.user) {
    redirect('/login');
  }

  const reservations = await getUserReservations();

  return (
    <ProfileClientView
      user={{
        id: authData.user.id,
        phone: authData.user.phone || authData.profile?.phone || null,
        email: authData.user.email || authData.profile?.email || null,
      }}
      profile={authData.profile}
      initialReservations={reservations}
    />
  );
}
