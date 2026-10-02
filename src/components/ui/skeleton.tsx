import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gold" | "card" | "circular";
}

export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/[0.06] backdrop-blur-xs select-none pointer-events-none",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent",
        variant === "default" && "rounded-xl",
        variant === "card" && "rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#12141e]/70",
        variant === "circular" && "rounded-full",
        variant === "gold" && "rounded-xl bg-[#ffbe33]/[0.08] before:via-[#ffbe33]/15 border border-[#ffbe33]/15",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
