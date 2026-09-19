import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoachSchedulingCard from "@/components/CoachSchedulingCard";
import { getCurrentUser } from "@/app/actions/auth";
import { getReservationCalendarData, getRestaurantSettings } from "@/app/actions/restaurant";
import { Sparkles, ShieldCheck, Clock, Award, Users, HeartHandshake } from "lucide-react";

export const metadata = {
  title: "Table Reservation | Calvary Fine Dining",
  description:
    "Reserve your artisanal dining table at Calvary. Live interactive calendar, time slots, and seat selection with admin table confirmation.",
};

export default async function ReservePage() {
  const [authData, calendarData, settings] = await Promise.all([
    getCurrentUser().catch(() => null),
    getReservationCalendarData().catch(() => ({ tables: [], slots: [], dateOccupancyMap: {} })),
    getRestaurantSettings().catch(() => null),
  ]);

  return (
    <div className="min-h-screen bg-[#090b0e] text-white flex flex-col selection:bg-[#ffbe33] selection:text-neutral-950">
      {/* Top Navigation */}
      <Navbar
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
      />

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        {/* Page Hero Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Reserve Your Signature Table
          </h1>

          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Select your preferred date from our availability calendar, pick your dining timing, and select your table. Our restaurant manager reviews all requests to lock your table.
          </p>
        </div>

        {/* Master Interactive Reservation Scheduling Component */}
        <div className="relative">
          {/* Ambient Glows */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ffbe33]/10 rounded-full blur-[140px] pointer-events-none" />

          <CoachSchedulingCard
            initialDateOccupancyMap={calendarData.dateOccupancyMap}
            user={
              authData?.user
                ? {
                    id: authData.user.id,
                    email: authData.profile?.email || null,
                    name: authData.profile?.full_name || null,
                    phone: authData.profile?.phone || null,
                  }
                : null
            }
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}