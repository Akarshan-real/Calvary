import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyBookingsLoading() {
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

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <Skeleton variant="gold" className="h-6 w-36 rounded-full" />
            <Skeleton className="h-9 sm:h-12 w-64 sm:w-80" />
            <Skeleton className="h-4 w-72 opacity-60" />
          </div>
          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full sm:w-60 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#12141e]/90 border border-white/10 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Skeleton variant="gold" className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-20 opacity-60" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl col-span-2 sm:col-span-1" />
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-36" />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-28 rounded-xl" />
                  <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
