import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-[#090b0e] flex items-center justify-center p-4">
      <div className="w-full max-w-[850px] min-h-[500px] rounded-3xl bg-[#12141e]/90 border border-white/10 shadow-2xl p-6 sm:p-12 flex flex-col items-center justify-center space-y-6">
        <Skeleton variant="gold" className="h-6 w-32 rounded-full" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-72 opacity-60" />
        <div className="w-full max-w-sm space-y-4 pt-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton variant="gold" className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
