import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryClientView from "./GalleryClientView";
import { getCurrentUser } from "@/lib/auth-server";
import { getGalleryItems } from "@/lib/db-server";
import { Sparkles, Camera } from "lucide-react";
import { ParallaxHeroBg } from "@/components/sections/home/ParallaxHeroBg";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export const metadata = {
  title: "Visual Gallery | Calvary Artisanal Cuisine & Bar",
  description:
    "A photographic celebration of artisanal culinary artistry, handcrafted cocktails, and luxurious restaurant ambiance at Calvary.",
};

export default async function GalleryPage() {
  const [authData, galleryItems] = await Promise.all([
    getCurrentUser().catch(() => null),
    getGalleryItems().catch(() => []),
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

      {/* Hero Banner with Parallax */}
      <section className="relative overflow-hidden py-20 sm:py-28 px-6 sm:px-8 border-b border-white/5">
        <ParallaxHeroBg
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600&auto=format&fit=crop"
          alt="Calvary Artisanal Cuisine & Atmosphere"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#090b0e]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <RevealOnScroll direction="down" delay={100}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Camera className="w-3.5 h-3.5 text-[#ffbe33]" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#ffbe33]">
                Visual Showcase
              </span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <h1
              className="text-4xl sm:text-6xl font-bold text-white tracking-tight drop-shadow-md"
              style={{ fontFamily: "var(--font-cursive), cursive" }}
            >
              The Culinary Gallery
            </h1>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={300}>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
              Immerse yourself in our world of wood-fired creations, rare vintages, and warm artisanal atmosphere captured through the lens.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <main className="flex-1 py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Interactive Filterable Gallery Client Component */}
        <RevealOnScroll direction="up" delay={200}>
          <GalleryClientView items={galleryItems} />
        </RevealOnScroll>
      </main>

      <Footer />
    </div>
  );
}
