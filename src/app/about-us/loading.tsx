import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutUsLoading() {
  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white flex flex-col selection:bg-[#e60000]">
      {/* Navbar Placeholder */}
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

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* About Hero Skeleton */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Skeleton variant="gold" className="h-6 w-40 mx-auto rounded-full" />
          <Skeleton className="h-10 sm:h-16 w-full max-w-lg mx-auto" />
          <Skeleton className="h-4 w-5/6 mx-auto opacity-60" />
        </div>

        {/* Story & Visual Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full opacity-70" />
            <Skeleton className="h-4 w-5/6 opacity-70" />
            <Skeleton className="h-4 w-4/5 opacity-70" />
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 opacity-60" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 opacity-60" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 opacity-60" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <Skeleton variant="card" className="w-full max-w-[400px] aspect-square rounded-3xl" />
          </div>
        </div>

        {/* Pillars Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl sm:rounded-3xl bg-[#12141e]/80 border border-white/10 space-y-4"
            >
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-3.5 w-full opacity-60" />
              <Skeleton className="h-3.5 w-4/5 opacity-60" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
