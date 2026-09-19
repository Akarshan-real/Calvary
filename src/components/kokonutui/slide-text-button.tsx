"use client";

/**
 * @author: @kokonut-labs
 * @description: Slide Text Button with animated vertical text transition
 * @version: 1.0.0
 * @date: 2025-11-02
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SlideTextButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: string;
  hoverText?: string;
  href?: string;
  className?: string;
  variant?: "default" | "ghost" | "gold" | "yellow";
  icon?: React.ReactNode;
  animateIn?: boolean;
}

export default function SlideTextButton({
  text = "Browse Components",
  hoverText,
  href = "/docs",
  className,
  variant = "default",
  icon,
  animateIn = false,
  ...props
}: SlideTextButtonProps) {
  const slideText = hoverText ?? text;
  const variantStyles =
    variant === "ghost"
      ? "border border-black/10 text-black hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
      : variant === "gold" || variant === "yellow"
      ? "bg-[#ffbe33] hover:bg-[#e6a827] text-neutral-950 font-extrabold shadow-lg shadow-[#ffbe33]/25 hover:shadow-[#ffbe33]/40 border-none"
      : "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90";

  const buttonContent = (
    <Link
      className={cn(
        "group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-xl px-5 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 active:scale-95 shrink-0 select-none",
        variantStyles,
        className
      )}
      href={href}
      {...props}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Default text - slides up and out */}
        <span className="flex items-center gap-2 whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-7 group-hover:opacity-0">
          {icon}
          <span>{text}</span>
        </span>

        {/* Hover text - slides in from bottom to center */}
        <span className="absolute flex items-center gap-2 whitespace-nowrap translate-y-7 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
          {icon}
          <span>{slideText}</span>
        </span>
      </div>
    </Link>
  );

  if (animateIn) {
    return (
      <motion.div
        animate={{ x: 0, opacity: 1, transition: { duration: 0.2 } }}
        className="relative shrink-0"
        initial={{ x: 200, opacity: 0 }}
      >
        {buttonContent}
      </motion.div>
    );
  }

  return <div className="relative shrink-0">{buttonContent}</div>;
}
