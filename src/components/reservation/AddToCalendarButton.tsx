"use client";

import React from "react";
import { Calendar, ChevronDown, Download, ExternalLink } from "lucide-react";
import { generateGoogleCalendarUrl, downloadIcsFile, type CalendarEventData } from "@/lib/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AddToCalendarButtonProps {
  event: CalendarEventData;
  className?: string;
  buttonSize?: "sm" | "md";
}

export default function AddToCalendarButton({
  event,
  className,
  buttonSize = "md",
}: AddToCalendarButtonProps) {
  const [open, setOpen] = React.useState(false);

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleIcsDownload = () => {
    downloadIcsFile(event);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
          "bg-white/10 hover:bg-[#ffbe33] text-white hover:text-neutral-950 border border-white/15 hover:border-[#ffbe33] shadow-md",
          buttonSize === "sm" ? "px-3 py-2 text-[11px]" : "px-4 py-2.5 text-xs",
          open && "bg-[#ffbe33] text-neutral-950 border-[#ffbe33]",
          className
        )}
      >
        <Calendar className={cn("shrink-0", buttonSize === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
        <span>Add to Calendar</span>
        <ChevronDown
          className={cn(
            "transition-transform duration-200 shrink-0",
            buttonSize === "sm" ? "w-3 h-3" : "w-3.5 h-3.5",
            open && "rotate-180"
          )}
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-56 rounded-2xl bg-[#141724] border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={handleGoogleCalendar}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold text-neutral-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0 shadow-sm" />
            <span>Google Calendar</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={handleIcsDownload}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold text-neutral-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbe33] shrink-0 shadow-sm" />
            <span>Apple / Outlook (.ics)</span>
          </span>
          <Download className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        </button>
      </PopoverContent>
    </Popover>
  );
}
