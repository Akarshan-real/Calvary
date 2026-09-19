"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

interface ParallaxHeroBgProps {
  src: string;
  alt: string;
}

export function ParallaxHeroBg({ src, alt }: ParallaxHeroBgProps) {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      // Move the bg image at 40% of scroll speed for parallax
      el.style.transform = `translateY(${scrollY * 0.4}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={imgRef}
      className="absolute inset-0 w-full h-[115%] -top-[7.5%] pointer-events-none"
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover object-center brightness-75 contrast-105"
      />
      <div className="absolute inset-0 bg-black/45" />
    </div>
  );
}
