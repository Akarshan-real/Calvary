"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Utensils, GlassWater, Building2, Flame, Maximize2, X } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import type { GalleryItem } from "@/app/actions/gallery";
import galleryData from "@/data/gallery.json";

const defaultItems: GalleryItem[] = galleryData as GalleryItem[];

const categories = [
  { key: "all", label: "All Moments", icon: Sparkles },
  { key: "dishes", label: "Culinary Dishes", icon: Utensils },
  { key: "ambiance", label: "Atmosphere", icon: Building2 },
  { key: "cocktails", label: "Mixology & Cellar", icon: GlassWater },
  { key: "kitchen", label: "The Kitchen Craft", icon: Flame },
];

export default function GalleryClientView({ items = defaultItems }: { items?: GalleryItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <div className="space-y-10">
      {/* Category Pills Filter */}
      <RevealOnScroll direction="up" duration={600}>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? "bg-[#ffbe33] text-neutral-950 shadow-lg shadow-[#ffbe33]/25 scale-105"
                    : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:scale-105"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </RevealOnScroll>

      {/* Masonry-Style Responsive Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredItems.map((item, index) => (
          <RevealOnScroll
            key={item.id}
            direction="up"
            delay={Math.min(index * 60, 400)}
            duration={600}
            threshold={0.05}
          >
            <div
              onClick={() => setActiveModalItem(item)}
              className="group relative break-inside-avoid rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 cursor-pointer shadow-xl hover:border-[#ffbe33]/40 hover:-translate-y-1 transition-all duration-500"
            >
              <div className={`relative w-full ${item.aspect} overflow-hidden`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              </div>

              {/* Overlay Info Card */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#ffbe33] bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 inline-block">
                    {item.tag}
                  </span>
                  <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                    {item.title}
                  </h4>
                </div>

                <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110 duration-300 shrink-0">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeModalItem && (
        <div
          onClick={() => setActiveModalItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] rounded-3xl overflow-hidden bg-[#12141a] border border-white/20 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full h-[60vh] bg-black">
              <Image
                src={activeModalItem.image}
                alt={activeModalItem.title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            <div className="p-6 bg-[#12141a] border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-[#ffbe33] tracking-widest block mb-1">
                  {activeModalItem.tag}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {activeModalItem.title}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
