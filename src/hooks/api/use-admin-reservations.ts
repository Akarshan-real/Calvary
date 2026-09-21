"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReservationWithRelations } from "@/components/AdminReservationManagement";

export function useAdminReservations(initialData?: ReservationWithRelations[]) {
  return useQuery<ReservationWithRelations[]>({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const res = await fetch("/api/reservations?admin=true");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load admin reservations");
      return json.reservations || [];
    },
    initialData,
    staleTime: 1000 * 30, // 30 seconds fresh
  });
}

export function useApproveReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to approve reservation");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-availability"] });
    },
  });
}

export function useRejectReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to reject reservation");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-calendar"] });
    },
  });
}

export function useSendAdminEmail() {
  return useMutation({
    mutationFn: async ({
      reservationId,
      subject,
      message,
    }: {
      reservationId: string;
      subject: string;
      message: string;
    }) => {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "email", subject, message }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to send email");
      return json;
    },
  });
}
