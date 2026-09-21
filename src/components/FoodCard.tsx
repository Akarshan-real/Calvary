"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Flame, AlertCircle, ArrowUpRight } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Extracts clean weight (e.g., "250g", "160g", "350ml") from verbose portion strings
 * such as "250g / Serves 1-2" or "4 Pieces / 160g"
 */
function extractWeightPortion(raw?: string | null): string | null {
  if (!raw) return null;
  const str = raw.trim();

  // Match pattern like 250g, 450ml, 1.5kg, 350 ml
  const weightMatch = str.match(/(\d+(?:\.\d+)?\s*(?:g|gm|gms|gram|grams|ml|l|kg))\b/i);
  if (weightMatch) {
    return weightMatch[1].replace(/\s+/g, "").toLowerCase();
  }

  // If pieces or slices (e.g., "2 Pieces", "4 Slices")
  const pcsMatch = str.match(/(\d+\s*(?:pcs|pieces|slices|pc))\b/i);
  if (pcsMatch) {
    return pcsMatch[1].toLowerCase();
  }

  // If generic "Standard Chef Serving" or similar long text, omit to keep card minimal
  if (str.toLowerCase().includes("standard") || str.toLowerCase().includes("chef")) {
    return null;
  }

  return str.split("/")[0].trim();
}

export interface FoodItem {
  id: string | number;
  category_id?: number | null;
  name: string;
  description?: string | null;
  price: number;
  portion_size?: string | null;
  quantity?: string | null;
  image_url?: string | null;
  is_vegetarian?: boolean;
  food_type?: "veg" | "non-veg" | "vegan";
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  fiber_g?: number | null;
  allergens?: string[] | null;
  media_assets?: {
    public_url: string;
    alt_text?: string | null;
  } | null;
  menu_item_nutrition?: {
    calories?: number | null;
    protein_g?: number | null;
    carbs_g?: number | null;
    fat_g?: number | null;
    fiber_g?: number | null;
    allergens?: string[] | null;
  } | null;
}

interface FoodCardProps {
  item: FoodItem;
  className?: string;
  containerClassName?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string | number) => void;
}

export default function FoodCard({
  item,
  className,
  containerClassName,
  isFavorite,
  onToggleFavorite,
}: FoodCardProps) {
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const isLiked = isFavorite !== undefined ? isFavorite : localIsLiked;

  // Determine food classification
  const isVeg =
    item.food_type === "veg" ||
    (item.food_type === undefined && item.is_vegetarian === true);
  const isVegan = item.food_type === "vegan";

  // Resolved image url
  const displayImageUrl = item.image_url || item.media_assets?.public_url || null;

  // Resolved nutrition data
  const nutrition = item.menu_item_nutrition || {};
  const protein = item.protein_g ?? nutrition.protein_g ?? (isVeg ? 14 : 32);
  const carbs = item.carbs_g ?? nutrition.carbs_g ?? (isVeg ? 48 : 22);
  const fat = item.fat_g ?? nutrition.fat_g ?? (isVeg ? 12 : 18);
  const fiber = item.fiber_g ?? nutrition.fiber_g ?? (isVeg ? 6 : 2);
  const calories = item.calories ?? nutrition.calories ?? (isVeg ? 340 : 480);
  const allergens = item.allergens ?? nutrition.allergens ?? [];

  // Clean, minimal weight string for cards (e.g., "250g", "160g", "380g")
  const displayWeight = extractWeightPortion(item.portion_size || item.quantity);

  // Tooltip content displayed on hover (Desktop)
  const tooltipContent = (
    <div className="space-y-3.5 text-left w-full">
      {/* Header: Title & Calories */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#ffbe33] shrink-0" />
          <span className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
            {item.name}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black text-[#ffbe33] bg-[#ffbe33]/15 border border-[#ffbe33]/30 shrink-0">
          <Flame className="w-3.5 h-3.5 text-[#ffbe33]" aria-hidden="true" />
          {calories} kcal
        </span>
      </div>

      {/* Description */}
      <div>
        <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed line-clamp-3">
          {item.description ||
            "Prepared fresh to order using finest artisanal seasonings and craft culinary techniques."}
        </p>
      </div>

      {/* Portion Size Info Pill in Tooltip */}
      {(item.portion_size || item.quantity) && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-amber-300/80 font-bold">Portion Size</span>
          </div>
          <span className="text-xs font-extrabold text-amber-200">
            {item.portion_size || item.quantity}
          </span>
        </div>
      )}

      {/* Macronutrient Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#ff2d55]">Protein</div>
          <div className="text-sm sm:text-base font-black text-white mt-0.5">{protein}g</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#a3f900]">Carbs</div>
          <div className="text-sm sm:text-base font-black text-white mt-0.5">{carbs}g</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#04c7dd]">Fats</div>
          <div className="text-sm sm:text-base font-black text-white mt-0.5">{fat}g</div>
        </div>
      </div>

      {/* Dietary & Allergens footer */}
      <div className="pt-1.5 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-[10px]">
        <span className="text-neutral-400 font-semibold flex items-center gap-1">
          <span>Dietary:</span>
          <span className={isVeg ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
            {isVegan ? "Vegan" : isVeg ? "Pure Vegetarian" : "Non-Vegetarian"}
          </span>
        </span>

        {allergens && allergens.length > 0 ? (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-neutral-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-400" aria-hidden="true" />
              Allergens:
            </span>
            {allergens.map((alg) => (
              <span
                key={alg}
                className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/10 border border-white/10 text-neutral-300"
              >
                {alg}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-neutral-500 italic">No common allergens</span>
        )}
      </div>
    </div>
  );

  return (
    <Tooltip
      content={tooltipContent}
      containerClassName={cn("w-full h-full flex flex-col", containerClassName)}
    >
      <div
        className={cn(
          "group relative flex flex-col justify-between rounded-2xl select-none overflow-hidden h-full w-full",
          "bg-gradient-to-b from-[#181c28]/95 via-[#12141e]/95 to-[#0e1017]/95 backdrop-blur-md",
          "border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.35)]",
          "hover:border-[#ffbe33]/40 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] transition-all duration-300",
          className
        )}
      >
        {/* ======================================================== */}
        {/* 1. TOP: COMPACT IMAGE BANNER WITH OVERLAYS */}
        {/* ======================================================== */}
        <div className="relative w-full h-32 sm:h-36 bg-[#0c0e14] overflow-hidden">
          {displayImageUrl ? (
            <Image
              src={displayImageUrl}
              alt={item.name}
              fill
              className="object-cover object-center brightness-95"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1b1f2e] to-[#0c0e14] text-neutral-400 gap-1">
              <span className="text-2xl drop-shadow">🍽️</span>
              <span className="text-[9px] font-semibold tracking-wider uppercase text-neutral-400">
                Authentic Dish
              </span>
            </div>
          )}

          {/* Luxury vignette gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141e] via-transparent to-black/40 pointer-events-none" />

          {/* Top Floating Food Type Pill & Heart button */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
            {/* Food Type Pill (Top Left) */}
            <div className="shadow-md">
              {isVegan ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md border border-emerald-500/40 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Vegan
                </span>
              ) : isVeg ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md border border-emerald-500/40 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Veg
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md border border-red-500/40 text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Non-Veg
                </span>
              )}
            </div>

            {/* Heart / Favorite Button (Top Right) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const nextLiked = !isLiked;
                if (onToggleFavorite) {
                  onToggleFavorite(item.id);
                } else {
                  setLocalIsLiked(nextLiked);
                }
                if (nextLiked) {
                  toast.success(`Saved to Favorites`, {
                    description: `${item.name} has been added to your favorites list.`,
                  });
                } else {
                  toast.info(`Removed from Favorites`, {
                    description: `${item.name} has been removed from favorites.`,
                  });
                }
              }}
              aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
              className={cn(
                "w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition-all duration-200 shadow-lg backdrop-blur-md cursor-pointer",
                "bg-black/60 border border-white/20 hover:scale-110 active:scale-95",
                isLiked ? "text-red-500 border-red-500/40 bg-black/80" : "text-white/80 hover:text-red-400"
              )}
            >
              <Heart
                className="w-3.5 h-3.5 transition-transform cursor-pointer"
                fill={isLiked ? "#ef4444" : "transparent"}
                strokeWidth={isLiked ? 2.5 : 2}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Bottom Weight badge over image if available */}
          {displayWeight && (
            <div className="absolute bottom-2 right-2.5 z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-black/80 backdrop-blur-md border border-white/15 text-neutral-300 shadow-sm">
                {displayWeight}
              </span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 2. MIDDLE AREA: CLEAN BALANCED TITLE */}
        {/* ======================================================== */}
        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
          <div className="text-center">
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug line-clamp-1 group-hover:text-[#ffbe33] transition-colors duration-200">
              {item.name}
            </h3>
          </div>

          {/* ======================================================== */}
          {/* 3. BOTTOM BAR: PRICE & LUXURY DETAILS BUTTON */}
          {/* ======================================================== */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                Price
              </span>
              <span className="font-black text-base sm:text-lg text-[#a3f900] tracking-tight">
                ₹{Number(item.price).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Dedicated Details Button */}
            <Link
              href={`/menu/${item.id}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/5 hover:bg-[#ffbe33] hover:text-neutral-950 border border-white/15 hover:border-[#ffbe33] px-3 py-1 rounded-lg active:scale-95 transition-all duration-200 shadow-sm group/btn"
            >
              <span>Details</span>
              <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover/btn:text-neutral-950 transition-colors" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
