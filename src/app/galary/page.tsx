import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryClientView from "./GalleryClientView";
import { getCurrentUser } from "@/app/actions/auth";
import { getGalleryItems } from "@/app/actions/gallery";
import { Sparkles, Camera } from "lucide-react";

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

      <main className="flex-1 py-16 sm:py-24 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Gallery Hero Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Camera className="w-3.5 h-3.5 text-[#ffbe33]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#ffbe33]">
              Visual Showcase
            </span>
          </div>

          <h1
            className="text-4xl sm:text-6xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-cursive), cursive" }}
          >
            The Culinary Gallery
          </h1>

          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Immerse yourself in our world of wood-fired creations, rare vintages, and warm artisanal atmosphere captured through the lens.
          </p>
        </div>

        {/* Interactive Filterable Gallery Client Component */}
        <GalleryClientView items={galleryItems} />
      </main>

      <Footer />
    </div>
  );
}
