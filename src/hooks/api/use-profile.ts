"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/types/database";

export function useProfile(initialData?: Profile | null) {
  return useQuery<Profile | null>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load profile");
      return json.profile || null;
    },
    initialData: initialData ?? undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update profile");
      return json.profile;
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
      const res = await fetch("/api/profile", {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete account");
      return json;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
