"use client";

/**
 * @author: @dorianbaffier
 * @description: Team Selector
 * @version: 3.0.0
 * @date: 2026-04-23
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Minus, Plus } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

const AVATAR_OVERLAP = 12;
const DICEBEAR_STYLE = "notionists-neutral";
const dicebearUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f4f4f5,e4e4e7,d4d4d8,a1a1aa`;

interface TeamMember {
  id: string;
  name: string;
  avatarUrl: string;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: "member-1", name: "Alex Rivera", avatarUrl: dicebearUrl("Alex") },
  { id: "member-2", name: "Blair Kim", avatarUrl: dicebearUrl("Blair") },
  { id: "member-3", name: "Casey Lin", avatarUrl: dicebearUrl("Casey") },
  { id: "member-4", name: "Devon Marsh", avatarUrl: dicebearUrl("Devon") },
];

const animations = {
  avatar: {
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 22,
        mass: 0.6,
      },
    },
    hidden: {
      opacity: 0,
      scale: 0.85,
      transition: { duration: 0.18, ease: "easeOut" },
    },
  } satisfies Variants,
  vibration: {
    idle: { x: 0 },
    shake: {
      x: [-3, 3, -2, 2, 0] as const,
      transition: { duration: 0.28, ease: "easeOut" },
    },
  } satisfies Variants,
} as const;

interface TeamSelectorProps {
  members?: TeamMember[];
  defaultValue?: number;
  value?: number;
  onChange?: (size: number) => void;
  label?: string;
  className?: string;
  maxSize?: number;
}

export default function TeamSelector({
  members = DEFAULT_MEMBERS,
  defaultValue = 1,
  value,
  onChange,
  label = "Party Size (Guests)",
  className = "",
  maxSize,
}: TeamSelectorProps) {
  const maxTeamSize = maxSize || members.length;
  const [internalCount, setInternalCount] = useState(defaultValue);
  const peopleCount = value !== undefined ? value : internalCount;

  const [isVibrating, setIsVibrating] = useState(false);
  const directionRef = useRef<1 | -1>(1);
  const prefersReducedMotion = useReducedMotion();

  const triggerVibration = () => {
    if (prefersReducedMotion) {
      return;
    }
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 280);
  };

  const handleIncrement = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (peopleCount < maxTeamSize) {
      directionRef.current = 1;
      const newCount = peopleCount + 1;
      setInternalCount(newCount);
      onChange?.(newCount);
    } else {
      triggerVibration();
    }
  };

  const handleDecrement = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (peopleCount > 1) {
      directionRef.current = -1;
      const newCount = peopleCount - 1;
      setInternalCount(newCount);
      onChange?.(newCount);
    } else {
      triggerVibration();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    action: "increment" | "decrement"
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (action === "increment") {
        handleIncrement(e);
      } else {
        handleDecrement(e);
      }
    }
  };

  const counterDistance = prefersReducedMotion ? 0 : 10;

  return (
    <div
      className={`flex w-full flex-col items-center justify-center ${className}`}
    >
      <div className="w-full rounded-2xl border border-white/10 bg-[#12141a]/95 p-4 shadow-xl">
        <fieldset>
          <legend className="mb-3 w-full font-bold text-[10px] text-[#ffbe33] uppercase tracking-[0.18em] flex items-center justify-between">
            <span>{label}</span>
            <span className="text-neutral-400 font-normal">Max {maxTeamSize} Guests</span>
          </legend>

          <div className="mb-7 flex justify-center">
            <div className="flex items-center">
              {members.map((member, index) => (
                <motion.div
                  animate={index < peopleCount ? "visible" : "hidden"}
                  className="flex items-center justify-center"
                  initial={index < defaultValue ? "visible" : "hidden"}
                  key={member.id}
                  style={{
                    marginLeft: index === 0 ? 0 : -AVATAR_OVERLAP,
                    zIndex: maxTeamSize - index,
                  }}
                  variants={animations.avatar}
                >
                  <Image
                    alt={member.name}
                    className="size-11 rounded-full border-2 border-white bg-zinc-100 object-cover shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5 dark:border-zinc-900 dark:bg-zinc-800 dark:ring-white/5"
                    height={88}
                    src={member.avatarUrl}
                    unoptimized
                    width={88}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            animate={isVibrating ? "shake" : "idle"}
            className="flex items-center justify-center gap-5"
            initial="idle"
            variants={animations.vibration}
          >
            <button
              aria-label="Decrease party size"
              className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300 transition-all duration-150 hover:border-[#ffbe33]/40 hover:bg-[#ffbe33]/15 hover:text-[#ffbe33] focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-neutral-300 cursor-pointer"
              disabled={peopleCount <= 1}
              onClick={handleDecrement}
              onKeyDown={(e) => handleKeyDown(e, "decrement")}
              type="button"
            >
              <Minus aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
            </button>

            <div className="flex min-w-16 flex-col items-center">
              <div className="relative h-9 overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.output
                    animate={{ opacity: 1, y: 0 }}
                    aria-live="polite"
                    className="block select-none font-bold text-3xl text-white tabular-nums"
                    exit={{
                      opacity: 0,
                      y: directionRef.current * -counterDistance,
                      transition: { duration: 0.14, ease: "easeIn" },
                    }}
                    initial={{
                      opacity: 0,
                      y: directionRef.current * counterDistance,
                    }}
                    key={peopleCount}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {peopleCount}
                  </motion.output>
                </AnimatePresence>
              </div>
              <span className="text-[11px] font-semibold text-[#ffbe33] uppercase tracking-wider">
                {peopleCount === 1 ? "Guest" : "Guests"}
              </span>
            </div>

            <button
              aria-label="Increase party size"
              className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300 transition-all duration-150 hover:border-[#ffbe33]/40 hover:bg-[#ffbe33]/15 hover:text-[#ffbe33] focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-neutral-300 cursor-pointer"
              disabled={peopleCount >= maxTeamSize}
              onClick={handleIncrement}
              onKeyDown={(e) => handleKeyDown(e, "increment")}
              type="button"
            >
              <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
            </button>
          </motion.div>
        </fieldset>
      </div>
    </div>
  );
}
