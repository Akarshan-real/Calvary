"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getApiErrorMessage } from "@/lib/api";
import type { UserReservation } from "@/types/database";

export function useUserReservations(initialData?: UserReservation[]) {
  return useQuery<UserReservation[]>({
    queryKey: ["user-reservations"],
    queryFn: async () => {
      const { data } = await api.get("/api/reservations");
      if (!data.success) throw new Error(data.error || "Failed to load reservations");
      return data.reservations || [];
    },
    initialData,
    staleTime: 1000 * 30, // 30 seconds fresh
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      table_id: number;
      slot_id: number;
      reservation_date: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string;
      party_size: number;
      special_request?: string;
    }) => {
      try {
        const { data } = await api.post("/api/reservations", payload);
        if (!data.success) throw new Error(data.error || "Failed to create reservation");
        return data.reservation;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to create reservation"));
      }
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
      try {
        const { data } = await api.patch(`/api/reservations/${id}`, { action: "cancel" });
        if (!data.success) throw new Error(data.error || "Failed to cancel reservation");
        return data;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to cancel reservation"));
      }
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
    mutationFn: async (payload: {
      id: string;
      reservation_date: string;
      slot_id: number;
      table_id: number;
      party_size: number;
      special_request?: string | null;
    }) => {
      try {
        const { data } = await api.patch(`/api/reservations/${payload.id}`, { action: "alter", ...payload });
        if (!data.success) throw new Error(data.error || "Failed to alter reservation");
        return data.reservation;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to alter reservation"));
      }
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
      try {
        const { data } = await api.post(`/api/reservations/${id}/reminder`);
        if (!data.success) throw new Error(data.error || "Failed to send reminder");
        return data;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to send reminder"));
      }
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rating, comment }: { id: string; rating: number; comment?: string }) => {
      try {
        const { data } = await api.post(`/api/reservations/${id}/review`, { rating, comment });
        if (!data.success) throw new Error(data.error || "Failed to submit review");
        return data;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to submit review"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
    },
  });
}
