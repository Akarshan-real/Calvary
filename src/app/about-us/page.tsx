import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-server";
import {
  Sparkles,
  Utensils,
  ArrowRight,
} from "lucide-react";
import { MorphingText } from "@/components/ui/morphing-text";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

import { ParallaxHeroBg } from "@/components/sections/home/ParallaxHeroBg";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export const metadata = {
  title: "About Us | Calvary Artisanal Cuisine & Bar",
  description:
    "Discover the story, culinary masters, philosophy, and craft behind Calvary. Where gastronomy meets soul.",
};

export default async function AboutPage() {
  const authData = await getCurrentUser().catch(() => null);

  const milestones = [
    { year: "2011", title: "The Humble Spark", desc: "A cozy 6-table brick-and-mortar bistro born in the heart of the culinary district." },
    { year: "2016", title: "The Woodfire Revolution", desc: "Imported our custom-built volcanic stone hearth oven for authentic artisanal baking." },
    { year: "2020", title: "Farm-to-Table Accord", desc: "Forged direct partnerships with over 20 certified local sustainable organic farms." },
    { year: "2024", title: "Culinary Excellence Award", desc: "Recognized as the premier destination for modern artisanal fusion & guest hospitality." },
  ];

  const team = [
    {
      name: "Marco Valentino",
      role: "Executive Head Chef",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop",
      bio: "Trained in Naples and Lyon, Chef Marco blends traditional European gastronomy with bold contemporary textures.",
    },
    {
      name: "Elena Rostova",
      role: "Pastry & Dessert Alchemist",
      image: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=800&auto=format&fit=crop",
      bio: "Crafting delicate, visually mesmerizing confections inspired by natural botanicals and slow-churned heritage creams.",
    },
    {
      name: "Julian Chen",
      role: "Master Sommelier & Mixologist",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      bio: "Curating our rare vintage cellar and infusing signature botanical cordials designed to pair impeccably with every course.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b0e] text-white flex flex-col selection:bg-[#ffbe33] selection:text-neutral-950">
      {/* Dynamic Navbar */}
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

      <main className="flex-1 space-y-24 sm:space-y-32 pb-24">
        {/* ============================================================ */}
        {/* HERO SECTION WITH PARALLAX BACKGROUND */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden pt-24 sm:pt-32 pb-20 px-6 sm:px-8 border-b border-white/10">
          <ParallaxHeroBg
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop"
            alt="Calvary Dining Hall"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-[#090b0e]" />

          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#ffbe33]/15 via-[#e60000]/10 to-transparent rounded-full blur-[160px] pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-3xl mx-auto text-center">
            <RevealOnScroll direction="up" duration={600}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#ffbe33]" />
                <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#ffbe33]">
                  Our Culinary Odyssey
                </span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" duration={700} delay={100}>
              <h1
                className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] drop-shadow-lg"
                style={{ fontFamily: "var(--font-cursive), cursive" }}
              >
                Crafted with Soul, Served with Distinction
              </h1>
            </RevealOnScroll>

            <RevealOnScroll direction="up" duration={800} delay={200}>
              <p className="text-neutral-200 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto drop-shadow">
                At <strong className="text-white font-semibold">Calvary</strong>, we view dining not merely as a meal, but as an art form — an intimate celebration of flavor, artistry, and communal human connection.
              </p>
              <p className="text-base text-neutral-300 leading-relaxed font-light mt-3 drop-shadow">
                Founded on the belief that extraordinary gastronomy demands uncompromising dedication to quality, our kitchen harmonizes time-honored artisanal culinary techniques with progressive, boundary-pushing creativity.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* ============================================================ */}
        {/* TIMELINE / HISTORY */}
        {/* ============================================================ */}
        <section className="px-6 sm:px-8 max-w-7xl mx-auto w-full">
          <RevealOnScroll direction="up" duration={600}>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#ffbe33]">
                Chronology
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Our Journey Over the Decades
              </h2>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, idx) => (
              <RevealOnScroll key={m.year} direction="up" duration={600} delay={idx * 120}>
                <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#ffbe33]/40 transition-all flex flex-col justify-between h-full shadow-lg">
                  <div>
                    <span className="text-3xl font-black text-[#ffbe33] tracking-tight block mb-2 font-mono">
                      {m.year}
                    </span>
                    <h4 className="text-lg font-bold text-white mb-2">{m.title}</h4>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">{m.desc}</p>
                  </div>
                  <div className="mt-6 w-full h-1 rounded-full bg-gradient-to-r from-[#ffbe33] to-transparent opacity-40" />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* MEET THE CULINARY ARTISTS */}
        {/* ============================================================ */}
        <section className="px-6 sm:px-8 max-w-7xl mx-auto w-full">
          <RevealOnScroll direction="up" duration={600}>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#ffbe33]">
                The Masters Behind The Stove
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Meet Our Culinary Leadership
              </h2>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((chef, idx) => (
              <RevealOnScroll key={chef.name} direction="up" duration={700} delay={idx * 150}>
                <div className="group rounded-3xl overflow-hidden bg-[#12141a]/90 border border-white/10 hover:border-[#ffbe33]/40 transition-all shadow-xl h-full flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={chef.image}
                      alt={chef.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-[#ffbe33]">
                        {chef.role}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">{chef.name}</h3>
                      <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed pt-1">
                        {chef.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* OUR ETHOS - MORPHING TEXT SHOWCASE */}
        {/* ============================================================ */}
        <section className="px-6 sm:px-8 max-w-5xl mx-auto w-full text-center py-6">
          <RevealOnScroll direction="up" duration={700}>
            <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 p-8 sm:p-14 overflow-hidden shadow-2xl">
              {/* Ambient gold glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-[#ffbe33]/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative space-y-4">
                <span className="text-xs uppercase tracking-[0.3em] font-extrabold text-[#ffbe33]">
                  Driven By Passion &amp; Purpose
                </span>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  The Essence of Calvary Dining
                </h3>

                <div className="py-6 sm:py-10 flex items-center justify-center">
                  <MorphingText
                    texts={[
                      "PASSION",
                      "ARTISTRY",
                      "TRADITION",
                      "INNOVATION",
                      "EXCELLENCE",
                      "COMMUNITY",
                    ]}
                    className="text-[#ffbe33] font-black uppercase tracking-wider drop-shadow-[0_0_25px_rgba(255,190,51,0.35)]"
                  />
                </div>

                <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  Every recipe is an evolving story of heritage recipes harmonized with modern culinary technique.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ============================================================ */}
        {/* INVITATION CALL TO ACTION */}
        {/* ============================================================ */}
        <section className="px-6 sm:px-8 max-w-5xl mx-auto w-full">
          <RevealOnScroll direction="up" duration={700}>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#12141a] via-[#1a1714] to-[#12141a] border border-[#ffbe33]/30 p-10 sm:p-14 text-center space-y-6 shadow-2xl">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ffbe33]/20 text-[#ffbe33] mx-auto">
                <Utensils className="w-7 h-7 stroke-[2]" />
              </div>

              <h2
                className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-cursive), cursive" }}
              >
                We Invite You to Taste The Difference
              </h2>

              <p className="text-neutral-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Whether reserving a table for two or inquiring for a private celebration, our doors and kitchen are open for you.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Link href="/reserve">
                  <InteractiveHoverButton variant="gold" className="py-3.5 px-8">
                    Book Your Table
                  </InteractiveHoverButton>
                </Link>

                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  <span>Browse Menu</span>
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}