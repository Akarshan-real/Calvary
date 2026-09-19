"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number; // ms
  duration?: number; // ms
  once?: boolean;
  threshold?: number;
  as?: React.ElementType;
}

const directionClasses: Record<RevealDirection, string> = {
  up: "translate-y-10",
  down: "-translate-y-10",
  left: "translate-x-10",
  right: "-translate-x-10",
  none: "",
};

export function RevealOnScroll({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 600,
  once = true,
  threshold = 0.1,
  as: Tag = "div",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-all ease-out",
        directionClasses[direction],
        "opacity-0",
        visible && "!opacity-100 !translate-x-0 !translate-y-0",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </Tag>
  );
}

/** Staggered group — wraps children with incrementing delays */
interface RevealGroupProps {
  children: React.ReactNode[];
  className?: string;
  stagger?: number; // ms between each child
  direction?: RevealDirection;
  duration?: number;
  threshold?: number;
  childClassName?: string;
  as?: React.ElementType;
  childAs?: React.ElementType;
}

export function RevealGroup({
  children,
  className,
  stagger = 100,
  direction = "up",
  duration = 600,
  threshold = 0.1,
  childClassName,
  as: Tag = "div",
  childAs = "div",
}: RevealGroupProps) {
  return (
    <Tag className={className}>
      {React.Children.map(children, (child, i) => (
        <RevealOnScroll
          key={i}
          delay={i * stagger}
          direction={direction}
          duration={duration}
          threshold={threshold}
          className={childClassName}
          as={childAs}
        >
          {child}
        </RevealOnScroll>
      ))}
    </Tag>
  );
}
