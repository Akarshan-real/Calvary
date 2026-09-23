"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getApiErrorMessage } from "@/lib/api";
import type { ReservationWithRelations } from "@/components/AdminReservationManagement";

export function useAdminReservations(initialData?: ReservationWithRelations[]) {
  return useQuery<ReservationWithRelations[]>({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const { data } = await api.get("/api/reservations?admin=true");
      if (!data.success) throw new Error(data.error || "Failed to load admin reservations");
      return data.reservations || [];
    },
    initialData,
    staleTime: 1000 * 30, // 30 seconds fresh
  });
}

export function useApproveReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await api.patch(`/api/reservations/${id}`, { action: "approve" });
        if (!data.success) throw new Error(data.error || "Failed to approve reservation");
        return data;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to approve reservation"));
      }
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
      try {
        const { data } = await api.patch(`/api/reservations/${id}`, { action: "reject", reason });
        if (!data.success) throw new Error(data.error || "Failed to reject reservation");
        return data;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to reject reservation"));
      }
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
      try {
        const { data } = await api.patch(`/api/reservations/${reservationId}`, {
          action: "email",
          subject,
          message,
        });
        if (!data.success) throw new Error(data.error || "Failed to send email");
        return data;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to send email"));
      }
    },
  });
}
