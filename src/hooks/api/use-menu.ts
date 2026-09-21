"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MenuCategory, MenuItem } from "@/types/database";

interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
}

export function useMenu(initialData?: MenuData) {
  return useQuery<MenuData>({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch("/api/menu");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load menu");
      return {
        categories: json.categories || [],
        items: json.items || [],
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
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save item");
      return json.item;
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
      const res = await fetch(`/api/menu?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete item");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}
