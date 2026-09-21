import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMenuItemById, getMenuItems } from "@/lib/db-server";
import { getCurrentUser } from "@/lib/auth-server";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Flame, AlertCircle, Sparkles, UtensilsCrossed, Heart } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ item: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { item: rawItem } = await params;
  const dish = await getMenuItemById(rawItem);
  if (!dish) return { title: "Dish Not Found | Calvary" };
  return {
    title: `${dish.name} | Calvary Fine Dining`,
    description: dish.description || `Explore detailed ingredients and nutritional information for ${dish.name}.`,
  };
}

export default async function MenuItemPage({ params }: PageProps) {
  const { item: rawItem } = await params;
  const [dish, allItems, authData] = await Promise.all([
    getMenuItemById(rawItem),
    getMenuItems().catch(() => []),
    getCurrentUser().catch(() => null),
  ]);

  if (!dish) {
    notFound();
  }

  const isVeg = dish.is_vegetarian;
  const nutrition = dish.menu_item_nutrition || null;
  const protein = nutrition?.protein_g ?? (isVeg ? 14 : 32);
  const carbs = nutrition?.carbs_g ?? (isVeg ? 48 : 22);
  const fat = nutrition?.fat_g ?? (isVeg ? 12 : 18);
  const fiber = nutrition?.fiber_g ?? (isVeg ? 6 : 2);
  const calories = nutrition?.calories ?? (isVeg ? 340 : 480);
  const allergens: string[] = nutrition?.allergens ?? [];
  const displayImageUrl = dish.image_url || dish.media_assets?.public_url || null;

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

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 sm:py-16">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-[#ffbe33] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Full Menu</span>
          </Link>
        </div>

        {/* Dish Showcase Card */}
        <div className="bg-[#141722] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-10">
            {/* Visual Hero */}
            <div className="md:col-span-6 flex justify-center">
              <div className="relative w-full aspect-square max-w-[380px] rounded-2xl overflow-hidden bg-[#0c0e14] border border-white/10 shadow-inner">
                {displayImageUrl ? (
                  <Image
                    src={displayImageUrl}
                    alt={dish.name}
                    fill
                    priority
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1b1f2e] to-[#0c0e14] text-neutral-400 gap-3">
                    <span className="text-6xl">🍽️</span>
                    <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                      Authentic Culinary Creation
                    </span>
                  </div>
                )}

                {/* Dietary Badge */}
                <div className="absolute top-4 left-4">
                  {isVeg ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/70 backdrop-blur-md border border-emerald-500/40 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Pure Veg
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/70 backdrop-blur-md border border-red-500/40 text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Non-Veg
                    </span>
                  )}
                </div>

                {/* Calorie Chip */}
                <div className="absolute bottom-4 right-4">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-black/70 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
                    <Flame className="w-3.5 h-3.5 text-[#ffbe33]" />
                    {calories} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Info & Details */}
            <div className="md:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#ffbe33]">
                  Artisanal Dish
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                  {dish.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#a3f900]">
                    ₹{Number(dish.price).toLocaleString("en-IN")}
                  </span>
                  {(dish.portion_size || dish.quantity) && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm backdrop-blur-sm">
                      <span>⚖️</span>
                      <span className="text-neutral-400 font-normal">Portion:</span>
                      <span>{dish.portion_size || dish.quantity}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                {dish.description ||
                  "Handcrafted fresh to order using finest artisanal seasonings, certified organic produce, and craft culinary techniques."}
              </p>

              {/* Allergen Advisory */}
              {allergens && allergens.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    Allergen Advisory:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((alg) => (
                      <span
                        key={alg}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-neutral-300"
                      >
                        {alg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete Nutritional Breakdown */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                  Nutritional Breakdown (Per Serving)
                </span>
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <div className="text-[10px] uppercase font-bold text-[#ff2d55]">Protein</div>
                    <div className="text-sm font-black text-white mt-0.5">{protein}g</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <div className="text-[10px] uppercase font-bold text-[#a3f900]">Carbs</div>
                    <div className="text-sm font-black text-white mt-0.5">{carbs}g</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <div className="text-[10px] uppercase font-bold text-[#04c7dd]">Fats</div>
                    <div className="text-sm font-black text-white mt-0.5">{fat}g</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <div className="text-[10px] uppercase font-bold text-[#ffbe33]">Fiber</div>
                    <div className="text-sm font-black text-white mt-0.5">{fiber}g</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}