"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Users,
  Utensils,
  Lock,
  Unlock,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminReservations,
  useApproveReservation,
  useRejectReservation,
  useSendAdminEmail,
} from "@/hooks/api/use-admin-reservations";
import { toast } from "sonner";
import type { ReservationStatus } from "@/types/database";
import DatePicker6 from "@/components/date-picker-6";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

export interface ReservationWithRelations {
  id: string;
  user_id: string | null;
  table_id: number;
  slot_id: number;
  reservation_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  party_size: number;
  special_request: string | null;
  cancellation_reason?: string | null;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
  restaurant_tables?: {
    id: number;
    table_number: string;
    capacity: number;
  } | null;
  reservation_slots?: {
    id: number;
    start_time: string;
    duration_minutes: number;
  } | null;
}

interface AdminReservationManagementProps {
  initialReservations: ReservationWithRelations[];
}

export default function AdminReservationManagement({
  initialReservations,
}: AdminReservationManagementProps) {
  // Helper to check if reservation date & slot time has already passed
  const isReservationPast = (resDate: string, startTime?: string | null, durationMinutes: number = 90) => {
    try {
      const [y, m, d] = resDate.split("-").map(Number);
      if (!y || !m || !d) return false;
      const timeParts = (startTime || "00:00").split(":").map(Number);
      const hours = timeParts[0] || 0;
      const minutes = timeParts[1] || 0;
      // Consider completed if the dining session (start + duration) has concluded
      const slotEnd = new Date(y, m - 1, d, hours, minutes + durationMinutes, 0);
      return slotEnd.getTime() <= Date.now();
    } catch {
      return false;
    }
  };

  const { data: reservations = [] } = useAdminReservations(initialReservations);
  const approveMutation = useApproveReservation();
  const rejectMutation = useRejectReservation();
  const sendEmailMutation = useSendAdminEmail();
  const isPending = approveMutation.isPending || rejectMutation.isPending || sendEmailMutation.isPending;
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>(undefined);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Filter calculations
  const pendingCount = reservations.filter(
    (r) => r.status === "PENDING" && !isReservationPast(r.reservation_date, r.reservation_slots?.start_time, r.reservation_slots?.duration_minutes)
  ).length;

  const confirmedCount = reservations.filter(
    (r) => r.status === "CONFIRMED" && !isReservationPast(r.reservation_date, r.reservation_slots?.start_time, r.reservation_slots?.duration_minutes)
  ).length;

  const cancelledCount = reservations.filter((r) => r.status === "CANCELLED").length;

  const completedCount = reservations.filter((r) => {
    if (r.status === "COMPLETED") return true;
    if (r.status === "CANCELLED") return false;
    return isReservationPast(r.reservation_date, r.reservation_slots?.start_time, r.reservation_slots?.duration_minutes);
  }).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookingsCount = reservations.filter(
    (r) => r.reservation_date === todayStr && r.status !== "CANCELLED"
  ).length;

  const filteredReservations = reservations.filter((r) => {
    const isPast = isReservationPast(
      r.reservation_date,
      r.reservation_slots?.start_time,
      r.reservation_slots?.duration_minutes
    );

    if (filterTab === "COMPLETED") {
      if (r.status === "COMPLETED") return true;
      if (r.status === "CANCELLED") return false;
      if (!isPast) return false;
    } else if (filterTab === "PENDING") {
      if (r.status !== "PENDING" || isPast) return false;
    } else if (filterTab === "CONFIRMED") {
      if (r.status !== "CONFIRMED" || isPast) return false;
    } else if (filterTab === "CANCELLED") {
      if (r.status !== "CANCELLED") return false;
    }

    // Date Range filtering
    if (dateRangeFilter?.from) {
      const resDateStr = r.reservation_date;
      const fromStr = format(dateRangeFilter.from, "yyyy-MM-dd");
      if (dateRangeFilter.to) {
        const toStr = format(dateRangeFilter.to, "yyyy-MM-dd");
        if (resDateStr < fromStr || resDateStr > toStr) return false;
      } else {
        if (resDateStr !== fromStr) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = r.customer_name.toLowerCase().includes(q);
      const emailMatch = r.customer_email.toLowerCase().includes(q);
      const phoneMatch = r.customer_phone.toLowerCase().includes(q);
      const tableMatch = r.restaurant_tables?.table_number.toLowerCase().includes(q);
      const dateMatch = r.reservation_date.includes(q);
      return nameMatch || emailMatch || phoneMatch || tableMatch || dateMatch;
    }
    return true;
  });

  // Action: Approve & Lock Table
  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      const item = reservations.find((r) => r.id === id);
      const tableName = item?.restaurant_tables?.table_number
        ? `Table ${item.restaurant_tables.table_number}`
        : "Table";
      const customerName = item?.customer_name || "Guest";

      const msg = `Table locked! ${tableName} is officially reserved for ${customerName}.`;
      setActionSuccessMessage(msg);
      toast.success("Reservation Approved & Locked", {
        description: `${tableName} confirmed for ${customerName}. Confirmation email sent.`,
      });
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      const msg = err?.message || "Failed to approve reservation.";
      console.error("Failed to approve reservation:", err);
      toast.error("Error", { description: msg });
    }
  };

  const [declineModal, setDeclineModal] = useState<{
    isOpen: boolean;
    reservation: ReservationWithRelations | null;
    reason: string;
  }>({
    isOpen: false,
    reservation: null,
    reason: "",
  });

  const [replyModal, setReplyModal] = useState<{
    isOpen: boolean;
    reservation: ReservationWithRelations | null;
    subject: string;
    message: string;
  }>({
    isOpen: false,
    reservation: null,
    subject: "",
    message: "",
  });

  // Action: Open Reply Email Modal
  const handleOpenReplyModal = (item: ReservationWithRelations) => {
    const tableName = item.restaurant_tables?.table_number
      ? `Table ${item.restaurant_tables.table_number}`
      : "Table";
    setReplyModal({
      isOpen: true,
      reservation: item,
      subject: `Update regarding your reservation at Calvary Restaurant (${tableName})`,
      message: "",
    });
  };

  // Action: Confirm Send Email Message
  const handleConfirmSendReply = async () => {
    if (!replyModal.reservation) return;
    const item = replyModal.reservation;
    const subject = replyModal.subject.trim() || "Update regarding your reservation at Calvary Restaurant";
    const message = replyModal.message.trim();

    if (!message) {
      toast.error("Message required", {
        description: "Please enter a message to send to the guest.",
      });
      return;
    }

    try {
      await sendEmailMutation.mutateAsync({
        reservationId: item.id,
        subject,
        message,
      });

      const msg = `Email dispatched successfully to ${item.customer_email}.`;
      setActionSuccessMessage(msg);
      toast.success("Email Sent", {
        description: `Your custom message was sent to ${item.customer_email}.`,
      });
      setReplyModal({
        isOpen: false,
        reservation: null,
        subject: "",
        message: "",
      });
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      const msg = err?.message || "Failed to send email.";
      console.error("Failed to send email:", err);
      toast.error("Error", { description: msg });
    }
  };

  // Action: Open Decline Modal
  const handleOpenDeclineModal = (item: ReservationWithRelations) => {
    // Check if table is already confirmed
    if (item.status === "CONFIRMED") {
      toast.error("Action not permitted", {
        description: "Admin cannot decline a reservation after the table has been booked & confirmed.",
      });
      return;
    }

    setDeclineModal({
      isOpen: true,
      reservation: item,
      reason: "",
    });
  };

  // Action: Confirm Reject with Optional Message
  const handleConfirmReject = async () => {
    if (!declineModal.reservation) return;
    const item = declineModal.reservation;
    const optionalReason = declineModal.reason.trim();

    try {
      await rejectMutation.mutateAsync({
        id: item.id,
        reason: optionalReason || undefined,
      });

      const msg = `Reservation for ${item.customer_name} was declined. Cancellation notice sent to ${item.customer_email}.`;
      setActionSuccessMessage(msg);
      toast.info("Reservation Declined", {
        description: `Cancellation email dispatched to ${item.customer_email}.`,
      });
      setDeclineModal({ isOpen: false, reservation: null, reason: "" });
    } catch (err: any) {
      const msg = err?.message || "Failed to decline reservation.";
      console.error("Failed to decline reservation:", err);
      toast.error("Error", { description: msg });
    }
  };

  // Time format helper
  const formatTime = (timeStr?: string) => {
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll when decline modal or reply modal is open
  useEffect(() => {
    if (declineModal.isOpen || replyModal.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [declineModal.isOpen, replyModal.isOpen]);

  const declineModalContent = declineModal.isOpen && declineModal.reservation ? (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative bg-[#141724] border border-white/10 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl shadow-black/90 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Decline Reservation Request
              </h3>
              <p className="text-xs text-neutral-400">
                #{declineModal.reservation.id.slice(0, 8).toUpperCase()} • {declineModal.reservation.customer_name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDeclineModal({ isOpen: false, reservation: null, reason: "" })}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Reservation Summary */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-neutral-300">
          <div className="flex justify-between">
            <span className="text-neutral-500">Date & Slot:</span>
            <span className="font-semibold text-white">
              {declineModal.reservation.reservation_date} • {formatTime(declineModal.reservation.reservation_slots?.start_time)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Party / Table:</span>
            <span className="font-semibold text-white">
              {declineModal.reservation.party_size} Guests (Table {declineModal.reservation.restaurant_tables?.table_number || "TBD"})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Customer Email:</span>
            <span className="font-semibold text-neutral-200">
              {declineModal.reservation.customer_email}
            </span>
          </div>
        </div>

        {/* Decline Reason Input (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
            <span>Reason / Message to Guest</span>
            <span className="text-[11px] text-neutral-500 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            value={declineModal.reason}
            onChange={(e) => setDeclineModal({ ...declineModal, reason: e.target.value })}
            placeholder="e.g. Fully booked for private gala dinner / Kitchen maintenance during this slot..."
            rows={3}
            className="w-full p-3 rounded-xl bg-[#0d0f15] border border-white/10 text-white placeholder:text-neutral-600 text-xs focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
          />
          <p className="text-[11px] text-neutral-500">
            A notification email will be sent to the customer.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setDeclineModal({ isOpen: false, reservation: null, reason: "" })}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Keep Request
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirmReject}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>{isPending ? "Declining..." : "Confirm & Send Email"}</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const replyModalContent = replyModal.isOpen && replyModal.reservation ? (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative bg-[#141724] border border-white/10 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl shadow-black/90 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffbe33]/15 border border-[#ffbe33]/30 flex items-center justify-center text-[#ffbe33] shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Reply to Guest
              </h3>
              <p className="text-xs text-neutral-400">
                To {replyModal.reservation.customer_name} ({replyModal.reservation.customer_email})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setReplyModal({ isOpen: false, reservation: null, subject: "", message: "" })}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Reservation Summary */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-neutral-300">
          <div className="flex justify-between">
            <span className="text-neutral-500">Date & Slot:</span>
            <span className="font-semibold text-white">
              {replyModal.reservation.reservation_date} • {formatTime(replyModal.reservation.reservation_slots?.start_time)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Party / Table:</span>
            <span className="font-semibold text-white">
              {replyModal.reservation.party_size} Guests (Table {replyModal.reservation.restaurant_tables?.table_number || "TBD"})
            </span>
          </div>
          {replyModal.reservation.special_request && (
            <div className="pt-1 border-t border-white/5 text-[11px] text-neutral-400 flex items-start gap-1.5">
              <span className="text-[#ffbe33] font-semibold shrink-0">Special Note:</span>
              <span className="italic line-clamp-2">"{replyModal.reservation.special_request}"</span>
            </div>
          )}
        </div>

        {/* Email Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Email Subject
          </label>
          <input
            type="text"
            value={replyModal.subject}
            onChange={(e) => setReplyModal({ ...replyModal, subject: e.target.value })}
            placeholder="Subject of the email"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0f15] border border-white/10 text-white placeholder:text-neutral-600 text-xs focus:outline-none focus:border-[#ffbe33] transition-colors"
          />
        </div>

        {/* Message Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
            Message Content
          </label>
          <textarea
            value={replyModal.message}
            onChange={(e) => setReplyModal({ ...replyModal, message: e.target.value })}
            placeholder="Type your message to the guest here..."
            rows={4}
            className="w-full p-3 rounded-xl bg-[#0d0f15] border border-white/10 text-white placeholder:text-neutral-600 text-xs focus:outline-none focus:border-[#ffbe33] transition-colors resize-none"
          />
          <p className="text-[11px] text-neutral-500">
            Email will be sent to {replyModal.reservation.customer_email}.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setReplyModal({ isOpen: false, reservation: null, subject: "", message: "" })}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending || !replyModal.message.trim()}
            onClick={handleConfirmSendReply}
            className="flex-1 py-2.5 rounded-xl bg-[#ffbe33] hover:bg-[#ffc94d] disabled:opacity-50 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#ffbe33]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isPending ? "Sending..." : "Send Email"}</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-8">
      {/* Metric Counters Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals */}
        <div
          onClick={() => setFilterTab("PENDING")}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer",
            filterTab === "PENDING"
              ? "bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10"
              : "bg-[#131622]/80 border-white/10 hover:border-white/20"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">{pendingCount}</div>
          <p className="text-[11px] text-neutral-400 mt-1">Requires admin review & email approval</p>
        </div>

        {/* Confirmed & Locked */}
        <div
          onClick={() => setFilterTab("CONFIRMED")}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer",
            filterTab === "CONFIRMED"
              ? "bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
              : "bg-[#131622]/80 border-white/10 hover:border-white/20"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Confirmed (Locked)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">{confirmedCount}</div>
          <p className="text-[11px] text-neutral-400 mt-1">Officially locked tables</p>
        </div>

        {/* Today's Bookings */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#131622]/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ffbe33]">
              Today&apos;s Bookings
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ffbe33]/10 border border-[#ffbe33]/25 flex items-center justify-center text-[#ffbe33]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">{todayBookingsCount}</div>
          <p className="text-[11px] text-neutral-400 mt-1">{todayStr}</p>
        </div>

        {/* Total Registered */}
        <div
          onClick={() => setFilterTab("ALL")}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer",
            filterTab === "ALL"
              ? "bg-white/10 border-white/30"
              : "bg-[#131622]/80 border-white/10 hover:border-white/20"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Total Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">{reservations.length}</div>
          <p className="text-[11px] text-neutral-400 mt-1">Across all dates</p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Filter Tabs - Single Line (Non-wrapping) */}
        <div className="flex items-center flex-nowrap overflow-x-auto scrollbar-none gap-1 sm:gap-1.5 bg-[#12141e] p-1.5 rounded-2xl border border-white/10 shrink-0">
          {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5",
                filterTab === tab
                  ? "bg-[#ffbe33] text-neutral-950 font-black shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <span>{tab === "ALL" ? "All Bookings" : tab}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-md font-mono",
                  filterTab === tab
                    ? "bg-black/20 text-neutral-950 font-black"
                    : "bg-white/10 text-neutral-400"
                )}
              >
                {tab === "ALL" && reservations.length}
                {tab === "PENDING" && pendingCount}
                {tab === "CONFIRMED" && confirmedCount}
                {tab === "COMPLETED" && completedCount}
                {tab === "CANCELLED" && cancelledCount}
              </span>
            </button>
          ))}
        </div>

        {/* Right side: Search Input & DatePicker6 Range Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-52 lg:w-60">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, table..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#12141e] border border-white/10 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-[#ffbe33] transition-colors"
            />
          </div>

          {/* DateRange Filter using DatePicker6 */}
          <div className="w-full sm:w-52 lg:w-60">
            <DatePicker6
              mode="range"
              range={dateRangeFilter}
              onRangeChange={setDateRangeFilter}
              placeholder="Filter by Date Range"
              className="w-full"
              align="end"
            />
          </div>
        </div>
      </div>

      {/* Reservation Requests List */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center bg-[#131622]/60 rounded-3xl border border-white/10 text-neutral-400 text-sm space-y-2">
            <Utensils className="w-8 h-8 mx-auto text-neutral-500" />
            <p className="font-bold text-white">No reservation records found</p>
            <p className="text-xs text-neutral-500">
              There are no reservations matching your current filter.
            </p>
          </div>
        ) : (
          filteredReservations.map((item) => {
            const isPast = isReservationPast(
              item.reservation_date,
              item.reservation_slots?.start_time,
              item.reservation_slots?.duration_minutes
            );
            const isCompleted = item.status === "COMPLETED" || (item.status !== "CANCELLED" && isPast);
            const isPendingItem = item.status === "PENDING" && !isPast;
            const isConfirmed = item.status === "CONFIRMED" && !isPast;
            const isCancelled = item.status === "CANCELLED";

            const tableName = item.restaurant_tables?.table_number
              ? `Table ${item.restaurant_tables.table_number}`
              : "Table";

            const timeSlot = formatTime(item.reservation_slots?.start_time);

            return (
              <div
                key={item.id}
                className={cn(
                  "p-5 sm:p-6 rounded-3xl border transition-all duration-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6",
                  isCompleted &&
                    "bg-[#0e1017]/90 border-blue-500/25 shadow-sm",
                  isPendingItem &&
                    "bg-[#151928] border-amber-500/40 shadow-lg shadow-amber-500/5",
                  isConfirmed &&
                    "bg-[#11141e] border-emerald-500/30",
                  isCancelled &&
                    "bg-[#0d0f14]/80 border-white/5 opacity-60"
                )}
              >
                {/* Left: Customer & Table Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base sm:text-lg font-extrabold text-white">
                      {item.customer_name}
                    </span>

                    {/* Status Badge */}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/15 border border-blue-500/30 text-blue-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed (Past)
                      </span>
                    )}

                    {isPendingItem && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300 animate-pulse">
                        <Clock className="w-3 h-3" />
                        Pending Approval
                      </span>
                    )}

                    {isConfirmed && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        <Lock className="w-3 h-3" />
                        Table Locked
                      </span>
                    )}

                    {isCancelled && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-neutral-800 border border-white/10 text-neutral-400">
                        Cancelled
                      </span>
                    )}

                    <span className="text-[10px] text-neutral-500 font-mono">
                      #{item.id.slice(0, 8)}
                    </span>
                  </div>

                  {/* Booking Coordinates */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#ffbe33]" />
                      <span className="font-semibold text-white">{item.reservation_date}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#ffbe33]" />
                      <span className="font-semibold text-white">{timeSlot}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-[#a3f900]" />
                      <span className="font-black text-[#a3f900]">{tableName}</span>
                      <span className="text-neutral-500 text-[10px]">
                        ({item.restaurant_tables?.capacity || item.party_size} Seats)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{item.party_size} Guests</span>
                    </div>
                  </div>

                  {/* Customer Contact Coordinates */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 pt-1">
                    <a
                      href={`mailto:${item.customer_email}`}
                      className="flex items-center gap-1 hover:text-white transition-colors underline"
                    >
                      <Mail className="w-3 h-3 text-neutral-400" />
                      <span>{item.customer_email}</span>
                    </a>

                    <a
                      href={`tel:${item.customer_phone}`}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <span>{item.customer_phone}</span>
                    </a>
                  </div>

                  {/* Special Dining Request (Guest Notes) */}
                  {item.special_request && (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 mt-2 max-w-xl flex items-start gap-2">
                      <span className="font-bold text-[#ffbe33] shrink-0">Special Notes:</span>
                      <span className="leading-relaxed">{item.special_request}</span>
                    </div>
                  )}

                  {/* Decline / Cancellation Reason */}
                  {item.cancellation_reason && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 mt-2 max-w-xl flex items-start gap-2">
                      <span className="font-bold text-rose-400 shrink-0">Decline Reason:</span>
                      <span className="leading-relaxed text-rose-200">{item.cancellation_reason}</span>
                    </div>
                  )}
                </div>

                {/* Right: Admin Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">
                  {/* Reply Email Action (Opens interactive in-app modal like Decline) */}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleOpenReplyModal(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/25 text-white text-xs font-bold border border-white/15 transition-all shadow-sm cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#ffbe33]" />
                    <span>Reply to Email</span>
                  </button>

                  {/* Approve / Lock Table Button */}
                  {isPendingItem && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleApprove(item.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Lock Table</span>
                    </button>
                  )}

                  {/* Cancel / Decline Action: ONLY allowed for PENDING reservations (Admin cannot decline after table is booked/confirmed) */}
                  {isPendingItem && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleOpenDeclineModal(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Render modals directly into document.body to prevent parent translation offsets */}
      {mounted && declineModalContent && createPortal(declineModalContent, document.body)}
      {mounted && replyModalContent && createPortal(replyModalContent, document.body)}
    </div>
  );
}
