import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
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

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Skeleton variant="gold" className="h-6 w-36 mx-auto rounded-full" />
          <Skeleton className="h-10 sm:h-14 w-72 sm:w-96 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto opacity-60" />
        </div>

        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full shrink-0" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "aspect-[4/3]",
            "aspect-[3/4]",
            "aspect-[16/10]",
            "aspect-[4/5]",
            "aspect-[4/3]",
            "aspect-[3/4]",
          ].map((asp, i) => (
            <div
              key={i}
              className={`rounded-2xl sm:rounded-3xl overflow-hidden bg-[#12141e]/80 border border-white/10 ${asp}`}
            >
              <Skeleton className="w-full h-full rounded-none" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
