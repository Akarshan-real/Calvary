"use client";

/**
 * @author: @dorianbaffier
 * @description: Particle Button (Enhanced with luxury gold/red theme particles & customizable icon)
 * @version: 1.1.0
 * @website: https://kokonutui.com
 */

import { AnimatePresence, motion } from "motion/react";
import { type RefObject, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onSuccess?: () => void;
  successDuration?: number;
  particleColor?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
}

function SuccessParticles({
  buttonRef,
  particleColor = "#ffbe33",
}: {
  buttonRef: React.RefObject<HTMLButtonElement>;
  particleColor?: string;
}) {
  const rect = buttonRef.current?.getBoundingClientRect();
  if (!rect) return null;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const particleColors = [
    particleColor,
    "#ffbe33",
    "#ff8800",
    "#ffffff",
    "#ffd700",
    "#e60000",
  ];

  return (
    <AnimatePresence>
      {[...Array(8)].map((_, i) => (
        <motion.div
          animate={{
            scale: [0, 1.4, 0],
            x: [0, (i % 2 ? 1 : -1) * (Math.random() * 60 + 20)],
            y: [0, -Math.random() * 60 - 20],
          }}
          className="fixed h-1.5 w-1.5 rounded-full pointer-events-none z-[9999]"
          initial={{
            scale: 0,
            x: 0,
            y: 0,
          }}
          key={i}
          style={{
            left: centerX,
            top: centerY,
            backgroundColor: particleColors[i % particleColors.length],
            boxShadow: `0 0 8px ${particleColors[i % particleColors.length]}`,
          }}
          transition={{
            duration: 0.65,
            delay: i * 0.05,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>
  );
}

export default function ParticleButton({
  children,
  onClick,
  onSuccess,
  successDuration = 800,
  className,
  particleColor = "#ffbe33",
  showIcon = false,
  icon,
  ...props
}: ParticleButtonProps) {
  const [showParticles, setShowParticles] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowParticles(true);
    onClick?.(e);
    onSuccess?.();

    setTimeout(() => {
      setShowParticles(false);
    }, successDuration);
  };

  return (
    <>
      {showParticles && (
        <SuccessParticles
          buttonRef={buttonRef as RefObject<HTMLButtonElement>}
          particleColor={particleColor}
        />
      )}
      <button
        type="button"
        className={cn(
          "relative inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none outline-none",
          showParticles && "scale-95",
          className
        )}
        onClick={handleClick}
        ref={buttonRef}
        {...props}
      >
        {children}
        {showIcon && icon}
      </button>
    </>
  );
}

