"use client";

import React, { useState } from "react";
import { Users, Sparkles, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RestaurantTableInfo } from "@/components/CoachSchedulingCard";

interface TableFloorMapProps {
  availableTables: RestaurantTableInfo[];
  selectedTable: RestaurantTableInfo | null;
  onSelectTable: (table: RestaurantTableInfo | null) => void;
}

// Zone metadata for Calvary luxury dining layout
interface ZoneConfig {
  id: string;
  name: string;
  description: string;
  badge: string;
  tableNumbers: string[];
}

const ZONES: ZoneConfig[] = [
  {
    id: "window",
    name: "Window View Bay",
    description: "Panoramic city skyline & intimate street-side glow",
    badge: "Skyline",
    tableNumbers: ["T1", "T2", "T3", "1", "2", "3"],
  },
  {
    id: "main",
    name: "Grand Dining Hall",
    description: "Chandelier ambiance & live hearth acoustic energy",
    badge: "Centerpiece",
    tableNumbers: ["T4", "T5", "T6", "T7", "T8", "4", "5", "6", "7", "8"],
  },
  {
    id: "booth",
    name: "Artisanal Private Booths",
    description: "Plush velvet banquette with subdued mood lighting",
    badge: "VIP Seclusion",
    tableNumbers: ["T9", "T10", "T11", "9", "10", "11"],
  },
  {
    id: "patio",
    name: "Veranda & Garden Patio",
    description: "Open-air floral terrace with heated botanical pergolas",
    badge: "Al Fresco",
    tableNumbers: ["T12", "T13", "T14", "12", "13", "14"],
  },
];

export default function TableFloorMap({
  availableTables,
  selectedTable,
  onSelectTable,
}: TableFloorMapProps) {
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>("all");

  // Map tables to zones
  const getZoneForTable = (tbl: RestaurantTableInfo): string => {
    if (tbl.zone_slug) {
      return tbl.zone_slug;
    }
    const cleanNum = tbl.table_number.toUpperCase().trim();
    for (const z of ZONES) {
      if (z.tableNumbers.some((tn) => cleanNum === tn || cleanNum === `TABLE ${tn}` || cleanNum.endsWith(tn))) {
        return z.id;
      }
    }
    // Default fallback based on numeric index if not matched
    const num = parseInt(cleanNum.replace(/\D/g, "") || "1", 10);
    if (num <= 3) return "window";
    if (num <= 8) return "main";
    if (num <= 11) return "booth";
    return "patio";
  };

  // Only consider zones that actually have available tables for the chosen slot
  const populatedZones = ZONES.filter((zone) =>
    availableTables.some((t) => getZoneForTable(t) === zone.id)
  );

  return (
    <div className="space-y-6">
      {/* Floor Plan Zone Filter Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveZoneFilter("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer",
            activeZoneFilter === "all"
              ? "bg-[#ffbe33] text-neutral-950 shadow-md font-black"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
          )}
        >
          All Dining Zones ({availableTables.length})
        </button>

        {populatedZones.map((zone) => {
          const zoneCount = availableTables.filter((t) => getZoneForTable(t) === zone.id).length;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => setActiveZoneFilter(zone.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                activeZoneFilter === zone.id
                  ? "bg-[#ffbe33] text-neutral-950 shadow-md font-black"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
              )}
            >
              <span>{zone.name}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-md font-mono",
                activeZoneFilter === zone.id ? "bg-black/20 text-neutral-950" : "bg-white/10 text-neutral-400"
              )}>
                {zoneCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Architectural Visual Layout Area */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#141724] to-[#0d0f17] border border-white/15 p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Stage / Kitchen Reference Header in Floor Map */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-white/10 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white uppercase tracking-wider">
              Open Artisanal Kitchen &amp; Hearth
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Available
            </span>
            <span className="flex items-center gap-1.5 text-[#ffbe33]">
              <span className="w-2 h-2 rounded-full bg-[#ffbe33]" />
              Selected
            </span>
          </div>
        </div>

        {/* Zones Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {populatedZones.map((zone) => {
            const tablesInZone = availableTables.filter((t) => getZoneForTable(t) === zone.id);
            if (activeZoneFilter !== "all" && activeZoneFilter !== zone.id) return null;
            if (tablesInZone.length === 0) return null;

            return (
              <div
                key={zone.id}
                className={cn(
                  "p-6 rounded-2xl border transition-all duration-300 relative space-y-4",
                  tablesInZone.some((t) => t.id === selectedTable?.id)
                    ? "bg-[#ffbe33]/10 border-[#ffbe33]/50 shadow-[0_0_20px_rgba(255,190,51,0.15)]"
                    : "bg-[#0a0c13]/60 border-white/10 hover:border-white/20"
                )}
              >
                {/* Zone Label */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-white text-base tracking-tight">{zone.name}</h4>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-[#ffbe33]">
                        {zone.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{zone.description}</p>
                  </div>
                </div>

                {/* Table nodes in this zone */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
                    {tablesInZone.map((tbl) => {
                      const isSelected = selectedTable?.id === tbl.id;
                      return (
                        <button
                          key={tbl.id}
                          type="button"
                          onClick={() => onSelectTable(isSelected ? null : tbl)}
                          className={cn(
                            "p-3.5 sm:p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative group",
                            isSelected
                              ? "bg-gradient-to-b from-[#ffbe33] to-[#e6a827] text-neutral-950 border-[#ffbe33] shadow-lg shadow-[#ffbe33]/30 scale-105 font-black"
                              : "bg-[#141722] border-white/10 hover:border-white/30 text-white hover:scale-105 shadow-sm"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                            isSelected ? "bg-black/20 text-neutral-950" : "bg-white/5 text-[#ffbe33]"
                          )}>
                            <Users className="w-4 h-4" />
                          </div>

                          <span className="text-xs sm:text-sm font-bold tracking-tight">
                            Table {tbl.table_number}
                          </span>

                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded font-mono font-semibold",
                            isSelected ? "text-neutral-900 bg-black/10" : "text-neutral-400 bg-white/5"
                          )}>
                            {tbl.capacity} Seats
                          </span>

                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black text-[#ffbe33] flex items-center justify-center shadow">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
