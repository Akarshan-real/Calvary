import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactClientForm from "./ContactClientForm";
import { getCurrentUser } from "@/lib/auth-server";
import { getRestaurantSettings, getRestaurantHours } from "@/lib/db-server";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  MessageSquare,
  UtensilsCrossed,
  ShieldCheck,
} from "lucide-react";
import { ParallaxHeroBg } from "@/components/sections/home/ParallaxHeroBg";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export const metadata = {
  title: "Contact Us | Calvary Artisanal Cuisine & Bar",
  description:
    "Get in touch with Calvary Restaurant. Questions regarding dietary accommodations, private dining events, or table reservations.",
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function ContactPage() {
  const [authData, settings, hours] = await Promise.all([
    getCurrentUser().catch(() => null),
    getRestaurantSettings().catch(() => null),
    getRestaurantHours().catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-[#090b0e] text-white flex flex-col selection:bg-[#ffbe33] selection:text-neutral-950">
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
      <section className="relative overflow-hidden py-20 sm:py-28 px-6 sm:px-8 border-b border-white/5">
        <ParallaxHeroBg
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop"
          alt="Calvary Concierge & Hospitality"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#090b0e]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <RevealOnScroll direction="down" delay={100}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#ffbe33]" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#ffbe33]">
                We're Here For You
              </span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <h1
              className="text-4xl sm:text-6xl font-bold text-white tracking-tight drop-shadow-md"
              style={{ fontFamily: "var(--font-cursive), cursive" }}
            >
              Get In Touch
            </h1>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={300}>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
              Have a question about our seasonal menu, planning a private dining reception, or need special dining accommodations? Drop our team a line.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <main className="flex-1 py-14 sm:py-20 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Direct Contact Info, Hours & Map */}
          <div className="lg:col-span-5 space-y-6">
            <RevealOnScroll direction="left" delay={150}>
              <div className="p-8 rounded-3xl bg-[#12141a]/90 backdrop-blur-xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffbe33]/5 rounded-full blur-3xl pointer-events-none" />

                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                  <UtensilsCrossed className="w-5 h-5 text-[#ffbe33]" />
                  <span>Calvary Culinary Headquarters</span>
                </h3>

                <div className="space-y-4 text-sm text-neutral-300">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#ffbe33]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Address</p>
                      <p className="text-neutral-200 mt-0.5 leading-relaxed">
                        {settings?.address || "124 Heritage Lane, Indiranagar, Bengaluru, Karnataka 560038, India"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#ffbe33]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Direct Line</p>
                      <a
                        href={`tel:${settings?.phone || "+919876543210"}`}
                        className="text-neutral-200 hover:text-[#ffbe33] transition-colors mt-0.5 block font-medium"
                      >
                        {settings?.phone || "+91 98765 43210"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#ffbe33]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Email Concierge</p>
                      <a
                        href={`mailto:${settings?.email || "hello@calvary.com"}`}
                        className="text-neutral-200 hover:text-[#ffbe33] transition-colors mt-0.5 block font-medium"
                      >
                        {settings?.email || "hello@calvary.com"}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-extrabold text-neutral-300">
                    <Clock className="w-4 h-4 text-[#ffbe33]" />
                    <span>Weekly Service Hours</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-400">
                    {hours.length > 0 ? (
                      hours.map((h) => (
                        <div key={h.id} className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-neutral-300">{dayNames[h.day_of_week]}</span>
                          <span>{h.is_closed ? "Closed" : `${h.open_time || "11:00 AM"} – ${h.close_time || "10:00 PM"}`}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-neutral-300">Tuesday – Friday</span>
                          <span>11:00 AM – 10:00 PM</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-neutral-300">Saturday – Sunday</span>
                          <span>11:00 AM – 11:00 PM</span>
                        </div>
                        <div className="flex justify-between py-1 text-red-400 font-medium">
                          <span>Monday</span>
                          <span>Closed (Culinary Prep)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <RevealOnScroll direction="right" delay={200}>
              <div className="p-8 sm:p-10 rounded-3xl bg-[#12141a]/90 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#ffbe33]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                    <MessageSquare className="w-6 h-6 text-[#ffbe33]" />
                    <span>Send a Direct Message</span>
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-sm">
                    Our hospitality manager typically replies within 2–4 hours during operational service.
                  </p>
                </div>

                <ContactClientForm
                  initialUser={{
                    name: authData?.profile?.full_name || (authData?.user?.user_metadata?.full_name as string) || "",
                    email: authData?.profile?.email || authData?.user?.email || (authData?.user?.user_metadata?.email as string) || "",
                    phone: authData?.profile?.phone || authData?.user?.phone || (authData?.user?.user_metadata?.phone as string) || "",
                  }}
                />
              </div>
            </RevealOnScroll>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}