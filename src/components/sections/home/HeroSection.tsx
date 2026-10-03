import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UtensilsCrossed, Star, Award, Users } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ParallaxHeroBg } from "./ParallaxHeroBg";

interface HeroSectionProps {
  settings: any;
}

export default function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#0b0c0f] border-b border-white/10 pt-12 sm:pt-16 pb-16 sm:pb-24 lg:py-32">
      {settings?.cover_image_url ? (
        <ParallaxHeroBg
          src={settings.cover_image_url}
          alt={settings.name || "Restaurant Ambience"}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#12141a] via-[#0b0c0f] to-[#0b0c0f] pointer-events-none" />
      )}

      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#ffbe33]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#e60000]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm animate-fade-in">
            <Star className="w-3.5 h-3.5 text-[#ffbe33] fill-[#ffbe33]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#ffbe33]">
              Award-Winning Fine Dining
            </span>
          </div>

          <div className="space-y-3">
            <h1
              className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight sm:leading-none text-white tracking-tight drop-shadow-lg"
              style={{ fontFamily: "var(--font-cursive), cursive" }}
            >
              Fast Food &amp; Gourmet Dining
            </h1>
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] font-extrabold text-[#ffbe33] drop-shadow">
              CRAFTED WITH OBSESSIVE PASSION &amp; PREMIUM CUTS
            </p>
          </div>

          <p className="text-neutral-200 text-xs sm:text-base leading-relaxed max-w-xl font-normal drop-shadow">
            {settings?.description ||
              "Experience artisan fire-grilled burgers, delicate truffle pastas, and handcrafted desserts crafted fresh with ethically sourced, seasonal ingredients."}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
            <Link href="/menu" className="w-full sm:w-auto">
              <InteractiveHoverButton
                variant="gold"
                className="w-full sm:w-auto py-3.5 px-8 hover:scale-[1.03] active:scale-[0.98] text-center justify-center"
              >
                Explore Menu
              </InteractiveHoverButton>
            </Link>

            <Link
              href="/reserve"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-[60px] bg-black/60 hover:bg-[#ffbe33] text-white hover:text-neutral-950 font-extrabold text-xs uppercase tracking-[0.14em] border border-white/25 hover:border-[#ffbe33] backdrop-blur-md shadow-lg transition-all duration-200 text-center"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Book a Table • Dine In</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 pt-6 border-t border-white/15">
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-white drop-shadow tracking-tight">
                <AnimatedCounter to={15} suffix="+" duration={1600} />
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                Years Mastery
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-white drop-shadow tracking-tight">
                <AnimatedCounter to={100} suffix="%" duration={1800} />
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                Organic Produce
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-[#ffbe33] drop-shadow tracking-tight">
                <AnimatedCounter to={4.9} suffix="★" duration={1400} decimals={1} />
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                Google Rating
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-white drop-shadow tracking-tight">
                <AnimatedCounter to={5000} suffix="+" duration={2000} />
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                Happy Guests
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center items-center relative z-10">
          <div className="absolute w-56 h-56 sm:w-80 sm:h-80 rounded-full bg-[#ffbe33]/20 blur-[60px] pointer-events-none" />

          <div className="relative w-full max-w-[280px] xs:max-w-[340px] sm:max-w-[440px] lg:max-w-[540px] aspect-square">
            <Image
              src="https://ccxaezlmosukvtevnrne.supabase.co/storage/v1/object/public/images/displayAssets/hero.png"
              alt={settings?.name || "Calvary Culinary Hero"}
              fill
              priority
              sizes="(max-width: 640px) 320px, (max-width: 1024px) 440px, 540px"
              className="object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.85)] hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
