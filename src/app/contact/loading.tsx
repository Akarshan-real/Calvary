import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
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

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Skeleton variant="gold" className="h-6 w-36 mx-auto rounded-full" />
          <Skeleton className="h-10 sm:h-14 w-72 sm:w-96 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto opacity-60" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#12141e]/80 border border-white/10 flex items-start gap-4"
              >
                <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3.5 w-full opacity-60" />
                  <Skeleton className="h-3.5 w-3/4 opacity-60" />
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-[#12141e]/90 border border-white/10 shadow-2xl space-y-5">
            <div className="space-y-2 pb-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-3.5 w-64 opacity-60" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>

            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />

            <div className="pt-2 flex justify-end">
              <Skeleton variant="gold" className="h-12 w-44 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
