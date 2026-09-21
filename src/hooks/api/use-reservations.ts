"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserReservation } from "@/types/database";

export function useUserReservations(initialData?: UserReservation[]) {
  return useQuery<UserReservation[]>({
    queryKey: ["user-reservations"],
    queryFn: async () => {
      const res = await fetch("/api/reservations");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load reservations");
      return json.reservations || [];
    },
    initialData,
    staleTime: 1000 * 30, // 30 seconds fresh
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      table_id: number;
      slot_id: number;
      reservation_date: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string;
      party_size: number;
      special_request?: string;
    }) => {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to create reservation");
      return json.reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-availability"] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to cancel reservation");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-availability"] });
    },
  });
}

export function useAlterReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      reservation_date: string;
      slot_id: number;
      table_id: number;
      party_size: number;
      special_request?: string | null;
    }) => {
      const res = await fetch(`/api/reservations/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "alter", ...data }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to alter reservation");
      return json.reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-availability"] });
    },
  });
}

export function useSendReminder() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reservations/${id}/reminder`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to send reminder");
      return json;
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rating, comment }: { id: string; rating: number; comment?: string }) => {
      const res = await fetch(`/api/reservations/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to submit review");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
    },
  });
}
