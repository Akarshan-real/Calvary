"use client";

import React, { useState, useMemo, useEffect } from "react";
import FoodCard, { FoodItem } from "@/components/FoodCard";
import { HighlightGrid } from "@/components/ui/highlight-grid";
import { Search, X, Filter, Utensils, Heart } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description?: string | null;
  display_order?: number;
}

interface MenuClientCatalogProps {
  items: FoodItem[];
  categories: Category[];
}

const FOOD_ACCENT_COLORS = [
  "rgba(255, 190, 51, 0.45)", // Saffron gold
  "rgba(239, 68, 68, 0.45)",  // Tandoori crimson
  "rgba(34, 197, 94, 0.45)",  // Fresh mint
  "rgba(249, 115, 22, 0.45)", // Spicy orange
  "rgba(14, 165, 233, 0.40)", // Royal cyan
  "rgba(234, 179, 8, 0.45)",  // Turmeric gold
  "rgba(236, 72, 153, 0.40)", // Kashmiri rose
];

export default function MenuClientCatalog({
  items,
  categories,
}: MenuClientCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | "all" | "favorites">("all");
  const [selectedDiet, setSelectedDiet] = useState<"all" | "veg" | "non-veg">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string | number>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("feane_favorites");
      if (saved) {
        setFavoriteIds(new Set(JSON.parse(saved)));
      }
    } catch {}
  }, []);

  // Toggle favorite dish
  const toggleFavorite = (id: string | number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem("feane_favorites", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Filtered dishes
  const filteredItems = useMemo(() => {
    return items.filter((dish) => {
      // Category filter or Favorites filter
      if (selectedCategory === "favorites") {
        if (!favoriteIds.has(dish.id)) return false;
      } else if (selectedCategory !== "all" && dish.category_id !== selectedCategory) {
        return false;
      }

      // Veg / Non-Veg filter
      if (selectedDiet === "veg" && !dish.is_vegetarian) return false;
      if (selectedDiet === "non-veg" && dish.is_vegetarian) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(query);
        const matchesDesc = dish.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [items, selectedCategory, selectedDiet, searchQuery, favoriteIds]);

  // Group items by category for divided display
  const categorizedSections = useMemo(() => {
    if (selectedCategory === "favorites") {
      return [
        {
          category: {
            id: -1,
            name: "Your Favourites",
            description: "Handpicked dishes you saved for instant access",
          },
          dishes: filteredItems,
        },
      ].filter((sec) => sec.dishes.length > 0);
    }

    const activeCats =
      selectedCategory === "all"
        ? categories
        : categories.filter((c) => c.id === selectedCategory);

    return activeCats
      .map((cat) => {
        const catDishes = filteredItems.filter((item) => item.category_id === cat.id);
        return {
          category: cat,
          dishes: catDishes,
        };
      })
      .filter((sec) => sec.dishes.length > 0);
  }, [categories, filteredItems, selectedCategory]);

  // Uncategorized items (if any category_id didn't match)
  const uncategorizedItems = useMemo(() => {
    if (selectedCategory === "favorites") return [];
    const knownCatIds = new Set(categories.map((c) => c.id));
    return filteredItems.filter((i) => !i.category_id || !knownCatIds.has(i.category_id));
  }, [filteredItems, categories, selectedCategory]);

  return (
    <div className="space-y-12">
      {/* ======================================================== */}
      {/* 1. FILTER STRIP: NORMAL SEARCH & DIETARY PILLS */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-[#12141c] border border-white/10 p-5 sm:p-6 rounded-3xl shadow-xl">
        {/* Left: Normal sleek search input with clearly visible grey placeholder */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-400 shrink-0">
            <Filter className="w-4 h-4 text-[#ffbe33]" />
            <span>Search Dishes:</span>
          </div>

          <div className="relative w-full sm:w-80 md:w-96 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#ffbe33] transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search curries, biryani, starters, desserts..."
              className="w-full bg-[#141722] border border-white/20 focus:border-[#ffbe33] rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-400 placeholder:text-neutral-400 outline-none transition-all shadow-inner focus:ring-2 focus:ring-[#ffbe33]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 shrink-0 cursor-pointer"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Right: Pure Veg vs Non-Veg Toggle Filter */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedDiet("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedDiet === "all"
                ? "bg-white/15 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            All Dishes
          </button>
          <button
            type="button"
            onClick={() => setSelectedDiet("veg")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedDiet === "veg"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-neutral-400 hover:text-emerald-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Pure Veg
          </button>
          <button
            type="button"
            onClick={() => setSelectedDiet("non-veg")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedDiet === "non-veg"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "text-neutral-400 hover:text-red-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Non-Veg
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CATEGORY HIGHLIGHT FILTER BUTTONS + FAVOURITES TO THE RIGHT */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: Scrollable Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#ffbe33] text-neutral-950 border-[#ffbe33] shadow-md shadow-[#ffbe33]/20"
                : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
            }`}
          >
            All Categories ({items.length})
          </button>

          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-[#ffbe33] text-neutral-950 border-[#ffbe33] shadow-md shadow-[#ffbe33]/20"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Right: Favourites Filter Button */}
        <button
          type="button"
          onClick={() =>
            setSelectedCategory(selectedCategory === "favorites" ? "all" : "favorites")
          }
          className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-2 shrink-0 cursor-pointer shadow-sm ${
            selectedCategory === "favorites"
              ? "bg-red-500/25 text-red-400 border-red-500/60 shadow-md shadow-red-500/20 ring-1 ring-red-500/40"
              : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-red-400"
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform cursor-pointer ${
              selectedCategory === "favorites" || favoriteIds.size > 0
                ? "fill-red-500 text-red-500"
                : "text-neutral-400"
            }`}
          />
          <span>Favourites ({favoriteIds.size})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. CATEGORIZED MENU SECTIONS WITH HIGHLIGHT GRID */}
      {/* ======================================================== */}
      <div className="space-y-14">
        {categorizedSections.map(({ category, dishes }) => (
          <section key={category.id} className="space-y-6">
            {/* Category Header */}
            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffbe33]" />
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {category.name}
                  </h2>
                </div>
                {category.description && (
                  <p className="text-xs text-neutral-400 max-w-xl">
                    {category.description}
                  </p>
                )}
              </div>

              <span className="text-xs font-bold text-neutral-400">
                {dishes.length} {dishes.length === 1 ? "dish" : "dishes"}
              </span>
            </div>

            {/* Food Cards inside HighlightGrid */}
            <HighlightGrid
              items={dishes.map((dish, idx) => ({
                color: FOOD_ACCENT_COLORS[idx % FOOD_ACCENT_COLORS.length],
                content: (
                  <FoodCard
                    key={dish.id}
                    item={dish}
                    isFavorite={favoriteIds.has(dish.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ),
              }))}
              colors={FOOD_ACCENT_COLORS}
              highlightFirst={false}
            />
          </section>
        ))}

        {/* Uncategorized section fallback if any */}
        {uncategorizedItems.length > 0 && selectedCategory === "all" && (
          <section className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Specialties & Chef Creations
              </h2>
            </div>
            <HighlightGrid
              items={uncategorizedItems.map((dish, idx) => ({
                color: FOOD_ACCENT_COLORS[idx % FOOD_ACCENT_COLORS.length],
                content: (
                  <FoodCard
                    key={dish.id}
                    item={dish}
                    isFavorite={favoriteIds.has(dish.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ),
              }))}
              colors={FOOD_ACCENT_COLORS}
              highlightFirst={false}
            />
          </section>
        )}

        {/* Empty State: Favourites */}
        {selectedCategory === "favorites" && filteredItems.length === 0 && (
          <div className="text-center py-20 bg-[#141722] rounded-3xl border border-white/10 text-neutral-400 space-y-3">
            <Heart className="w-12 h-12 mx-auto text-red-500/40 animate-pulse" />
            <p className="text-base font-semibold text-white">No favourite dishes yet.</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Click the heart icon on any food card to save dishes to your favourites list.
            </p>
          </div>
        )}

        {/* Empty State: Normal Search / Filter */}
        {selectedCategory !== "favorites" && filteredItems.length === 0 && (
          <div className="text-center py-20 bg-[#141722] rounded-3xl border border-white/10 text-neutral-400 space-y-3">
            <Utensils className="w-12 h-12 mx-auto text-white/20" />
            <p className="text-base font-semibold text-white">No dishes match your filter.</p>
            <p className="text-xs text-neutral-400">
              Try adjusting your search keywords or dietary selection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
