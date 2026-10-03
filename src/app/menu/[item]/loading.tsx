import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuItemLoading() {
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-36 pb-16">
        <div className="mb-8">
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="bg-[#141722] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center p-4 xs:p-6 sm:p-10">
            <div className="md:col-span-6 flex justify-center">
              <Skeleton
                variant="card"
                className="w-full aspect-square max-w-[380px] rounded-2xl"
              />
            </div>

            <div className="md:col-span-6 space-y-6">
              <div className="space-y-3">
                <Skeleton variant="gold" className="h-5 w-28 rounded-full" />
                <Skeleton className="h-9 sm:h-11 w-4/5" />
                <div className="flex items-center gap-3 pt-1">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton variant="gold" className="h-7 w-32 rounded-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-full opacity-70" />
                <Skeleton className="h-4 w-5/6 opacity-70" />
                <Skeleton className="h-4 w-2/3 opacity-70" />
              </div>

              <div className="space-y-3 pt-2">
                <Skeleton className="h-4 w-48 opacity-60" />
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center space-y-1.5"
                    >
                      <Skeleton className="h-3 w-12 mx-auto" />
                      <Skeleton className="h-5 w-10 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
