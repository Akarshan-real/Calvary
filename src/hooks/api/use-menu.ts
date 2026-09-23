"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getApiErrorMessage } from "@/lib/api";
import type { MenuCategory, MenuItem } from "@/types/database";

interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
}

export function useMenu(initialData?: MenuData) {
  return useQuery<MenuData>({
    queryKey: ["menu"],
    queryFn: async () => {
      const { data } = await api.get("/api/menu");
      if (!data.success) throw new Error(data.error || "Failed to load menu");
      return {
        categories: data.categories || [],
        items: data.items || [],
      };
    },
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useUpsertMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<MenuItem>) => {
      try {
        const { data } = await api.post("/api/menu", item);
        if (!data.success) throw new Error(data.error || "Failed to save item");
        return data.item;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to save item"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      try {
        const { data } = await api.delete(`/api/menu?id=${id}`);
        if (!data.success) throw new Error(data.error || "Failed to delete item");
        return data;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Failed to delete item"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}
