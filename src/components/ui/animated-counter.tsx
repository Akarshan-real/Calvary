"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  easing?: "linear" | "easeOut";
  className?: string;
  decimals?: number;
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedCounter({
  to,
  prefix = "",
  suffix = "",
  duration = 1800,
  easing = "easeOut",
  className = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          observer.unobserve(el);

          let startTime: number | null = null;
          const step = (ts: number) => {
            if (!startTime) startTime = ts;
            const elapsed = ts - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing === "easeOut" ? easeOut(progress) : progress;
            setCount(parseFloat((easedProgress * to).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(to);
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration, easing, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}
      {suffix}
    </span>
  );
}
