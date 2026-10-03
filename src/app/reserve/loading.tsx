import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReserveLoading() {
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

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Skeleton variant="gold" className="h-6 w-44 mx-auto rounded-full" />
          <Skeleton className="h-10 sm:h-14 w-80 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto opacity-60" />
        </div>

        <div className="bg-[#12141e]/90 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl space-y-6">
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-3 overflow-x-auto scrollbar-none">
            <Skeleton variant="gold" className="h-10 w-36 rounded-xl shrink-0" />
            <Skeleton className="h-10 w-36 rounded-xl shrink-0 opacity-60" />
            <Skeleton className="h-10 w-36 rounded-xl shrink-0 opacity-60" />
          </div>

          <div className="p-4 sm:p-8 lg:p-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <Skeleton className="h-7 w-36" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 sm:h-12 rounded-xl" />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-2 gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </div>
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex gap-1.5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 flex-1 rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <Skeleton variant="gold" className="h-12 w-44 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
