"use client";

import React, { useMemo } from "react";
import { format, setMonth, setYear } from "date-fns";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BirthdayPickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function BirthdayCalendar({
  value,
  onChange,
  className,
}: BirthdayPickerProps) {
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }, [value]);

  const currentYear = new Date().getFullYear();
  const [year, setYearState] = React.useState<number>(() => {
    return selectedDate ? selectedDate.getFullYear() : currentYear - 20;
  });

  const [month, setMonthState] = React.useState<number>(() => {
    return selectedDate ? selectedDate.getMonth() : 0;
  });

  React.useEffect(() => {
    if (selectedDate) {
      setYearState(selectedDate.getFullYear());
      setMonthState(selectedDate.getMonth());
    }
  }, [value]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 100; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      dateStr: string;
      isSelected: boolean;
    }> = [];

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({
        dayNumber: 0,
        isCurrentMonth: false,
        dateStr: "",
        isSelected: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const isSelected = !!selectedDate &&
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === d;

      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr,
        isSelected,
      });
    }

    return cells;
  }, [year, month, selectedDate]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonthState(11);
      setYearState((y) => y - 1);
    } else {
      setMonthState((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonthState(0);
      setYearState((y) => y + 1);
    } else {
      setMonthState((m) => m + 1);
    }
  };

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
  };

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-2xl bg-[#12141d] border border-white/10 p-3 sm:p-4 shadow-2xl text-white select-none",
        className
      )}
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
          <select
            aria-label="Select month"
            value={month}
            onChange={(e) => setMonthState(Number(e.target.value))}
            className="flex-1 min-w-0 bg-[#1a1d29] border border-white/10 text-[11px] sm:text-xs font-bold text-white rounded-lg px-1.5 sm:px-2 py-1.5 outline-none focus:border-[#ffbe33] cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx} className="bg-[#12141d] text-white">
                {name}
              </option>
            ))}
          </select>

          <select
            aria-label="Select year"
            value={year}
            onChange={(e) => setYearState(Number(e.target.value))}
            className="w-18 sm:w-24 shrink-0 bg-[#1a1d29] border border-white/10 text-[11px] sm:text-xs font-bold text-white rounded-lg px-1.5 sm:px-2 py-1.5 outline-none focus:border-[#ffbe33] cursor-pointer"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y} className="bg-[#12141d] text-white">
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <div key={`empty-${idx}`} className="h-8" />;
          }

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => handleSelectDay(cell.dateStr)}
              className={cn(
                "h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer",
                cell.isSelected
                  ? "bg-[#ffbe33] text-black font-extrabold shadow-md shadow-[#ffbe33]/30 scale-105"
                  : "text-neutral-300 hover:bg-white/10 hover:text-white"
              )}
            >
              {cell.dayNumber}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Selected Birthday:</span>
          <span className="font-bold text-[#ffbe33] flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {format(selectedDate, "MMMM d, yyyy")}
          </span>
        </div>
      )}
    </div>
  );
}

export { BirthdayCalendar as DropdownMultiCalendar };
