"use client";

import React, { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Utensils,
  User,
  Phone,
  Mail,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Flame,
  ShieldCheck,
  Star,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/Calender";
import TeamSelector from "@/components/kokonutui/team-selector";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import FuseButton from "@/components/FuseButton";
import type { DateOccupancyInfo } from "@/types/database";
import { useCalendarData, useSlotAvailability } from "@/hooks/api/use-scheduling";
import { useCreateReservation } from "@/hooks/api/use-reservations";
import { api, getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import TableFloorMap from "@/components/reservation/TableFloorMap";
import AddToCalendarButton from "@/components/reservation/AddToCalendarButton";
import { LayoutGrid, MapPin } from "lucide-react";

export interface RestaurantTableInfo {
  id: number;
  table_number: string;
  capacity: number;
  is_active: boolean;
  zone?: string | null;
  zone_slug?: string | null;
  description?: string | null;
  shape?: string | null;
  min_capacity?: number | null;
  is_vip?: boolean | null;
  sort_order?: number | null;
  floor?: string | null;
}

export interface ReservationSlotInfo {
  id: number;
  start_time: string;
  duration_minutes: number;
  is_active: boolean;
}

export interface SlotAvailability {
  slot: ReservationSlotInfo;
  availableTables: RestaurantTableInfo[];
  availableTableCount: number;
  isAvailable: boolean;
  isPast?: boolean;
}

interface CoachSchedulingProps {
  initialDateOccupancyMap?: Record<string, DateOccupancyInfo>;
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  className?: string;
}

export function CoachSchedulingCard({
  initialDateOccupancyMap = {},
  user = null,
  className,
}: CoachSchedulingProps) {
  // Step navigation: 1: Date & Time, 2: Table Selection, 3: Guest Details, 4: Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Table view mode: 'grid' or 'floor_map'
  const [tableViewMode, setTableViewMode] = useState<"grid" | "floor_map">("floor_map");

  // Selection states
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<ReservationSlotInfo | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTableInfo | null>(null);

  // TanStack Query for dynamic calendar data and slot/table availability
  const { data: calendarData } = useCalendarData(initialDateOccupancyMap);
  const { data: slotsAvailability = [], isLoading: isSlotLoading } = useSlotAvailability(selectedDate);
  const createReservationMutation = useCreateReservation();

  // Guest Form states
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [partySize, setPartySize] = useState<number>(2);
  const [specialRequest, setSpecialRequest] = useState("");

  // Missing profile email state & handler
  const [emailUpdatedSuccess, setEmailUpdatedSuccess] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Auto-select the first available date on mount if none selected
  useEffect(() => {
    if (!selectedDate) {
      const dates = Object.keys(initialDateOccupancyMap).sort();
      const firstOpen = dates.find(
        (d) =>
          initialDateOccupancyMap[d]?.density !== "full" &&
          initialDateOccupancyMap[d]?.density !== "closed" &&
          !initialDateOccupancyMap[d]?.isClosed
      );
      if (firstOpen) {
        setSelectedDate(firstOpen);
      } else {
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
      }
    }
  }, [initialDateOccupancyMap, selectedDate]);

  // Reset slot and table when date changes or if current selected slot is no longer available/in the past
  useEffect(() => {
    if (selectedSlot && slotsAvailability.length > 0) {
      const matching = slotsAvailability.find((s) => s.slot.id === selectedSlot.id);
      if (!matching || !matching.isAvailable || matching.isPast) {
        setSelectedSlot(null);
        setSelectedTable(null);
      }
    }
  }, [slotsAvailability, selectedSlot]);

  // Update profile email inline handler
  const handleSaveProfileEmail = async () => {
    if (!customerEmail || !customerEmail.includes("@")) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    setIsSavingEmail(true);
    setSubmitError(null);
    try {
      const { data } = await api.patch("/api/profile", { email: customerEmail });
      if (data.success) {
        setEmailUpdatedSuccess(true);
      } else {
        setSubmitError(data.error || "Failed to update profile email.");
      }
    } catch (err: any) {
      setSubmitError(getApiErrorMessage(err, "Failed to update email."));
    } finally {
      setIsSavingEmail(false);
    }
  };

  // Constraint check before arming/submitting
  const checkReservationConstraints = (): boolean => {
    setSubmitError(null);

    if (!selectedTable || !selectedSlot || !selectedDate) {
      const msg = "Please choose a date, time slot, and table.";
      setSubmitError(msg);
      toast.error("Selection incomplete", { description: msg });
      return false;
    }

    if (!customerEmail || !customerEmail.trim()) {
      const msg = "An email address is mandatory for reservations.";
      setSubmitError(msg);
      toast.error("Email required", { description: msg });
      return false;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      const msg = "Please fill out your full name and phone number.";
      setSubmitError(msg);
      toast.error("Contact details required", { description: msg });
      return false;
    }

    if (partySize > selectedTable.capacity) {
      const msg = `Selected table capacity is ${selectedTable.capacity} guests. Please reduce party size or choose a larger table.`;
      setSubmitError(msg);
      toast.error("Capacity exceeded", { description: msg });
      return false;
    }

    return true;
  };

  // Handle final submission
  const executeReservation = async () => {
    if (!checkReservationConstraints() || !selectedTable || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      const bookingData = await createReservationMutation.mutateAsync({
        table_id: selectedTable.id,
        slot_id: selectedSlot.id,
        reservation_date: selectedDate,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        party_size: partySize,
        special_request: specialRequest,
      });

      setConfirmedBooking(bookingData);
      setCurrentStep(4);
      toast.success("Reservation request received!", {
        description: `Booking reference created for ${selectedDate}. Check your email for status.`,
      });
    } catch (err: any) {
      const msg = err?.message || "Failed to create reservation.";
      setSubmitError(msg);
      toast.error("Reservation failed", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 16,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 350,
        damping: 25,
      },
    },
  };

  // Formatting helpers
  const formatTimeSlot = (timeStr: string) => {
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

  const isSlotInPast = (dateStr: string, timeStr: string): boolean => {
    if (!dateStr || !timeStr) return false;
    const [y, m, d] = dateStr.split("-").map(Number);
    const parts = timeStr.split(":").map(Number);
    const slotDate = new Date(y, m - 1, d, parts[0] || 0, parts[1] || 0, 0);
    return slotDate.getTime() <= Date.now();
  };

  const selectedSlotAvailability = slotsAvailability.find(
    (s) => s.slot.id === selectedSlot?.id
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "rounded-3xl border border-white/10 bg-gradient-to-b from-[#151824]/95 via-[#10121a]/95 to-[#0b0c12]/95",
        "shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden w-full max-w-5xl mx-auto",
        className
      )}
    >
      {/* Header Bar */}
      <div className="border-b border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ffbe33]/15 border border-[#ffbe33]/30 flex items-center justify-center text-[#ffbe33] shadow-md shrink-0">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Calvary Fine Dining
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Table Reservation
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Select date, timing, and signature table with instant approval lock
            </p>
          </div>
        </div>

        {/* Step Progression Badges */}
        <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-400">
          <span
            className={cn(
              "px-3.5 py-1.5 rounded-full border transition-all",
              currentStep === 1
                ? "bg-[#ffbe33] text-neutral-950 border-[#ffbe33] font-black shadow-md"
                : "bg-white/5 border-white/10 text-neutral-300"
            )}
          >
            1. Date & Time
          </span>
          <span className="text-neutral-600">→</span>
          <span
            className={cn(
              "px-3.5 py-1.5 rounded-full border transition-all",
              currentStep === 2
                ? "bg-[#ffbe33] text-neutral-950 border-[#ffbe33] font-black shadow-md"
                : "bg-white/5 border-white/10 text-neutral-300"
            )}
          >
            2. Table
          </span>
          <span className="text-neutral-600">→</span>
          <span
            className={cn(
              "px-3.5 py-1.5 rounded-full border transition-all",
              currentStep >= 3
                ? "bg-[#ffbe33] text-neutral-950 border-[#ffbe33] font-black shadow-md"
                : "bg-white/5 border-white/10 text-neutral-300"
            )}
          >
            3. Confirmation
          </span>
        </div>
      </div>

      {/* Dynamic Step Content */}
      <div className="p-6 sm:p-10 lg:p-12">
        {/* ======================================================== */}
        {/* STEP 1: DATE (HEATMAP CALENDAR) & TIMINGS */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <motion.div variants={itemVariants} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Heatmap Calendar */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#ffbe33] flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4" />
                    Step 1 • Select Dining Date
                  </span>
                  {selectedDate && (
                    <span className="text-xs font-bold text-neutral-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      Selected: {selectedDate}
                    </span>
                  )}
                </div>

                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                    setSelectedTable(null);
                  }}
                  dateOccupancyMap={calendarData?.dateOccupancyMap || initialDateOccupancyMap}
                />
              </div>

              {/* Right Column: Timings Slots for Chosen Date */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#ffbe33] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Step 2 • Select Time Slot
                    </span>
                    {selectedDate && (
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {selectedDate}
                      </span>
                    )}
                  </div>

                  {isSlotLoading ? (
                    <div className="p-12 text-center text-neutral-400 text-xs flex flex-col items-center gap-2">
                      <span className="w-6 h-6 border-2 border-[#ffbe33] border-t-transparent rounded-full animate-spin" />
                      Loading live table availability...
                    </div>
                  ) : slotsAvailability.length === 0 ? (
                    <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-neutral-400 text-xs">
                      No active time slots found for this date. Please pick another date.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {slotsAvailability.map(({ slot, availableTableCount, isAvailable, isPast }) => {
                        const slotPassed = isPast !== undefined ? isPast : isSlotInPast(selectedDate, slot.start_time);
                        const isSlotAvailable = isAvailable && !slotPassed;
                        const isSlotSelected = selectedSlot?.id === slot.id;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={!isSlotAvailable}
                            onClick={() => {
                              if (!isSlotAvailable) return;
                              setSelectedSlot(isSlotSelected ? null : slot);
                              setSelectedTable(null);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                              !isSlotAvailable &&
                                "opacity-40 cursor-not-allowed bg-neutral-900/40 border-transparent text-neutral-500 pointer-events-none select-none",
                              isSlotAvailable &&
                                !isSlotSelected &&
                                "bg-[#141722]/80 border-white/10 hover:border-white/25 hover:bg-[#1a1e2d] text-white cursor-pointer shadow-sm",
                              isSlotSelected &&
                                "bg-gradient-to-r from-[#ffbe33] to-[#e6a827] text-neutral-950 border-[#ffbe33] shadow-lg shadow-[#ffbe33]/25 font-extrabold scale-[1.02]"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm sm:text-base font-black tracking-tight">
                                {formatTimeSlot(slot.start_time)}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md",
                                  isSlotSelected
                                    ? "bg-black/20 text-neutral-950"
                                    : "bg-white/10 text-neutral-300"
                                )}
                              >
                                {slot.duration_minutes} Mins
                              </span>
                            </div>

                            <div className="text-right">
                              {slotPassed ? (
                                <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-neutral-500" /> Time Passed
                                </span>
                              ) : isAvailable ? (
                                <span
                                  className={cn(
                                    "text-xs font-extrabold flex items-center gap-1",
                                    isSlotSelected
                                      ? "text-neutral-950"
                                      : availableTableCount <= 2
                                      ? "text-rose-400"
                                      : "text-emerald-400"
                                  )}
                                >
                                  {availableTableCount}{" "}
                                  {availableTableCount === 1 ? "Table Left" : "Tables Open"}
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Full
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Next Step Button */}
                <div className="pt-8 border-t border-white/10 flex justify-center">
                  <InteractiveHoverButton
                    type="button"
                    variant="gold"
                    disabled={
                      !selectedDate ||
                      !selectedSlot ||
                      (selectedSlotAvailability
                        ? !selectedSlotAvailability.isAvailable || selectedSlotAvailability.isPast
                        : false)
                    }
                    onClick={() => setCurrentStep(2)}
                    className="w-full max-w-sm py-4 disabled:opacity-35 disabled:pointer-events-none"
                  >
                    Proceed To Select Table
                  </InteractiveHoverButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: TABLE SELECTION (CAPACITY & VIBE) */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#ffbe33]">
                  Step 2 of 3
                </span>
                <h3 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
                  Select Your Preferred Table
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Showing available tables for {selectedDate} at{" "}
                  {selectedSlot && formatTimeSlot(selectedSlot.start_time)}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* View Mode Toggle: Floor Map vs Grid */}
                <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTableViewMode("floor_map")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                      tableViewMode === "floor_map"
                        ? "bg-[#ffbe33] text-neutral-950 shadow-sm"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Floor Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTableViewMode("grid")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                      tableViewMode === "grid"
                        ? "bg-[#ffbe33] text-neutral-950 shadow-sm"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <LayoutGrid className="w-3 h-3" />
                    <span>List</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Time</span>
                </button>
              </div>
            </div>

            {/* Render Table Floor Map OR Classic Grid */}
            {tableViewMode === "floor_map" ? (
              <TableFloorMap
                availableTables={selectedSlotAvailability?.availableTables || []}
                selectedTable={selectedTable}
                onSelectTable={(table) => setSelectedTable(table)}
              />
            ) : (
              /* Tables Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSlotAvailability?.availableTables.map((table) => {
                  const isSelected = selectedTable?.id === table.id;

                  // Table classification flavor text
                  let tableStyle = "Artisanal Dining Booth";
                  if (table.capacity === 2) tableStyle = "Intimate Couple Table";
                  else if (table.capacity === 6) tableStyle = "Family & Banquette Seating";
                  else if (table.capacity >= 8) tableStyle = "Chef's Grand Feast Table";

                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => setSelectedTable(isSelected ? null : table)}
                      className={cn(
                        "p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4",
                        !isSelected &&
                          "bg-[#141722]/80 border-white/10 hover:border-white/25 hover:scale-[1.02] text-white shadow-md",
                        isSelected &&
                          "bg-gradient-to-b from-[#ffbe33]/15 via-[#181c2b] to-[#12141f] border-[#ffbe33] shadow-[0_0_25px_rgba(255,190,51,0.35)] scale-[1.02]"
                      )}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="space-y-1">
                          <span className="text-lg font-black text-white">
                            Table {table.table_number}
                          </span>
                          <div className="text-[11px] font-semibold text-neutral-400">
                            {tableStyle}
                          </div>
                        </div>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black",
                            isSelected
                              ? "bg-[#ffbe33] text-neutral-950"
                              : "bg-white/10 text-[#ffbe33] border border-[#ffbe33]/30"
                          )}
                        >
                          <Users className="w-3 h-3" />
                          {table.capacity} Seats
                        </span>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs w-full">
                        <span className="text-neutral-400 font-medium">Status</span>
                        <span
                          className={cn(
                            "font-bold uppercase tracking-wider text-[10px]",
                            isSelected ? "text-[#ffbe33]" : "text-emerald-400"
                          )}
                        >
                          {isSelected ? "Selected" : "Available"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step Navigation Bar */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors cursor-pointer"
              >
                Back
              </button>

              <InteractiveHoverButton
                type="button"
                variant="gold"
                disabled={!selectedTable}
                onClick={() => {
                  // Set party size to max table capacity or 2
                  if (selectedTable) {
                    setPartySize(Math.min(partySize, selectedTable.capacity));
                  }
                  setCurrentStep(3);
                }}
                className="py-3.5 px-8 disabled:opacity-30 disabled:pointer-events-none"
              >
                Continue To Guest Form
              </InteractiveHoverButton>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: GUEST DETAILS & MANDATORY EMAIL ENFORCEMENT */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <motion.div variants={itemVariants} className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-1 border-b border-white/10 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#ffbe33]">
                Step 3 of 3 • Guest Information
              </span>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Complete Your Reservation
              </h3>
              <p className="text-xs text-neutral-400">
                Table {selectedTable?.table_number} ({selectedTable?.capacity} Seats) on{" "}
                {selectedDate} at {selectedSlot && formatTimeSlot(selectedSlot.start_time)}
              </p>
            </div>

            {/* MANDATORY PROFILE EMAIL NOTIFICATION */}
            {(!user?.email || !customerEmail || emailUpdatedSuccess) && (
              <div
                className={cn(
                  "p-4 rounded-2xl border transition-all text-xs space-y-2",
                  emailUpdatedSuccess
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-200"
                )}
              >
                <div className="flex items-center gap-2 font-bold">
                  {emailUpdatedSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>
                    {emailUpdatedSuccess
                      ? "Profile Email Synced Successfully!"
                      : "Email Address Mandatory for Approval"}
                  </span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  {emailUpdatedSuccess
                    ? "Your email is now saved in your profile. You will receive official approval notifications here."
                    : "Our restaurant manager reviews each reservation and replies to your email with 'Approved' to lock your table. Please provide your email below."}
                </p>
              </div>
            )}

            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Reservation Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeReservation();
              }}
              className="space-y-4"
            >
              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#ffbe33]" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Liam Harrison"
                    className="w-full px-4 py-3 rounded-xl bg-[#141722] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-[#ffbe33] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#ffbe33]" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-3 rounded-xl bg-[#141722] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-[#ffbe33] transition-colors"
                  />
                </div>
              </div>

              {/* Email & Party Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#ffbe33]" />
                      Email Address *
                    </span>
                    {user && !user.email && (
                      <button
                        type="button"
                        onClick={handleSaveProfileEmail}
                        disabled={isSavingEmail || !customerEmail}
                        className="text-[10px] text-[#ffbe33] underline hover:text-white transition-colors cursor-pointer"
                      >
                        {isSavingEmail ? "Saving..." : "Save to Profile"}
                      </button>
                    )}
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. liam@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#141722] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-[#ffbe33] transition-colors"
                  />
                </div>
              </div>

              {/* Dynamic Kokonut UI TeamSelector for Table Guests */}
              <div className="pt-1 pb-2">
                <TeamSelector
                  maxSize={selectedTable?.capacity || 4}
                  value={partySize}
                  onChange={(size) => setPartySize(size)}
                  label="Table Guest Count"
                  members={Array.from(
                    { length: Math.max(selectedTable?.capacity || 4, 4) },
                    (_, i) => {
                      const names = [
                        "Lead Guest",
                        "Guest Two",
                        "Guest Three",
                        "Guest Four",
                        "Guest Five",
                        "Guest Six",
                        "Guest Seven",
                        "Guest Eight",
                      ];
                      const seeds = ["Felix", "Bella", "Charlie", "Oliver", "Luna", "Milo", "Leo", "Sophie"];
                      return {
                        id: `guest-${i + 1}`,
                        name: names[i] || `Guest ${i + 1}`,
                        avatarUrl: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${seeds[i % seeds.length]}&backgroundColor=f4f4f5,e4e4e7,d4d4d8,a1a1aa`,
                      };
                    }
                  )}
                />
              </div>

              {/* Special Requests */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  Special Dining Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="e.g. Celebrating an anniversary, dietary preferences, high chair required..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141722] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-[#ffbe33] transition-colors"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors cursor-pointer"
                >
                  Back
                </button>

                <div className="flex items-center gap-2">
                  <FuseButton
                    label={isSubmitting ? "Submitting Request..." : "Submit"}
                    undoLabel="Cancel"
                    doneLabel="Request Submitted"
                    background="#ffbe33"
                    color="#0a0a0a"
                    fuseColor="#0a0a0a"
                    size="md"
                    radius={16}
                    undoWindow={3000}
                    commitOn="fuseEnd"
                    disabled={isSubmitting || !customerEmail.trim()}
                    beforeArm={checkReservationConstraints}
                    onFuseEnd={executeReservation}
                    icon={<ArrowRight className="w-4 h-4 text-neutral-950" />}
                    className="font-black uppercase tracking-[0.16em] text-xs shadow-xl shadow-[#ffbe33]/30 hover:bg-[#ffc94d]"
                  />
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: SUBMISSION SUCCESS & PENDING STATUS FEEDBACK */}
        {/* ======================================================== */}
        {currentStep === 4 && confirmedBooking && (
          <motion.div
            variants={itemVariants}
            className="py-8 text-center space-y-6 max-w-lg mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Status: Pending Admin Approval
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Reservation Request Sent!
              </h3>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                Thank you,{" "}
                <span className="font-bold text-white">
                  {confirmedBooking.customer_name}
                </span>
                . Our maître d' and admin team have received your request.
              </p>
            </div>

            {/* Summary Card */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                <span className="text-neutral-400 font-medium">Date & Time</span>
                <span className="font-bold text-white">
                  {confirmedBooking.reservation_date} •{" "}
                  {selectedSlot && formatTimeSlot(selectedSlot.start_time)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                <span className="text-neutral-400 font-medium">Reserved Table</span>
                <span className="font-bold text-[#ffbe33]">
                  Table {selectedTable?.table_number} ({confirmedBooking.party_size} Guests)
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                <span className="text-neutral-400 font-medium">Notification Email</span>
                <span className="font-bold text-white">
                  {confirmedBooking.customer_email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-medium">Reference ID</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {confirmedBooking.id.slice(0, 8)}
                </span>
              </div>
            </div>

            {/* Explanatory Notice */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                We will get back to your email inbox at{" "}
                <strong className="text-white font-bold">{confirmedBooking.customer_email}</strong>{" "}
                as soon as possible! Once reviewed, you&apos;ll receive your confirmation update directly there.
              </p>
            </div>

            {/* Calendar & Next Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <AddToCalendarButton
                event={{
                  title: `Table Reservation: Calvary Fine Dining (Table ${selectedTable?.table_number || "Reserved"})`,
                  description: `Calvary table reservation for ${confirmedBooking.party_size} guests. Ref #${confirmedBooking.id.slice(0, 8)}. Address: 124 Heritage Lane, Indiranagar, Bengaluru. Phone: +91 98765 43210`,
                  location: "Calvary Fine Dining, 124 Heritage Lane, Indiranagar, Bengaluru",
                  startDate: confirmedBooking.reservation_date,
                  startTime: selectedSlot?.start_time || "19:00",
                  durationMinutes: selectedSlot?.duration_minutes || 90,
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedSlot(null);
                  setSelectedTable(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all cursor-pointer"
              >
                Make Another Reservation
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default CoachSchedulingCard;