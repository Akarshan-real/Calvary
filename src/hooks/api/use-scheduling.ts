"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
      const { data } = await api.get("/api/reservations/calendar?days=45");
      if (!data.success) throw new Error(data.error || "Failed to load calendar data");
      return {
        tables: data.tables || [],
        slots: data.slots || [],
        dateOccupancyMap: data.dateOccupancyMap || {},
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
      const { data } = await api.get(`/api/reservations/availability?date=${date}`);
      if (!data.success) throw new Error(data.error || "Failed to load slot availability");
      return data.availability || [];
    },
    enabled: !!date,
    staleTime: 1000 * 30, // 30 seconds fresh
  });
}
