"use client";

import { useQuery } from "@tanstack/react-query";
import type { DateOccupancyInfo } from "@/app/api/reservations/calendar/route";
import type { SlotAvailability } from "@/components/CoachSchedulingCard";

interface CalendarResponse {
  tables: any[];
  slots: any[];
  dateOccupancyMap: Record<string, DateOccupancyInfo>;
}

export function useCalendarData(initialMap?: Record<string, DateOccupancyInfo>) {
  return useQuery<CalendarResponse>({
    queryKey: ["reservation-calendar"],
    queryFn: async () => {
      const res = await fetch("/api/reservations/calendar?days=45");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load calendar data");
      return {
        tables: json.tables || [],
        slots: json.slots || [],
        dateOccupancyMap: json.dateOccupancyMap || {},
      };
    },
    initialData: initialMap
      ? {
          tables: [],
          slots: [],
          dateOccupancyMap: initialMap,
        }
      : undefined,
    staleTime: 1000 * 60, // 1 minute fresh
  });
}

export function useSlotAvailability(date: string) {
  return useQuery<SlotAvailability[]>({
    queryKey: ["reservation-availability", date],
    queryFn: async () => {
      if (!date) return [];
      const res = await fetch(`/api/reservations/availability?date=${date}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load slot availability");
      return json.availability || [];
    },
    enabled: !!date,
    staleTime: 1000 * 30, // 30 seconds fresh
  });
}
