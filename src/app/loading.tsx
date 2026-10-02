import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodCardSkeleton } from "@/components/FoodCard";

export default function HomeLoading() {
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

      {/* Hero Section Skeleton */}
      <main className="flex-1 pt-28 sm:pt-36 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[500px]">
          {/* Left Hero Details */}
          <div className="lg:col-span-7 space-y-6">
            <Skeleton variant="gold" className="h-8 w-44 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-12 sm:h-16 w-full max-w-lg" />
              <Skeleton className="h-12 sm:h-16 w-4/5" />
            </div>
            <Skeleton className="h-16 w-full max-w-md opacity-70" />
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Skeleton variant="gold" className="h-12 w-44 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
            {/* Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-md border-t border-white/10">
              <div className="space-y-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20 opacity-60" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20 opacity-60" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20 opacity-60" />
              </div>
            </div>
          </div>

          {/* Right Hero Graphic Skeleton */}
          <div className="lg:col-span-5 flex justify-center">
            <Skeleton
              variant="card"
              className="w-full max-w-[380px] aspect-square rounded-3xl"
            />
          </div>
        </div>

        {/* Featured Section Skeleton */}
        <div className="space-y-8 pt-8">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <Skeleton variant="gold" className="h-6 w-36 mx-auto rounded-full" />
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-4 w-80 mx-auto opacity-60" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <FoodCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
