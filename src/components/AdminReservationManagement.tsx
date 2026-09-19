"use client";

import React, { useState, useTransition } from "react";
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
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adminApproveReservation,
  adminRejectReservation,
} from "@/app/actions/restaurant";
import type { ReservationStatus } from "@/types/database";

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
  const [reservations, setReservations] = useState<ReservationWithRelations[]>(initialReservations);
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "CONFIRMED" | "CANCELLED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Filter calculations
  const pendingCount = reservations.filter((r) => r.status === "PENDING").length;
  const confirmedCount = reservations.filter((r) => r.status === "CONFIRMED").length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookingsCount = reservations.filter(
    (r) => r.reservation_date === todayStr && r.status !== "CANCELLED"
  ).length;

  const filteredReservations = reservations.filter((r) => {
    if (filterTab !== "ALL" && r.status !== filterTab) return false;
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
  const handleApprove = (id: string) => {
    startTransition(async () => {
      try {
        const res = await adminApproveReservation(id);
        if (res.success && res.reservation) {
          // Update local state
          setReservations((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: "CONFIRMED" } : item
            )
          );

          const tableName = res.reservation.restaurant_tables?.table_number
            ? `Table ${res.reservation.restaurant_tables.table_number}`
            : "Table";

          setActionSuccessMessage(
            `Table locked! ${tableName} is officially reserved for ${res.reservation.customer_name}.`
          );
          setTimeout(() => setActionSuccessMessage(null), 4000);
        }
      } catch (err: any) {
        console.error("Failed to approve reservation:", err);
      }
    });
  };

  // Action: Reject
  const handleReject = (id: string) => {
    if (!confirm("Are you sure you want to decline this reservation request?")) return;
    startTransition(async () => {
      try {
        const res = await adminRejectReservation(id);
        if (res.success) {
          setReservations((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: "CANCELLED" } : item
            )
          );
          setActionSuccessMessage("Reservation was cancelled. The table is now released.");
        }
      } catch (err: any) {
        console.error("Failed to cancel reservation:", err);
      }
    });
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-[#12141e] p-1.5 rounded-2xl border border-white/10">
          {(["ALL", "PENDING", "CONFIRMED", "CANCELLED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer",
                filterTab === tab
                  ? "bg-[#ffbe33] text-neutral-950 font-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              {tab === "ALL" && `All (${reservations.length})`}
              {tab === "PENDING" && `Pending (${pendingCount})`}
              {tab === "CONFIRMED" && `Confirmed (${confirmedCount})`}
              {tab === "CANCELLED" && "Cancelled"}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, email, table..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#12141e] border border-white/10 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-[#ffbe33] transition-colors"
          />
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
            const isPendingItem = item.status === "PENDING";
            const isConfirmed = item.status === "CONFIRMED";
            const isCancelled = item.status === "CANCELLED";

            const tableName = item.restaurant_tables?.table_number
              ? `Table ${item.restaurant_tables.table_number}`
              : "Table";

            const timeSlot = formatTime(item.reservation_slots?.start_time);

            // Pre-composed direct mailto link for this reservation
            const approvalSubject = encodeURIComponent(`Reservation Approved: ${tableName} at Calvary Restaurant`);
            const approvalBody = encodeURIComponent(
              `Dear ${item.customer_name},\n\n` +
              `We are pleased to inform you that your table reservation has been APPROVED!\n\n` +
              `• Date: ${item.reservation_date}\n` +
              `• Time: ${timeSlot}\n` +
              `• Table: ${tableName} (${item.restaurant_tables?.capacity || item.party_size} Guests)\n` +
              `• Party Size: ${item.party_size} Guests\n\n` +
              `Your table is now locked and confirmed. We look forward to hosting you at Calvary!\n\n` +
              `Warm regards,\n` +
              `Calvary Restaurant Management`
            );
            const directMailto = `mailto:${item.customer_email}?subject=${approvalSubject}&body=${approvalBody}`;

            return (
              <div
                key={item.id}
                className={cn(
                  "p-5 sm:p-6 rounded-3xl border transition-all duration-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6",
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

                  {/* Special Dining Request */}
                  {item.special_request && (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 mt-2 max-w-xl">
                      <span className="font-bold text-[#ffbe33]">Guest Note: </span>
                      {item.special_request}
                    </div>
                  )}
                </div>

                {/* Right: Admin Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">
                  {/* Reply Email Action (Only when pending review) */}
                  {isPendingItem && (
                    <a
                      href={directMailto}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 transition-all shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#ffbe33]" />
                      <span>Reply to Email</span>
                    </a>
                  )}

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

                  {/* Cancel / Decline Action */}
                  {!isCancelled && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReject(item.id)}
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
    </div>
  );
}
