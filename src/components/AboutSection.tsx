import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ChefHat, Heart, Award, Flame } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export default function AboutSection() {
  return (
    <section className="relative py-24 px-6 sm:px-8 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 -left-40 -translate-y-1/2 w-96 h-96 bg-[#ffbe33]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-[#e60000]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Col: Visual Showcase & Badges */}
        <RevealOnScroll direction="left" duration={800} className="lg:col-span-6">
          <div className="relative mx-auto max-w-[500px] lg:max-w-none">
            {/* Primary Main Image */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
              <Image
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop"
                alt="Calvary Artisanal Restaurant Ambiance"
                fill
                className="object-cover brightness-90 hover:brightness-100 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-transparent to-transparent opacity-80" />
            </div>

            {/* Overlapping Secondary Card (Chef In Action) */}
            <div className="absolute -bottom-8 -right-4 sm:-bottom-10 sm:right-6 w-48 sm:w-60 aspect-square rounded-2xl overflow-hidden border-2 border-[#ffbe33]/40 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-neutral-950">
              <Image
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop"
                alt="Executive Chef Handcrafting Dishes"
                fill
                className="object-cover"
                sizes="240px"
              />
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -top-6 -left-4 sm:left-4 bg-[#12141a]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffbe33] to-[#e6a827] flex items-center justify-center text-neutral-950 font-black shadow-lg">
                <ChefHat className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium">Culinary Heritage</p>
                <p className="text-base font-extrabold text-white tracking-tight">15+ Years Mastery</p>
              </div>
            </div>

            {/* Award badge — new! */}
            <div className="absolute bottom-2 left-2 sm:-left-6 bg-[#12141a]/90 backdrop-blur-xl border border-[#ffbe33]/30 rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ffbe33]/15 text-[#ffbe33] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 font-medium">Rated</p>
                <p className="text-sm font-extrabold text-[#ffbe33] tracking-tight">Best Dining 2024</p>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Right Col: Story & Core Values */}
        <RevealOnScroll direction="right" delay={150} duration={800} className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#ffbe33]" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#ffbe33]">
                Our Philosophy &amp; Heritage
              </span>
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]"
              style={{ fontFamily: "var(--font-cursive), cursive" }}
            >
              Where Passion Meets Artisanal Gastronomy
            </h2>
          </div>

          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
            Founded with an uncompromising passion for culinary craft, <strong className="text-white font-semibold">Calvary</strong> reimagines traditional dining into an elevated modern experience. We believe that every dish tells a story — woven from farm-to-table organic produce, secret generational spices, and contemporary master plating.
          </p>

          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Whether it&apos;s a signature artisanal pizza blistered to perfection in our custom wood-fired oven, or an intimate multi-course chef tasting paired with bespoke cocktails, our mission remains steadfast: crafting memories you will savor long after the last bite.
          </p>

          {/* Pillars Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#ffbe33]/30 hover:bg-white/[0.05] transition-all duration-300 group">
              <div className="w-8 h-8 rounded-lg bg-[#ffbe33]/15 text-[#ffbe33] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Wood-Fired &amp; Fresh</h4>
              <p className="text-xs text-neutral-400">Authentic slow cooking with zero artificial additives.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#e60000]/30 hover:bg-white/[0.05] transition-all duration-300 group">
              <div className="w-8 h-8 rounded-lg bg-[#e60000]/15 text-[#e60000] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Ethical Sourcing</h4>
              <p className="text-xs text-neutral-400">100% sustainably sourced greens, meats &amp; dairy.</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link href="/about-us">
              <InteractiveHoverButton className="bg-white/5 hover:bg-white/10 border-white/15 py-3 px-6 text-white hover:border-[#ffbe33]">
                Explore Full Story
              </InteractiveHoverButton>
            </Link>

            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#ffbe33] hover:bg-[#e6a827] text-neutral-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#ffbe33]/25 transition-all duration-200 group"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
