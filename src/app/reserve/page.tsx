import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoachSchedulingCard from "@/components/CoachSchedulingCard";
import { getCurrentUser } from "@/lib/auth-server";
import { getReservationCalendarData, getRestaurantSettings } from "@/lib/db-server";
import { Sparkles, ShieldCheck, Clock, Award, Users, HeartHandshake } from "lucide-react";
import { ParallaxHeroBg } from "@/components/sections/home/ParallaxHeroBg";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

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

      {/* Hero Header with Parallax */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <ParallaxHeroBg
          src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1600&auto=format&fit=crop"
          alt="Calvary Dining Experience"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#090b0e]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <RevealOnScroll direction="down" delay={100}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#ffbe33]" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#ffbe33]">
                Culinary Experience
              </span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
              Reserve Your Signature Table
            </h1>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={300}>
            <p className="text-neutral-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light">
              Select your preferred date from our availability calendar, pick your dining timing, and choose your preferred table or ambient seating zone.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        {/* Master Interactive Reservation Scheduling Component */}
        <RevealOnScroll direction="up" delay={150}>
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
        </RevealOnScroll>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}