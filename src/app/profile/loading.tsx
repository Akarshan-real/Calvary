import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
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

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#12141e]/90 border border-white/10 shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <Skeleton variant="circular" className="w-20 h-20 sm:w-28 sm:h-28 shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Skeleton className="h-7 sm:h-9 w-44" />
                <Skeleton variant="gold" className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 opacity-70 mx-auto sm:mx-0" />
              <Skeleton className="h-3 w-36 opacity-50 mx-auto sm:mx-0" />
            </div>
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>

        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <Skeleton variant="gold" className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-2xl bg-[#0e111a] border border-white/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded-md" />
              </div>
              <Skeleton className="h-8 w-full rounded-xl opacity-75" />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Skeleton variant="gold" className="h-12 w-44 rounded-xl" />
        </div>
      </main>
    </div>
  );
}
