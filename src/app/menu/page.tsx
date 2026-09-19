import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MenuClientCatalog from "@/components/MenuClientCatalog";
import { getMenuItems, getMenuCategories } from "@/app/actions/restaurant";
import { getCurrentUser } from "@/app/actions/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-[#0b0c0f] text-white flex flex-col selection:bg-[#e60000] selection:text-white">
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

      <main className="flex-1 py-14 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Header Strip */}
        <div className="mb-10 border-b border-white/10 pb-8 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-[#ffbe33] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e60000]" />
                <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#ffbe33]">
                  A La Carte Selection
                </span>
              </div>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-cursive), cursive" }}
              >
                Our Culinary Menu
              </h1>
              <p className="text-neutral-400 text-sm max-w-xl mt-2">
                Every dish is prepared fresh to order. Browse through categories or search by dish name below.
              </p>
            </div>

            {/* Quick stats pill */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md shrink-0">
              <div>
                <div className="text-xl font-extrabold text-[#ffbe33]">{items.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400">Total Dishes</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-xl font-extrabold text-emerald-400">
                  {items.filter((i) => i.is_vegetarian).length}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400">Pure Veg</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categorized Menu Catalog with Gooey Search */}
        <MenuClientCatalog items={items} categories={categories} />
      </main>

      <Footer />
    </div>
  );
}