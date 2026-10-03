import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodCardSkeleton } from "@/components/FoodCard";

export default function MenuLoading() {
  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white flex flex-col selection:bg-[#e60000]">
      <header className="fixed top-0 inset-x-0 z-50 h-20 bg-[#0b0c0f]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton variant="gold" className="h-10 w-32 rounded-xl" />
        </div>
      </header>

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <Skeleton variant="gold" className="h-6 w-36 rounded-full" />
            <Skeleton className="h-10 sm:h-14 w-72 sm:w-96" />
            <Skeleton className="h-4 w-full max-w-md opacity-60" />
          </div>
          <Skeleton variant="card" className="h-12 w-48 rounded-2xl" />
        </div>

        <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#12141e]/90 border border-white/10 space-y-5">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <Skeleton className="h-11 flex-1 max-w-md rounded-xl" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-xl shrink-0" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <FoodCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
