"use client";

import React from "react";
import { Globe } from "@/components/ui/globe";
import { Compass } from "lucide-react";
import type { COBEOptions } from "cobe";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

import globalRootsData from "@/data/global-roots.json";

interface Place {
  name: string;
  code: string;
  coords: [number, number];
}

const PLACES: Place[] = (globalRootsData as any[]).map((p) => ({
  name: p.name,
  code: p.code,
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
            Where Our Ingredients Come From
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm">
            Artisanal heritage ingredients sourced directly from 7 global partner regions.
          </p>
        </div>
      </RevealOnScroll>

      {/* 2-Column Grid: Globe Left with Glowing Outline, Details on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: 3D Globe with Glowing Outline Ring (No Dragging) */}
        <RevealOnScroll direction="left" delay={100} duration={900} className="lg:col-span-6 flex items-center justify-center">
          <div className="relative w-full max-w-[420px] sm:max-w-[480px] aspect-square flex items-center justify-center pointer-events-none select-none">
            {/* Glowing Outline Ring */}
            <div className="absolute inset-0 rounded-full ring-2 ring-[#ffbe33]/40 shadow-[0_0_80px_rgba(255,190,51,0.25)] pointer-events-none" />

            <Globe
              className="w-full h-full"
              config={GLOBE_DARK_CONFIG}
            />
          </div>
        </RevealOnScroll>

        {/* Right Column: Luxury Country Provenance Cards */}
        <RevealOnScroll direction="right" delay={200} duration={800} className="lg:col-span-6">
          {/* Active Origins Header Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffbe33] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffbe33]"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Partner Culinary Origins
              </span>
            </div>
            <span className="text-xs font-mono text-[#ffbe33] font-extrabold px-2.5 py-0.5 rounded-full bg-[#ffbe33]/10 border border-[#ffbe33]/30">
              7 Origins
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLACES.map((place) => (
              <div
                key={place.name}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-[#141724]/90 via-[#0f1118]/90 to-[#12141c]/90 border border-white/10 flex items-center gap-3.5 shadow-md"
              >
                {/* Country Flag Crest */}
                <div className="relative w-10 h-7 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/20 shadow-md bg-black/40">
                  <img
                    src={`https://flagcdn.com/w80/${place.code}.png`}
                    alt={`${place.name} flag`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-white truncate">
                    {place.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </RevealOnScroll>

      </div>
    </section>
  );
}
