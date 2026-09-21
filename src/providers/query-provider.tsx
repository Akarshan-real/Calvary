"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default 5-minute stale time for client in-memory cache
            staleTime: 1000 * 60 * 5,
            // Keep unused data in cache for 30 minutes
            gcTime: 1000 * 60 * 30,
            // Avoid refetching when window regains focus to save redundant queries
            refetchOnWindowFocus: false,
            // Retry once on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
