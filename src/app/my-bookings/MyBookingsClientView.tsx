"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { UserReservation } from "@/types/database";
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
  Edit3,
} from "lucide-react";
import EditReservationModal from "@/components/reservation/EditReservationModal";
import AddToCalendarButton from "@/components/reservation/AddToCalendarButton";
import DiningReviewModal from "@/components/reservation/DiningReviewModal";
import {
  useUserReservations,
  useCancelReservation,
  useSendReminder,
} from "@/hooks/api/use-reservations";
import { ParallaxHeroBg } from "@/components/sections/home/ParallaxHeroBg";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { toast } from "sonner";
import { Bell, Star } from "lucide-react";
import DatePicker6 from "@/components/date-picker-6";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

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
  const { data: reservations = initialReservations, refetch } = useUserReservations(initialReservations);
  const cancelMutation = useCancelReservation();
  const reminderMutation = useSendReminder();

  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState<string | null>(null);
  const [editingReservation, setEditingReservation] = useState<UserReservation | null>(null);
  const [reviewingReservation, setReviewingReservation] = useState<UserReservation | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const isReservationPast = (resDate: string, startTime?: string | null, durationMinutes: number = 90) => {
    try {
      const [y, m, d] = resDate.split("-").map(Number);
      if (!y || !m || !d) return false;
      const timeParts = (startTime || "00:00").split(":").map(Number);
      const hours = timeParts[0] || 0;
      const minutes = timeParts[1] || 0;
      const slotEnd = new Date(y, m - 1, d, hours, minutes + durationMinutes, 0);
      return slotEnd.getTime() <= Date.now();
    } catch {
      return false;
    }
  };

  const handleSendReminder = async (res: UserReservation) => {
    setSendingReminderId(res.id);
    try {
      await reminderMutation.mutateAsync(res.id);
      toast.success("Dining reminder sent!", {
        description: `An email itinerary with table details was delivered to ${res.customer_email}.`,
      });
    } catch (err: any) {
      toast.error("Reminder failed", { description: err.message || "Failed to dispatch reminder." });
    } finally {
      setSendingReminderId(null);
    }
  };

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
      await cancelMutation.mutateAsync(id);
      setStatusMsg({ type: "success", text: "Reservation cancelled successfully." });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to cancel reservation." });
    } finally {
      setCancellingId(null);
      setConfirmCancelModal(null);
    }
  };

  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>(undefined);

  const filteredReservations = reservations.filter((r) => {
    const matchesStatus = filter === "ALL" || r.status === filter;

    let matchesDate = true;
    if (dateRangeFilter?.from) {
      const resDateStr = r.reservation_date;
      const fromStr = format(dateRangeFilter.from, "yyyy-MM-dd");
      if (dateRangeFilter.to) {
        const toStr = format(dateRangeFilter.to, "yyyy-MM-dd");
        matchesDate = resDateStr >= fromStr && resDateStr <= toStr;
      } else {
        matchesDate = resDateStr === fromStr;
      }
    }

    return matchesStatus && matchesDate;
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

      {/* Header Banner with Parallax */}
      <section className="relative overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <ParallaxHeroBg
          src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop"
          alt="Calvary Dining Reservations"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#090b0e]" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <RevealOnScroll direction="up" delay={100}>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffbe33]/10 border border-[#ffbe33]/20 text-[#ffbe33] text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dining Reservations</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                My Bookings
              </h1>
              <p className="text-neutral-300 text-xs sm:text-sm max-w-xl font-light">
                Track real-time status of your upcoming table bookings, view past culinary reservations, and manage your bookings.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="left" delay={200}>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/profile"
                className="px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all cursor-pointer"
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
          </RevealOnScroll>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">

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

        {/* Filter Pills Bar & Date Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mr-1 shrink-0">
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
                    ? "bg-[#ffbe33] text-black shadow-md font-black"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <span>{st === "ALL" ? "All Bookings" : st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    filter === st ? "bg-black/20 text-black font-extrabold" : "bg-white/10 text-neutral-400"
                  }`}
                >
                  {countByStatus[st]}
                </span>
              </button>
            ))}
          </div>

          {/* Date Picker Filter on the right using @date-picker-6 (Range Mode) */}
          <div className="w-full sm:w-auto shrink-0">
            <DatePicker6
              mode="range"
              range={dateRangeFilter}
              onRangeChange={setDateRangeFilter}
              placeholder="Filter by Date Range"
              className="w-full sm:w-64"
              align="end"
            />
          </div>
        </div>

        {/* Reservations Content */}
        {filteredReservations.length === 0 ? (
          <div className="bg-[#12141d] border border-white/10 rounded-3xl p-10 sm:p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
              <CalendarIcon className="w-8 h-8 text-[#ffbe33]" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {filter === "ALL" && !dateRangeFilter?.from ? "No Reservations Found" : "No Matching Reservations"}
            </h3>
            <p className="text-neutral-400 text-xs max-w-sm mx-auto">
              {filter === "ALL" && !dateRangeFilter?.from
                ? "You have not made any table reservations yet. Experience fine culinary craft by reserving your table today."
                : "No reservations found matching your current filter criteria."}
            </p>
            {filter === "ALL" && !dateRangeFilter?.from ? (
              <Link
                href="/reserve"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffbe33] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#e6a827] transition-all cursor-pointer"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Book a Table Now</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFilter("ALL");
                  setDateRangeFilter(undefined);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredReservations.map((res) => (
              <div
                key={res.id}
                className="bg-gradient-to-b from-[#131520] to-[#0c0e15] border border-white/10 rounded-3xl p-7 sm:p-8 hover:border-[#ffbe33]/40 transition-all duration-300 flex flex-col justify-between shadow-2xl group relative"
              >
                <div className="space-y-6">
                  {/* Header: Ref #, Zone & Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-neutral-300 font-bold tracking-wider px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        #{res.id.slice(0, 8).toUpperCase()}
                      </span>
                      {res.restaurant_tables?.zone && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#ffbe33]/10 border border-[#ffbe33]/25 text-[#ffbe33] text-xs font-bold uppercase tracking-wider">
                          {res.restaurant_tables.zone}
                        </span>
                      )}
                      {res.restaurant_tables?.is_vip && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                          VIP
                        </span>
                      )}
                    </div>
                    {getStatusBadge(res.status)}
                  </div>

                  {/* Title & Party Size Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div>
                      <h4 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                        {res.restaurant_tables?.table_number
                          ? `Table ${res.restaurant_tables.table_number}`
                          : "Dining Table"}
                      </h4>
                      {res.restaurant_tables?.description && (
                        <p className="text-xs text-neutral-400 mt-1 font-normal max-w-md">
                          {res.restaurant_tables.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-200 font-bold text-xs sm:text-sm flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                        <Users className="w-4 h-4 text-[#ffbe33]" />
                        {res.party_size} Guests
                      </span>
                      {res.restaurant_tables?.shape && (
                        <span className="text-neutral-400 text-xs capitalize bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                          {res.restaurant_tables.shape}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Booking Details Box */}
                  <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-[#080a10]/90 border border-white/5 text-xs sm:text-sm text-neutral-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-neutral-200">
                        <div className="w-9 h-9 rounded-xl bg-[#ffbe33]/10 border border-[#ffbe33]/25 flex items-center justify-center shrink-0">
                          <CalendarIcon className="w-4 h-4 text-[#ffbe33]" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Date</div>
                          <div className="font-bold text-white text-sm">{res.reservation_date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-neutral-200">
                        <div className="w-9 h-9 rounded-xl bg-[#ffbe33]/10 border border-[#ffbe33]/25 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-[#ffbe33]" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Time Slot</div>
                          <div className="font-bold text-white text-sm">
                            {res.reservation_slots?.start_time || "Confirmed Slot"}
                            {res.reservation_slots?.duration_minutes
                              ? ` (${res.reservation_slots.duration_minutes}m)`
                              : ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-neutral-400 border-t border-white/5">
                      {res.customer_phone && (
                        <div className="flex items-center gap-2 pt-2 sm:pt-0">
                          <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span className="font-medium text-neutral-300">{res.customer_phone}</span>
                        </div>
                      )}

                      {res.customer_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span className="truncate max-w-[260px] text-neutral-300">{res.customer_email}</span>
                        </div>
                      )}
                    </div>

                    {res.special_request && (
                      <div className="mt-2 p-3.5 rounded-xl bg-white/5 text-xs text-neutral-300 italic border border-white/5 leading-relaxed">
                        "{res.special_request}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-4 text-xs text-neutral-500">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-200 font-bold text-sm">{res.customer_name}</span>
                    <span className="text-[11px] text-neutral-400 font-medium">Booked {new Date(res.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {/* Primary actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {res.status !== "CANCELLED" && !isReservationPast(res.reservation_date, res.reservation_slots?.start_time) && (
                        <AddToCalendarButton
                          buttonSize="md"
                          event={{
                            title: `Calvary Dining: ${res.restaurant_tables?.table_number ? `Table ${res.restaurant_tables.table_number}` : "Table Reservation"}`,
                            description: `Reservation for ${res.party_size} guests at Calvary Fine Dining. Booking Ref: #${res.id.slice(0, 8)}. Phone: +91 98765 43210`,
                            location: "Calvary Fine Dining, 124 Heritage Lane, Indiranagar, Bengaluru",
                            startDate: res.reservation_date,
                            startTime: res.reservation_slots?.start_time || "19:00",
                            durationMinutes: res.reservation_slots?.duration_minutes || 90,
                          }}
                        />
                      )}

                      {res.status === "CONFIRMED" && !isReservationPast(res.reservation_date, res.reservation_slots?.start_time) && (
                        <button
                          type="button"
                          onClick={() => handleSendReminder(res)}
                          disabled={sendingReminderId === res.id}
                          className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 hover:bg-blue-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                          title="Send email reminder with itinerary to your inbox"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>{sendingReminderId === res.id ? "Sending..." : "Reminder"}</span>
                        </button>
                      )}

                      {isReservationPast(res.reservation_date, res.reservation_slots?.start_time) && res.status !== "CANCELLED" && (
                        <button
                          type="button"
                          onClick={() => setReviewingReservation(res)}
                          className="px-4 py-2.5 rounded-xl bg-[#ffbe33]/15 border border-[#ffbe33]/30 text-[#ffbe33] hover:bg-[#ffbe33] hover:text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{res.feedback_rating ? `${res.feedback_rating}★ Reviewed` : "Rate Dining"}</span>
                        </button>
                      )}
                    </div>

                    {/* Modification actions */}
                    {res.status !== "CANCELLED" && !isReservationPast(res.reservation_date, res.reservation_slots?.start_time) && (
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingReservation(res)}
                          className="px-4 py-2.5 rounded-xl bg-[#ffbe33]/10 border border-[#ffbe33]/30 text-[#ffbe33] font-bold text-xs uppercase tracking-wider hover:bg-[#ffbe33] hover:text-neutral-950 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Alter</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmCancelModal(res.id)}
                          className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 font-bold text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alter Reservation Modal */}
        <EditReservationModal
          isOpen={!!editingReservation}
          reservation={editingReservation}
          onClose={() => setEditingReservation(null)}
          onSuccess={() => {
            setEditingReservation(null);
          }}
        />

        {/* Dining Review & Star Rating Modal */}
        <DiningReviewModal
          isOpen={!!reviewingReservation}
          reservation={reviewingReservation}
          onClose={() => setReviewingReservation(null)}
          onSuccess={() => {
            setReviewingReservation(null);
          }}
        />

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
