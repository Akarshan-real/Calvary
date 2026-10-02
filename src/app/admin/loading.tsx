import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#090b0e] text-white flex flex-col selection:bg-[#ffbe33] selection:text-neutral-950">
      {/* Navbar Placeholder */}
      <header className="fixed top-0 inset-x-0 z-50 h-20 bg-[#090b0e]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8">
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

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header Strip Skeleton */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <Skeleton variant="gold" className="h-6 w-48 rounded-full" />
            <Skeleton className="h-8 sm:h-10 w-80" />
            <Skeleton className="h-4 w-96 opacity-60" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>

        {/* Master Tab Bar Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          <Skeleton variant="gold" className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>

        {/* Metric Counters Strip Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-2xl bg-[#131622]/80 border border-white/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-3 w-36 opacity-60" />
            </div>
          ))}
        </div>

        {/* Search & Filter Bar Skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-xl shrink-0" />
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-44 rounded-xl" />
            <Skeleton className="h-9 w-44 rounded-xl" />
          </div>
        </div>

        {/* Reservations Items List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#11141e] border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton variant="gold" className="h-5 w-24 rounded-full" />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-28 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
