import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HighlightGrid } from "@/components/ui/highlight-grid";
import FoodCard, { type FoodItem } from "@/components/FoodCard";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

interface FeaturedDishesSectionProps {
  items: FoodItem[];
}

export default function FeaturedDishesSection({ items }: FeaturedDishesSectionProps) {
  return (
    <section className="py-20 px-6 sm:px-8 max-w-7xl mx-auto w-full">
      <RevealOnScroll direction="up" duration={700}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e60000] animate-pulse" />
              <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#ffbe33]">
                Handcrafted Creations
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-cursive), cursive" }}
            >
              Signature Highlights
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-lg">
              Our chef's top 5 handpicked specialties. Hover over any card for instant nutritional insights.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-extrabold text-[#ffbe33] hover:text-white transition-colors group"
          >
            <span>View Full Menu ({items.length} dishes)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </RevealOnScroll>

      <RevealOnScroll direction="up" delay={150} duration={800}>
        {/* Featured Dishes HighlightGrid (Limited to exactly 5 items) */}
        <HighlightGrid
          items={items.slice(0, 5).map((dish, idx) => ({
            color: [
              "rgba(255, 190, 51, 0.45)",
              "rgba(239, 68, 68, 0.45)",
              "rgba(34, 197, 94, 0.45)",
              "rgba(249, 115, 22, 0.45)",
              "rgba(14, 165, 233, 0.40)",
            ][idx % 5],
            content: <FoodCard key={dish.id} item={dish} />,
          }))}
          columnsClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          highlightFirst={false}
        />
      </RevealOnScroll>
    </section>
  );
}
