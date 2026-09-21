import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MenuClientCatalog from "@/components/MenuClientCatalog";
import { getMenuItems, getMenuCategories } from "@/lib/db-server";
import { getCurrentUser } from "@/lib/auth-server";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export const metadata = {
  title: "A La Carte Menu | Calvary Fine Dining",
  description:
    "Explore our handcrafted culinary collection divided by categories. Interactive search, veg and non-veg specialties, and seasonal chef features.",
};

export default async function MenuPage() {
  const [items, categories, authData] = await Promise.all([
    getMenuItems().catch(() => []),
    getMenuCategories().catch(() => []),
    getCurrentUser().catch(() => null),
  ]);

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white flex flex-col selection:bg-[#ffbe33] selection:text-neutral-950">
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

      {/* Hero Header without Parallax */}
      <div className="relative overflow-hidden border-b border-white/10 pt-16 pb-12 sm:pt-20 sm:pb-16 bg-[#090b0e]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-[#ffbe33] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <RevealOnScroll direction="up" duration={600}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbe33] animate-pulse" />
                <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#ffbe33]">
                  A La Carte Selection
                </span>
              </div>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-md"
                style={{ fontFamily: "var(--font-cursive), cursive" }}
              >
                Our Culinary Menu
              </h1>
              <p className="text-neutral-300 text-sm max-w-xl mt-2 leading-relaxed">
                Every dish is prepared fresh to order using artisanal hearth ovens, rare spices, and sustainable local harvests.
              </p>
            </RevealOnScroll>

            {/* Quick stats pill */}
            <RevealOnScroll direction="left" duration={600} delay={100}>
              <div className="flex items-center gap-4 bg-white/10 border border-white/20 px-5 py-3 rounded-2xl backdrop-blur-md shrink-0 shadow-xl">
                <div>
                  <div className="text-xl font-extrabold text-[#ffbe33]">{items.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-300">Total Dishes</div>
                </div>
                <div className="h-8 w-px bg-white/15" />
                <div>
                  <div className="text-xl font-extrabold text-emerald-400">
                    {items.filter((i) => i.is_vegetarian).length}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-300">Pure Veg</div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>

      <main className="flex-1 py-10 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        <RevealOnScroll direction="up" duration={700} delay={150}>
          {/* Categorized Menu Catalog with Search */}
          <MenuClientCatalog items={items} categories={categories} />
        </RevealOnScroll>
      </main>

      <Footer />
    </div>
  );
}