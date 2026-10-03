import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TermsLoading() {
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

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="space-y-3 border-b border-white/10 pb-6">
          <Skeleton variant="gold" className="h-6 w-36 rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-80" />
          <Skeleton className="h-4 w-48 opacity-60" />
        </div>

        <div className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-[#12141e]/90 border border-white/10 space-y-6">
          <Skeleton className="h-4 w-full opacity-70" />
          <Skeleton className="h-4 w-5/6 opacity-70" />
          <Skeleton className="h-4 w-4/5 opacity-70" />
          <div className="pt-4 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full opacity-70" />
            <Skeleton className="h-4 w-11/12 opacity-70" />
          </div>
          <div className="pt-4 space-y-4">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-full opacity-70" />
            <Skeleton className="h-4 w-4/5 opacity-70" />
          </div>
        </div>
      </main>
    </div>
  );
}
