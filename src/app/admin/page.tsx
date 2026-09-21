import React from "react";
import AdminDashboardClient from "@/components/AdminDashboardClient";
import { getCurrentUser } from "@/lib/auth-server";
import {
  getAllReservationsAdmin,
  getMenuItems,
  getMenuCategories,
  getContactMessages,
  getGalleryItems,
} from "@/lib/db-server";

export const metadata = {
  title: "Admin Portal • Restaurant Control Center | Calvary",
  description:
    "Admin portal for managing restaurant reservations, approving pending booking requests, managing table locks, updating menu items, uploading gallery photos, and replying to customer contact inquiries.",
};

export default async function AdminDashboardPage() {
  const [authData, allReservations, menuItems, categories, galleryItems, messages] =
    await Promise.all([
      getCurrentUser().catch(() => null),
      getAllReservationsAdmin().catch(() => []),
      getMenuItems().catch(() => []),
      getMenuCategories().catch(() => []),
      getGalleryItems().catch(() => []),
      getContactMessages().catch(() => []),
    ]);

  return (
    <AdminDashboardClient
      user={
        authData?.user
          ? {
              name: authData.profile?.full_name,
              email: authData.user.email,
              role: authData.profile?.role,
              avatar: authData.profile?.avatar_url,
              phone: authData.user.phone,
            }
          : null
      }
      initialReservations={allReservations as any}
      initialMenuItems={menuItems}
      categories={categories}
      galleryItems={galleryItems}
      initialMessages={messages}
    />
  );
}

