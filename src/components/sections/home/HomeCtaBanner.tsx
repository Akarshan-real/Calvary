import React from "react";
import Link from "next/link";
import { UtensilsCrossed, Sparkles, CalendarCheck } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export default function HomeCtaBanner() {
  return (
    <section className="relative overflow-hidden py-20 px-6">
      {/* Background: Bold red with layered depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#cc0000] via-[#e60000] to-[#b30000]" />

      {/* Decorative floating circles */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-8 right-1/3 w-24 h-24 rounded-full bg-[#ffbe33]/20 blur-2xl pointer-events-none" />

      {/* Fork & Knife decorative icons */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block pointer-events-none">
        <UtensilsCrossed className="w-28 h-28 text-white" strokeWidth={0.8} />
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block pointer-events-none rotate-12">
        <UtensilsCrossed className="w-20 h-20 text-white" strokeWidth={0.8} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
        <RevealOnScroll direction="left" duration={700} className="space-y-4 flex-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#ffbe33]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-white/90">
              Planning an intimate evening or private event?
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Reserve Your Signature
            <br />
            <span className="text-[#ffbe33]">Table Today</span>
          </h2>
          <p className="text-sm text-white/85 max-w-lg leading-relaxed">
            Experience bespoke chef tasting menus and priority table booking
            with instant confirmation. Private dining rooms available for
            groups up to 30.
          </p>

          {/* Mini trust indicators */}
          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start pt-2">
            <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
              <CalendarCheck className="w-4 h-4 text-[#ffbe33]" />
              <span>Instant Confirmation</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/40 hidden sm:block" />
            <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
              <UtensilsCrossed className="w-4 h-4 text-[#ffbe33]" />
              <span>Private Chef Available</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/40 hidden sm:block" />
            <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#ffbe33]" />
              <span>Groups up to 30</span>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="right" delay={200} duration={700} className="shrink-0">
          <Link href="/reserve">
            <InteractiveHoverButton className="bg-neutral-950 text-white border-neutral-700 py-4 px-10 shadow-2xl hover:scale-105 active:scale-95 text-base">
              Book Table Now
            </InteractiveHoverButton>
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
