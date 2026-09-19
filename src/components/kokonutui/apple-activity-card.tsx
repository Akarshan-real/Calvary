"use client";

/**
 * @author: @kokonutui
 * @description: Apple Activity Card with dynamic nutritional macronutrient rings
 * @version: 1.1.0
 * @license: MIT
 * @website: https://kokonutui.com
 */

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface ActivityData {
  label: string;
  value: number; // 0 to 100 percentage
  color: string;
  size: number;
  current: number;
  target: number;
  unit: string;
}

interface CircleProgressProps {
  data: ActivityData;
  index: number;
}

const DEFAULT_ACTIVITIES: ActivityData[] = [
  {
    label: "PROTEIN",
    value: 75,
    color: "#FF2D55",
    size: 200,
    current: 30,
    target: 40,
    unit: "G",
  },
  {
    label: "CARBS",
    value: 60,
    color: "#A3F900",
    size: 160,
    current: 45,
    target: 75,
    unit: "G",
  },
  {
    label: "FATS",
    value: 40,
    color: "#04C7DD",
    size: 120,
    current: 12,
    target: 30,
    unit: "G",
  },
];

const CircleProgress = ({ data, index }: CircleProgressProps) => {
  const strokeWidth = 14;
  const radius = (data.size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedValue = Math.min(Math.max(data.value, 0), 100);
  const progress = ((100 - normalizedValue) / 100) * circumference;

  const gradientId = `gradient-${data.label.toLowerCase().replace(/[^a-z0-9]/g, "")}-${index}`;
  const gradientUrl = `url(#${gradientId})`;

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
    >
      <div className="relative">
        <svg
          aria-label={`${data.label} Progress - ${data.value}%`}
          className="-rotate-90 transform"
          height={data.size}
          viewBox={`0 0 ${data.size} ${data.size}`}
          width={data.size}
        >
          <title>{`${data.label} Progress - ${data.value}%`}</title>

          <defs>
            <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="100%">
              <stop
                offset="0%"
                style={{
                  stopColor: data.color,
                  stopOpacity: 1,
                }}
              />
              <stop
                offset="100%"
                style={{
                  stopColor: data.color,
                  stopOpacity: 0.75,
                }}
              />
            </linearGradient>
          </defs>

          {/* Background circle track */}
          <circle
            className="text-white/10 dark:text-white/10"
            cx={data.size / 2}
            cy={data.size / 2}
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />

          {/* Animated progress circle */}
          <motion.circle
            animate={{ strokeDashoffset: progress }}
            cx={data.size / 2}
            cy={data.size / 2}
            fill="none"
            initial={{ strokeDashoffset: circumference }}
            r={radius}
            stroke={gradientUrl}
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            style={{
              filter: "drop-shadow(0 0 6px rgba(0,0,0,0.35))",
            }}
            transition={{
              duration: 1.4,
              delay: index * 0.15,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

const DetailedActivityInfo = ({ data }: { data: ActivityData[] }) => {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-4 sm:gap-5"
      initial={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {data.map((activity) => (
        <motion.div className="flex flex-col" key={activity.label}>
          <span className="font-bold text-xs tracking-wider uppercase text-neutral-400">
            {activity.label}
          </span>
          <span
            className="font-extrabold text-xl sm:text-2xl tracking-tight"
            style={{ color: activity.color }}
          >
            {activity.current}
            <span className="text-sm font-semibold text-neutral-400">
              /{activity.target}
            </span>
            <span className="ml-1 text-xs font-bold uppercase text-neutral-400">
              {activity.unit}
            </span>
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export interface AppleActivityCardProps {
  title?: string;
  subtitle?: string;
  activities?: ActivityData[];
  className?: string;
  compact?: boolean;
}

export default function AppleActivityCard({
  title = "Nutritional Rings",
  subtitle = "Daily Recommended Values",
  activities = DEFAULT_ACTIVITIES,
  className,
  compact = false,
}: AppleActivityCardProps) {
  const currentActivities = activities && activities.length > 0 ? activities : DEFAULT_ACTIVITIES;

  if (compact) {
    return (
      <div
        className={cn(
          "w-full rounded-2xl p-4 bg-[#111319]/90 border border-white/10 text-white shadow-xl flex flex-col items-center gap-3",
          className
        )}
      >
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-extrabold text-xs uppercase tracking-wider text-[#ffbe33]">
            {title}
          </span>
          {subtitle && (
            <span className="text-[10px] text-neutral-400 font-medium">
              {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center justify-around w-full gap-2">
          {/* Concentric Progress Rings (Compact 140px) */}
          <div className="relative h-[135px] w-[135px] flex items-center justify-center shrink-0">
            {currentActivities.map((activity, index) => {
              // Scale down ring sizes proportionally for compact mode
              const compactScale = 130 / 190;
              const compactData = {
                ...activity,
                size: Math.round(activity.size * compactScale),
              };
              return (
                <CircleProgress
                  data={compactData}
                  index={index}
                  key={`${activity.label}-${index}`}
                />
              );
            })}
          </div>

          {/* Micro Stats List */}
          <div className="flex flex-col gap-2">
            {currentActivities.map((activity) => (
              <div key={activity.label} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: activity.color }}
                />
                <span className="text-[10px] font-bold uppercase text-neutral-400 w-16">
                  {activity.label}
                </span>
                <span
                  className="font-extrabold text-xs"
                  style={{ color: activity.color }}
                >
                  {activity.current}
                  <span className="text-[10px] text-neutral-500 font-normal">
                    /{activity.target}{activity.unit}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative mx-auto w-full rounded-3xl p-5 sm:p-7 bg-[#111319] border border-white/10 text-white shadow-2xl",
        className
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="text-center space-y-1">
          <motion.h3
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-xl sm:text-2xl text-white tracking-tight"
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {title}
          </motion.h3>
          {subtitle && (
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 w-full py-2">
          {/* Concentric Progress Rings */}
          <div className="relative h-[210px] w-[210px] flex items-center justify-center shrink-0">
            {currentActivities.map((activity, index) => (
              <CircleProgress
                data={activity}
                index={index}
                key={`${activity.label}-${index}`}
              />
            ))}
          </div>

          {/* Detailed Macronutrient Breakdown */}
          <DetailedActivityInfo data={currentActivities} />
        </div>
      </div>
    </div>
  );
}
