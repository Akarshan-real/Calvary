"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getApiErrorMessage } from "@/lib/api";
import type { Profile } from "@/types/database";

export function useProfile(initialData?: Profile | null) {
  return useQuery<Profile | null>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data } = await api.get("/api/profile");
      if (!data.success) throw new Error(data.error || "Failed to load profile");
      return data.profile || null;
    },
    initialData: initialData ?? undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      try {
        const { data } = await api.patch("/api/profile", updates);
        if (!data.success) throw new Error(data.error || "Failed to update profile");
        return data.profile;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to update profile"));
      }
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["user-profile"], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const { data } = await api.delete("/api/profile");
        if (!data.success) throw new Error(data.error || "Failed to delete account");
        return data;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to delete account"));
      }
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
