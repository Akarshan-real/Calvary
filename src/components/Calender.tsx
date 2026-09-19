"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateOccupancyInfo } from "@/app/actions/restaurant";

export interface ReservationCalendarProps {
  selectedDate?: string;
  onSelectDate: (dateStr: string) => void;
  dateOccupancyMap?: Record<string, DateOccupancyInfo>;
  className?: string;
  minDate?: Date;
  maxDays?: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({
  selectedDate,
  onSelectDate,
  dateOccupancyMap = {},
  className,
  minDate = new Date(),
  maxDays = 45,
}: ReservationCalendarProps) {
  // Normalize today's date (local midnight)
  const today = useMemo(() => {
    const d = new Date(minDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minDate]);

  const maxAllowedDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() + maxDays);
    return d;
  }, [today, maxDays]);

  // Current view month & year state
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) {
      const parts = selectedDate.split("-");
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      }
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const isPrevDisabled = useMemo(() => {
    return viewYear === today.getFullYear() && viewMonth <= today.getMonth();
  }, [viewYear, viewMonth, today]);

  const isNextDisabled = useMemo(() => {
    const nextMonthFirst = new Date(viewYear, viewMonth + 1, 1);
    return nextMonthFirst > maxAllowedDate;
  }, [viewYear, viewMonth, maxAllowedDate]);

  // Generate grid matrix for the calendar month
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isBeyondMax: boolean;
      isToday: boolean;
      densityInfo?: DateOccupancyInfo;
      isSelectable: boolean;
    }> = [];

    // Empty lead slots before month starts
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({
        dateStr: "",
        dayNumber: 0,
        isCurrentMonth: false,
        isPast: true,
        isBeyondMax: false,
        isToday: false,
        isSelectable: false,
      });
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(viewYear, viewMonth, day);
      cellDate.setHours(0, 0, 0, 0);

      const y = cellDate.getFullYear();
      const m = String(cellDate.getMonth() + 1).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const isPast = cellDate < today;
      const isBeyondMax = cellDate > maxAllowedDate;
      const isToday = cellDate.getTime() === today.getTime();

      const densityInfo = dateOccupancyMap[dateStr];
      const isClosed = densityInfo?.isClosed || densityInfo?.density === "closed";
      const isFull = densityInfo?.density === "full";

      const isSelectable = !isPast && !isBeyondMax && !isClosed && !isFull;

      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isPast,
        isBeyondMax,
        isToday,
        densityInfo,
        isSelectable,
      });
    }

    return cells;
  }, [viewYear, viewMonth, today, maxAllowedDate, dateOccupancyMap]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#0e1017]/95 p-4 sm:p-5 text-white backdrop-blur-md shadow-2xl space-y-4",
        className
      )}
    >
      {/* Month & Year Header with Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <p className="text-[11px] font-semibold text-neutral-400">
            Select a highlighted dining date
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            aria-label="Previous month"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-300" />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            aria-label="Next month"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-neutral-300" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_LABELS.map((dayName) => (
          <div
            key={dayName}
            className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 py-1"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Month Days Matrix */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <div key={`empty-${idx}`} className="h-11 sm:h-12" />;
          }

          const isSelected = selectedDate === cell.dateStr;
          const density = cell.densityInfo?.density || "low";
          const isClosed = cell.densityInfo?.isClosed || density === "closed";
          const isFull = density === "full";

          // Tooltip/label text
          let statusLabel = "Low Bookings";
          if (isClosed) statusLabel = cell.densityInfo?.reason || "Closed";
          else if (isFull) statusLabel = "Fully Booked";
          else if (density === "high") statusLabel = "High Bookings (Few Left)";
          else if (density === "medium") statusLabel = "Medium Bookings";

          return (
            <button
              key={cell.dateStr}
              type="button"
              disabled={!cell.isSelectable}
              onClick={() => cell.isSelectable && onSelectDate(cell.dateStr)}
              title={`${cell.dateStr}: ${statusLabel}`}
              className={cn(
                "relative group/cell h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200",
                "border text-xs sm:text-sm font-bold select-none",
                // Base state for disabled / unselectable
                !cell.isSelectable &&
                  "opacity-35 cursor-not-allowed bg-neutral-900/40 border-transparent text-neutral-500",
                // Available states
                cell.isSelectable &&
                  !isSelected &&
                  "bg-[#151822]/80 border-white/5 hover:border-white/25 hover:scale-[1.04] text-neutral-200 cursor-pointer shadow-sm",
                // Selected state
                isSelected &&
                  "bg-gradient-to-b from-[#ffbe33] to-[#e5a822] text-neutral-950 border-[#ffbe33] shadow-[0_0_20px_rgba(255,190,51,0.45)] scale-[1.05] z-10",
                // High density border hint if selectable
                cell.isSelectable && density === "high" && !isSelected && "border-rose-500/30 bg-rose-950/20",
                // Medium density border hint if selectable
                cell.isSelectable && density === "medium" && !isSelected && "border-amber-500/25 bg-amber-950/15"
              )}
            >
              {/* Day Number */}
              <span
                className={cn(
                  "leading-none",
                  isSelected ? "font-black" : "font-extrabold",
                  (isClosed || isFull) && "line-through text-neutral-500"
                )}
              >
                {cell.dayNumber}
              </span>

              {/* Status Indicator Icon or Dot */}
              <div className="mt-1 flex items-center justify-center">
                {isClosed ? (
                  <Ban className="w-2.5 h-2.5 text-neutral-500" aria-hidden="true" />
                ) : isFull ? (
                  <Lock className="w-2.5 h-2.5 text-rose-500/70" aria-hidden="true" />
                ) : density === "high" ? (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shadow-sm",
                      isSelected ? "bg-neutral-950" : "bg-rose-500 ring-2 ring-rose-500/30"
                    )}
                  />
                ) : density === "medium" ? (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shadow-sm",
                      isSelected ? "bg-neutral-950" : "bg-amber-400 ring-2 ring-amber-400/30"
                    )}
                  />
                ) : (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shadow-sm",
                      isSelected ? "bg-neutral-950" : "bg-emerald-400 ring-2 ring-emerald-400/30"
                    )}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Clear Intuitive Color Legend */}
      <div className="pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5 text-[10.5px] font-semibold text-neutral-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
          <span>Low Bookings</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
          <span>Medium Bookings</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
          <span>High Bookings</span>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500">
          <Lock className="w-2.5 h-2.5" />
          <span>Full / Closed</span>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
