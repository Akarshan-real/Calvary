"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Utensils,
  X,
  Check,
  AlertCircle,
  Save,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSlotAvailability } from "@/hooks/api/use-scheduling";
import { useAlterReservation } from "@/hooks/api/use-reservations";
import type { UserReservation } from "@/types/database";

import { createPortal } from "react-dom";

interface EditReservationModalProps {
  isOpen: boolean;
  reservation: UserReservation | null;
  onClose: () => void;
  onSuccess: (updated: UserReservation) => void;
}

export default function EditReservationModal({
  isOpen,
  reservation,
  onClose,
  onSuccess,
}: EditReservationModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [partySize, setPartySize] = useState<number>(2);
  const [specialRequest, setSpecialRequest] = useState<string>("");

  const { data: slotsData = [], isLoading: isLoadingSlots } = useSlotAvailability(selectedDate);
  const alterReservationMutation = useAlterReservation();
  const isSubmitting = alterReservationMutation.isPending;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Initialize form state when modal opens
  useEffect(() => {
    if (isOpen && reservation) {
      setSelectedDate(reservation.reservation_date);
      setSelectedSlotId(reservation.slot_id);
      setSelectedTableId(reservation.table_id);
      setPartySize(reservation.party_size);
      setSpecialRequest(reservation.special_request || "");
    }
  }, [isOpen, reservation]);

  // Auto-clear invalid slot or table on date change
  useEffect(() => {
    if (!isOpen || !selectedDate) return;
    if (selectedSlotId && slotsData.length > 0) {
      const currentSlot = slotsData.find((s) => s.slot.id === selectedSlotId);
      if (!currentSlot || !currentSlot.isAvailable || currentSlot.isPast) {
        if (selectedDate !== reservation?.reservation_date || selectedSlotId !== reservation?.slot_id) {
          setSelectedSlotId(null);
          setSelectedTableId(null);
        }
      }
    }
  }, [isOpen, selectedDate, slotsData]);

  if (!isOpen || !reservation) return null;

  // Find currently selected slot data
  const currentSlotObj = slotsData.find((s) => s.slot.id === selectedSlotId);
  // Eligible tables for this slot that fit party size, or the table currently assigned to this reservation
  const availableTables = currentSlotObj
    ? currentSlotObj.availableTables.filter(
        (t: any) => t.capacity >= partySize
      )
    : [];

  // If the current reservation already has a table on this slot & date, allow keeping it
  const isOriginalSlotAndDate =
    selectedDate === reservation.reservation_date &&
    selectedSlotId === reservation.slot_id;

  const candidateTables = [...availableTables];
  if (
    isOriginalSlotAndDate &&
    reservation.restaurant_tables &&
    !candidateTables.some((t) => t.id === reservation.table_id) &&
    (reservation.restaurant_tables.capacity >= partySize)
  ) {
    candidateTables.unshift({ is_active: true, ...reservation.restaurant_tables } as any);
  }

  const formatSlotTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      const h = Number(parts[0]);
      const m = parts[1];
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 || 12;
      return `${displayH}:${m} ${ampm}`;
    }
    return timeStr;
  };

  const handleSave = async () => {
    if (!selectedDate) {
      toast.error("Date required", { description: "Please choose a reservation date." });
      return;
    }
    if (!selectedSlotId) {
      toast.error("Time slot required", { description: "Please choose a dining time slot." });
      return;
    }
    if (!selectedTableId) {
      toast.error("Table selection required", { description: "Please pick an available table." });
      return;
    }

    try {
      const updated = await alterReservationMutation.mutateAsync({
        id: reservation.id,
        reservation_date: selectedDate,
        slot_id: selectedSlotId,
        table_id: selectedTableId,
        party_size: partySize,
        special_request: specialRequest.trim() || null,
      });

      toast.success("Reservation Altered!", {
        description: `Your table booking has been updated to ${selectedDate}. Check your email for confirmation.`,
      });
      onSuccess(updated as any);
      onClose();
    } catch (err: any) {
      toast.error("Could not update reservation", {
        description: err?.message || "An unexpected error occurred. Please try again.",
      });
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const modalMarkup = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative bg-[#131622] border border-white/15 rounded-3xl p-6 sm:p-7 max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-black/95 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ffbe33]/15 border border-[#ffbe33]/30 flex items-center justify-center text-[#ffbe33] shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Alter Reservation
              </h3>
              <p className="text-xs text-neutral-400">
                Booking #{reservation.id.slice(0, 8).toUpperCase()} • {reservation.customer_name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="space-y-5 text-left overflow-y-auto pr-1 flex-1 py-1">
          {/* 1. Date Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#ffbe33]" />
              <span>Dining Date</span>
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlotId(null);
                setSelectedTableId(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#ffbe33] transition-colors"
            />
          </div>

          {/* 2. Party Size Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#ffbe33]" />
                <span>Guest Count</span>
              </label>
              <span className="text-xs font-black text-[#ffbe33]">{partySize} Guests</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPartySize(size);
                    setSelectedTableId(null);
                  }}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    partySize === size
                      ? "bg-[#ffbe33] text-neutral-950 border-[#ffbe33] shadow-md font-black"
                      : "bg-[#0e1017] text-neutral-400 border-white/10 hover:border-white/20 hover:text-white"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Slot Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#ffbe33]" />
              <span>Available Dining Slot</span>
            </label>

            {isLoadingSlots ? (
              <div className="p-4 rounded-xl bg-[#0e1017] border border-white/5 text-center text-xs text-neutral-500 animate-pulse">
                Checking available table slots...
              </div>
            ) : slotsData.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>No available slots for the selected date. Please choose another date.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slotsData.map((item) => {
                  const isSelected = selectedSlotId === item.slot.id;
                  const isAvailable = item.isAvailable || (isOriginalSlotAndDate && item.slot.id === reservation.slot_id);

                  return (
                    <button
                      key={item.slot.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedSlotId(item.slot.id);
                        setSelectedTableId(null);
                      }}
                      className={cn(
                        "p-2.5 rounded-xl border text-center transition-all cursor-pointer",
                        !isAvailable && "opacity-30 cursor-not-allowed bg-neutral-900/40 border-transparent",
                        isAvailable && !isSelected && "bg-[#0e1017] border-white/10 hover:border-white/25 text-white",
                        isSelected && "bg-[#ffbe33] text-neutral-950 border-[#ffbe33] font-black shadow-md"
                      )}
                    >
                      <div className="text-xs font-bold">
                        {formatSlotTime(item.slot.start_time)}
                      </div>
                      <div className="text-[10px] opacity-75 mt-0.5">
                        {item.slot.duration_minutes} Mins
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Table Selection */}
          {selectedSlotId && (
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#a3f900]" />
                <span>Choose Table for {partySize} Guests</span>
              </label>

              {candidateTables.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  No tables with capacity for {partySize} guests are available for this slot. Try another slot or reduce party size.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {candidateTables.map((tbl: any) => {
                    const isSelected = selectedTableId === tbl.id;
                    const isOriginal = tbl.id === reservation.table_id;

                    return (
                      <button
                        key={tbl.id}
                        type="button"
                        onClick={() => setSelectedTableId(tbl.id)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all cursor-pointer relative",
                          isSelected
                            ? "bg-[#a3f900]/15 border-[#a3f900] shadow-md text-white"
                            : "bg-[#0e1017] border-white/10 hover:border-white/20 text-neutral-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white">
                            Table {tbl.table_number}
                          </span>
                          {isOriginal && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-neutral-400 font-mono">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-1">
                          Capacity: {tbl.capacity} Seats
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. Note / Message to Admin & Concierge */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#ffbe33]" />
                <span>Note to Admin / Concierge</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="e.g. As requested via email, rescheduling to 9:00 PM slot for 3 guests. Celebrating anniversary..."
              className="w-full p-3 rounded-xl bg-[#0e1017] border border-white/10 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-[#ffbe33] transition-colors resize-none leading-relaxed"
            />
            <p className="text-[11px] text-neutral-400 leading-normal">
              This note will be attached to your booking and reviewed by the dining admin to approve & lock your new table.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !selectedTableId}
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-[#ffbe33] hover:bg-[#ffc94d] disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#ffbe33]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Updating..." : "Save Alterations"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalMarkup, document.body);
}
