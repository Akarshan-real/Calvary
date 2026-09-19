"use client";

import React from "react";
import { Globe } from "@/components/ui/globe";
import { Compass, Sparkles, MapPin, Utensils } from "lucide-react";
import type { COBEOptions } from "cobe";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

import globalRootsData from "@/data/global-roots.json";

interface Place {
  name: string;
  flag: string;
  coords: [number, number];
  dish: string;
  region: string;
}

const PLACES: Place[] = (globalRootsData as any[]).map((p) => ({
  ...p,
  coords: [p.coords[0], p.coords[1]] as [number, number],
}));

const GLOBE_DARK_CONFIG: COBEOptions = {
  width: 900,
  height: 900,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.25,
  dark: 1,
  diffuse: 1.25,
  mapSamples: 16000,
  mapBrightness: 3,
  baseColor: [0.18, 0.2, 0.25],
  markerColor: [255 / 255, 190 / 255, 51 / 255],
  glowColor: [255 / 255, 190 / 255, 51 / 255],
  markers: PLACES.map((p) => ({
    location: p.coords,
    size: 0.08,
  })),
};

export default function GlobalRootsSection() {
  return (
    <section className="py-24 px-6 sm:px-8 max-w-7xl mx-auto w-full relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-[#ffbe33]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <RevealOnScroll direction="up" duration={700}>
        <div className="text-center max-w-xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Compass className="w-3.5 h-3.5 text-[#ffbe33]" />
            <span className="text-[11px] uppercase tracking-[0.25em] font-extrabold text-[#ffbe33]">
              Culinary Provenance
            </span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-cursive), cursive" }}
          >
            Where Our Food Comes From
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm">
            Crafted with recipes and authentic ingredients inspired by culinary traditions across the globe.
          </p>
        </div>
      </RevealOnScroll>

      {/* 2-Column Grid: Globe Left with Glowing Outline, Details on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: 3D Globe with Glowing Outline Ring (No Dragging) */}
        <RevealOnScroll direction="left" delay={100} duration={900} className="lg:col-span-6 flex items-center justify-center">
          <div className="relative w-full max-w-[420px] sm:max-w-[480px] aspect-square flex items-center justify-center pointer-events-none select-none">
            {/* Glowing Outline Ring that looked cool */}
            <div className="absolute inset-0 rounded-full ring-2 ring-[#ffbe33]/40 shadow-[0_0_80px_rgba(255,190,51,0.25)] pointer-events-none" />

            <Globe
              className="w-full h-full"
              config={GLOBE_DARK_CONFIG}
            />
          </div>
        </RevealOnScroll>

        {/* Right Column: Clean Regional Details Cards */}
        <RevealOnScroll direction="right" delay={200} duration={800} className="lg:col-span-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLACES.map((place) => (
              <div
                key={place.name}
                className="p-4 rounded-2xl bg-[#12141a]/90 border border-white/10 hover:border-[#ffbe33]/40 transition-all duration-300 flex items-start gap-3.5 shadow-md group hover:-translate-y-0.5"
              >
                <span className="text-2xl leading-none mt-0.5 group-hover:scale-110 transition-transform">
                  {place.flag}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#ffbe33] transition-colors">
                      {place.name}
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-medium">({place.region})</span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-snug">
                    {place.dish}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-neutral-500 italic pt-4 text-center lg:text-left">
            * All spices, heritage flour, and olive oils are sustainably imported from verified partner growers.
          </p>
        </RevealOnScroll>

      </div>
    </section>
  );
}
