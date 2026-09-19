"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { UserReservation } from "@/app/actions/user-reservations";
import { cancelUserReservation } from "@/app/actions/user-reservations";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UtensilsCrossed,
  Users,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Filter,
  X,
} from "lucide-react";

interface MyBookingsClientViewProps {
  user: {
    id: string;
    phone: string | null;
    email: string | null;
    name: string | null;
    avatar: string | null;
    role: string;
  };
  initialReservations: UserReservation[];
}

type FilterStatus = "ALL" | "CONFIRMED" | "PENDING" | "CANCELLED";

export default function MyBookingsClientView({
  user,
  initialReservations,
}: MyBookingsClientViewProps) {
  const [reservations, setReservations] = useState<UserReservation[]>(initialReservations);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-500/15 text-neutral-400 border border-neutral-500/30">
            {status}
          </span>
        );
    }
  };

  const handleCancelBooking = async (id: string) => {
    setCancellingId(id);
    setStatusMsg(null);

    try {
      const res = await cancelUserReservation(id);
      if (res.success) {
        setReservations((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "CANCELLED" } : item))
        );
        setStatusMsg({ type: "success", text: "Reservation cancelled successfully." });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ type: "error", text: res.error || "Failed to cancel reservation." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setCancellingId(null);
      setConfirmCancelModal(null);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  const countByStatus = {
    ALL: reservations.length,
    CONFIRMED: reservations.filter((r) => r.status === "CONFIRMED").length,
    PENDING: reservations.filter((r) => r.status === "PENDING").length,
    CANCELLED: reservations.filter((r) => r.status === "CANCELLED").length,
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-white flex flex-col selection:bg-[#ffbe33] selection:text-neutral-950">
      <Navbar
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffbe33]/10 border border-[#ffbe33]/20 text-[#ffbe33] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dining Reservations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              My Bookings
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl">
              Track real-time status of your upcoming table bookings, view past culinary reservations, and manage your bookings.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/profile"
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              My Profile
            </Link>
            <Link
              href="/reserve"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffbe33] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#e6a827] transition-all shadow-md cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Book a Table</span>
            </Link>
          </div>
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border transition-all ${
              statusMsg.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/15 border border-red-500/30 text-red-400"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#ffbe33]" />
            <span>Filter:</span>
          </div>

          {(["ALL", "CONFIRMED", "PENDING", "CANCELLED"] as FilterStatus[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                filter === st
                  ? "bg-[#ffbe33] text-black shadow-md"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              <span>{st === "ALL" ? "All Bookings" : st}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  filter === st ? "bg-black/20 text-black" : "bg-white/10 text-neutral-400"
                }`}
              >
                {countByStatus[st]}
              </span>
            </button>
          ))}
        </div>

        {/* Reservations Content */}
        {filteredReservations.length === 0 ? (
          <div className="bg-[#12141d] border border-white/10 rounded-3xl p-10 sm:p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
              <CalendarIcon className="w-8 h-8 text-[#ffbe33]" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {filter === "ALL" ? "No Reservations Found" : `No ${filter} Reservations`}
            </h3>
            <p className="text-neutral-400 text-xs max-w-sm mx-auto">
              {filter === "ALL"
                ? "You have not made any table reservations yet. Experience fine culinary craft by reserving your table today."
                : `You do not have any reservations marked as ${filter.toLowerCase()}.`}
            </p>
            {filter === "ALL" ? (
              <Link
                href="/reserve"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffbe33] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#e6a827] transition-all cursor-pointer"
              >
                <span>Reserve Table Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <span>View All Bookings</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReservations.map((res) => (
              <div
                key={res.id}
                className="bg-[#12141d] border border-white/10 rounded-3xl p-6 hover:border-[#ffbe33]/40 transition-all flex flex-col justify-between shadow-lg group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-neutral-400 font-semibold">
                      #{res.id.slice(0, 8).toUpperCase()}
                    </span>
                    {getStatusBadge(res.status)}
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-white flex items-center gap-2">
                      <span>
                        {res.restaurant_tables?.table_number
                          ? `Table ${res.restaurant_tables.table_number}`
                          : "Dining Table"}
                      </span>
                      <span className="text-neutral-400 font-normal text-xs flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#ffbe33]" />
                        {res.party_size} Guests
                      </span>
                    </h4>
                  </div>

                  <div className="space-y-2 p-3.5 rounded-2xl bg-[#090b0e] border border-white/5 text-xs text-neutral-300">
                    <div className="flex items-center gap-2.5 text-neutral-300">
                      <CalendarIcon className="w-4 h-4 text-[#ffbe33] shrink-0" />
                      <span className="font-medium">Date: {res.reservation_date}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-neutral-300">
                      <Clock className="w-4 h-4 text-[#ffbe33] shrink-0" />
                      <span className="font-medium">
                        Time: {res.reservation_slots?.start_time || "Confirmed Slot"}
                        {res.reservation_slots?.duration_minutes
                          ? ` (${res.reservation_slots.duration_minutes} mins)`
                          : ""}
                      </span>
                    </div>

                    {res.customer_phone && (
                      <div className="flex items-center gap-2.5 text-neutral-400 pt-1">
                        <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span>{res.customer_phone}</span>
                      </div>
                    )}

                    {res.customer_email && (
                      <div className="flex items-center gap-2.5 text-neutral-400">
                        <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{res.customer_email}</span>
                      </div>
                    )}

                    {res.special_request && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white/5 text-[11px] text-neutral-300 italic border border-white/5">
                        "{res.special_request}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3 text-[11px] text-neutral-500">
                  <div>
                    <span className="block text-neutral-400 font-medium">{res.customer_name}</span>
                    <span>Booked {new Date(res.created_at).toLocaleDateString()}</span>
                  </div>

                  {res.status !== "CANCELLED" && (
                    <button
                      type="button"
                      onClick={() => setConfirmCancelModal(res.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 font-bold text-[11px] uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {confirmCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-[#12141d] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Cancel Reservation?</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Are you sure you want to cancel this booking? This will release the table and slot for other guests.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancelModal(null)}
                  disabled={!!cancellingId}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelBooking(confirmCancelModal)}
                  disabled={!!cancellingId}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{cancellingId ? "Cancelling..." : "Confirm Cancel"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
