"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      // Check if page height actually exceeds screen height
      const pageHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const hasExcessHeight = pageHeight > windowHeight + 100;

      // Only show after user scrolls down past window height (screen height)
      if (hasExcessHeight && window.scrollY > windowHeight * 0.8) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-8 right-8 z-[90] flex items-center justify-center w-12 h-12 rounded-full",
        "bg-[#090b0e]/90 text-[#ffbe33] border border-[#ffbe33]/40 backdrop-blur-md",
        "shadow-2xl shadow-black/80 hover:shadow-[#ffbe33]/30 hover:border-[#ffbe33] hover:bg-[#ffbe33] hover:text-neutral-950",
        "hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-6 pointer-events-none"
      )}
    >
      <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />
    </button>
  );
}
