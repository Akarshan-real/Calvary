"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowRight,
  UtensilsCrossed,
  Calendar as CalendarIcon,
  Camera,
  Save,
  Trash2,
  X,
  Edit3,
  Star,
} from "lucide-react";
import EditReservationModal from "@/components/reservation/EditReservationModal";
import AddToCalendarButton from "@/components/reservation/AddToCalendarButton";
import DiningReviewModal from "@/components/reservation/DiningReviewModal";
import {
  User02Icon,
  SmartPhone01Icon,
  Mail01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { useProfile, useUpdateProfile, useDeleteAccount } from "@/hooks/api/use-profile";
import { useUserReservations } from "@/hooks/api/use-reservations";
import type { UserReservation, Profile } from "@/types/database";
import FileUpload from "@/components/kokonutui/file-upload";
import { ProfileEditableField } from "@/components/ProfileEditableField";
import { BirthdayCalendar } from "@/components/ui/simple-calender";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
interface ProfileClientViewProps {
  user: {
    id: string;
    phone: string | null;
    email: string | null;
  };
  profile: Profile | null;
  initialReservations: UserReservation[];
}

export default function ProfileClientView({
  user,
  profile,
  initialReservations,
}: ProfileClientViewProps) {
  const { data: currentProfile } = useProfile(profile);
  const updateProfileMutation = useUpdateProfile();
  const deleteAccountMutation = useDeleteAccount();
  const { data: reservations = initialReservations } = useUserReservations(initialReservations);

  const [activeTab, setActiveTab] = useState<"profile" | "reservations">("profile");

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || user.email || "");
  const [phone, setPhone] = useState(profile?.phone || user.phone || "");
  const [birthday, setBirthday] = useState(profile?.birthday || "");
  const [editingReservation, setEditingReservation] = useState<UserReservation | null>(null);
  const [reviewingReservation, setReviewingReservation] = useState<UserReservation | null>(null);

  // Avatar & FileUpload Modal State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Initial values to check if any field has changed
  const [initialValues, setInitialValues] = useState({
    fullName: profile?.full_name || "",
    email: profile?.email || user.email || "",
    phone: profile?.phone || user.phone || "",
    birthday: profile?.birthday || "",
  });

  const isChanged =
    fullName !== initialValues.fullName ||
    email !== initialValues.email ||
    phone !== initialValues.phone ||
    birthday !== initialValues.birthday;

  // Permanently delete user account
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setStatusMsg(null);

    try {
      await deleteAccountMutation.mutateAsync();
      toast.success("Account deleted", { description: "Your account data has been removed." });
      window.location.href = "/";
    } catch (err: any) {
      const msg = err.message || "An error occurred while deleting account.";
      setStatusMsg({ type: "error", text: msg });
      toast.error("Error", { description: msg });
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      await updateProfileMutation.mutateAsync({
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || null,
        birthday: birthday || null,
      });

      setInitialValues({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        birthday: birthday || "",
      });
      setStatusMsg({ type: "success", text: "Profile details updated successfully!" });
      toast.success("Profile updated!", { description: "Your dining details have been saved." });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred.";
      setStatusMsg({ type: "error", text: msg });
      toast.error("Update error", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload via Kokonut UI FileUpload
  const handleFileUploadSuccess = async (file: File) => {
    setUploadingAvatar(true);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setAvatarUrl(data.url);
        setShowUploadModal(false);
        setStatusMsg({ type: "success", text: "Profile photo uploaded successfully!" });
        toast.success("Avatar updated!", { description: "Your new profile image has been uploaded." });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        const err = data.error || "Failed to upload avatar.";
        setStatusMsg({ type: "error", text: err });
        toast.error("Upload failed", { description: err });
      }
    } catch (err: any) {
      const msg = err.message || "Failed to upload avatar.";
      setStatusMsg({ type: "error", text: msg });
      toast.error("Upload error", { description: msg });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Helper to check if reservation date & slot time has already passed
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

  const getStatusBadge = (status: string, isPast: boolean = false) => {
    if (status === "COMPLETED" || (status !== "CANCELLED" && isPast)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    }

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
            <AlertCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-700/40 text-neutral-300 border border-neutral-600/30">
            {status}
          </span>
        );
    }
  };

  const initialLetter = fullName.trim() ? fullName.trim().charAt(0).toUpperCase() : "D";

  return (
    <div className="min-h-screen bg-[#090a0d] text-white flex flex-col selection:bg-[#e60000] selection:text-white">
      {/* Navigation Header */}
      <Navbar
        user={{
          name: fullName || "Diner",
          email: email || user.email,
          avatar: avatarUrl,
          role: profile?.role || "customer",
          phone: user.phone,
        }}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141722] via-[#10121a] to-[#141722] border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] mb-8">
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar with Kokonut UI FileUpload trigger */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-[#ffbe33]/40 shadow-xl bg-[#1b1f2e] flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName || "User Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#ffbe33]">
                    {initialLetter}
                  </span>
                )}
              </div>

              {/* Upload button opening Kokonut FileUpload Modal */}
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#ffbe33] text-black hover:bg-[#e6a827] shadow-lg cursor-pointer transition-all group-hover:scale-110"
                title="Upload Photo via FileUpload"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info Details: No "VIP Diner" badge */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {fullName || "Diner"}
              </h1>

              {/* Verified Contact Details Strip */}
              <div className="text-neutral-400 text-sm mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4">
                {user.phone && (
                  <span className="inline-flex items-center gap-1.5 text-neutral-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#ffbe33]" />
                    {user.phone}
                  </span>
                )}
                {email && (
                  <span className="inline-flex items-center gap-1.5 text-neutral-400 text-xs">
                    {email}
                  </span>
                )}
              </div>

              {/* Navigation Tabs: "Profile" and "My Bookings" */}
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-6 pt-5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-[#ffbe33] text-black shadow-md shadow-[#ffbe33]/20"
                      : "bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Profile
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("reservations")}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "reservations"
                      ? "bg-[#ffbe33] text-black shadow-md shadow-[#ffbe33]/20"
                      : "bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>My Bookings</span>
                  {initialReservations.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-black/20 text-current flex items-center justify-center text-[10px] font-extrabold">
                      {initialReservations.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "logout" }),
                    });
                    window.location.href = "/";
                  }}
                  className="ml-auto inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-red-400 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Status Notification */}
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 transition-all ${
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

        {/* Tab 1: Profile Details with Inline-Edit Components */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Personal Information Card with Refined Spacing */}
            <div className="bg-[#12141d] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    Personal Information
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Click the edit icon on any row to update your details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={saving || !isChanged}
                  className="px-4 py-2 rounded-xl bg-[#ffbe33] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#e6a827] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#ffbe33]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save All"}</span>
                </button>
              </div>

              {/* 2x2 Grid of ProfileEditableField Rows with Clean Padding & Spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <ProfileEditableField
                  icon={User02Icon}
                  label="Full Name"
                  value={fullName}
                  placeholder="Enter full name"
                  onSave={(val) => {
                    setFullName(val);
                    updateProfileMutation.mutate({ full_name: val });
                  }}
                />

                {/* Verified Email Address (Read-only / Verified Badge) */}
                <ProfileEditableField
                  icon={Mail01Icon}
                  label="Verified Email"
                  type="email"
                  value={email || user.email || "No email linked"}
                  readOnly={true}
                  verifiedBadge={true}
                  helperText="Primary dining identifier for account access & receipts."
                  onSave={() => {}}
                />

                {/* Contact Phone (Editable) */}
                <ProfileEditableField
                  icon={SmartPhone01Icon}
                  label="Contact Phone"
                  type="tel"
                  value={phone}
                  placeholder="+91 XXXXX XXXXX"
                  helperText="Used by concierge for SMS table updates & reminders."
                  onSave={(val) => {
                    setPhone(val);
                    updateProfileMutation.mutate({ phone: val });
                  }}
                />

                {/* Birthday Selector using simple-calender */}
                <div className="w-full flex flex-col gap-2 p-3 sm:p-4 rounded-2xl bg-[#0e111a] border border-white/10 hover:border-[#ffbe33]/40 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                      <HugeiconsIcon icon={Calendar03Icon} size={18} color="#ffbe33" strokeWidth={1.8} />
                      <span>Birthday</span>
                    </span>

                    {birthday && (
                      <span className="text-xs text-[#ffbe33] font-bold">
                        {birthday}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-500">
                    Pick your birth month, year and day from the calendar below for dining celebration surprises.
                  </p>

                  <div className="pt-2 flex justify-center">
                    <BirthdayCalendar
                      value={birthday}
                      onChange={(newDate) => {
                        setBirthday(newDate);
                        updateProfileMutation.mutate({ birthday: newDate });
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="bg-[#12141d] border border-red-500/20 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-red-400 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Danger Zone</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                    Once you delete your account, your profile information, preferences, and saved details will be permanently removed. This action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-[#12141d] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Delete Your Account?</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Are you absolutely sure? This will permanently erase your profile details, avatar, and sign you out of Calvary. This action cannot be reversed.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  To confirm, type <span className="text-red-400 font-bold font-mono">DELETE</span> below:
                </label>
                <input
                  type="text"
                  value={deleteInputText}
                  onChange={(e) => setDeleteInputText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full bg-[#0e111a] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInputText("");
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteInputText.trim() !== "DELETE"}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/20"
                >
                  {deleting ? "Erasing..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reservations List with Fixed Spacing */}
        {activeTab === "reservations" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-xl font-bold text-white">Table Reservations</h2>
                <p className="text-neutral-400 text-xs mt-1">
                  Keep track of all your upcoming and past dining experiences at Calvary
                </p>
              </div>

              <Link
                href="/reserve"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffbe33] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#e6a827] transition-all shadow-md shrink-0"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Book a Table</span>
              </Link>
            </div>

            {reservations.length === 0 ? (
              <div className="bg-[#12141d] border border-white/10 rounded-3xl p-10 sm:p-14 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
                  <CalendarIcon className="w-8 h-8 text-[#ffbe33]" />
                </div>
                <h3 className="text-lg font-bold text-white">No Reservations Found</h3>
                <p className="text-neutral-400 text-xs max-w-sm mx-auto">
                  You have not made any table reservations yet. Experience fine culinary craft by reserving your table today.
                </p>
                <Link
                  href="/reserve"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffbe33] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#e6a827] transition-all"
                >
                  <span>Reserve Table Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservations.map((res) => {
                  const isPast = isReservationPast(
                    res.reservation_date,
                    res.reservation_slots?.start_time,
                    res.reservation_slots?.duration_minutes
                  );

                  return (
                    <div
                      key={res.id}
                      className={cn(
                        "border rounded-2xl p-5 transition-all flex flex-col justify-between",
                        isPast && res.status !== "CANCELLED"
                          ? "bg-[#0f1118]/80 border-blue-500/20"
                          : "bg-[#12141d] border-white/10 hover:border-[#ffbe33]/40"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-mono text-neutral-400">
                            #{res.id.slice(0, 8).toUpperCase()}
                          </span>
                          {getStatusBadge(res.status, isPast)}
                        </div>

                        <h4 className="font-bold text-base text-white flex items-center gap-2">
                          <span>
                            {res.restaurant_tables?.table_number
                              ? `Table ${res.restaurant_tables.table_number}`
                              : "Dining Table"}
                          </span>
                          <span className="text-neutral-500 font-normal text-xs">
                            • {res.party_size} Guests
                          </span>
                        </h4>

                        <div className="mt-3 space-y-1.5 text-xs text-neutral-300">
                          <div className="flex items-center gap-2 text-neutral-400">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#ffbe33]" />
                            <span>Date: {res.reservation_date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-400">
                            <Clock className="w-3.5 h-3.5 text-[#ffbe33]" />
                            <span>
                              Time Slot: {res.reservation_slots?.start_time || "Confirmed Time"}
                            </span>
                          </div>
                          {res.special_request && (
                            <div className="mt-2 p-2.5 rounded-lg bg-white/5 text-[11px] text-neutral-300 border border-white/5 flex items-start gap-1.5">
                              <span className="font-semibold text-[#ffbe33] shrink-0">Special Notes:</span>
                              <span className="italic">"{res.special_request}"</span>
                            </div>
                          )}
                          {res.cancellation_reason && (
                            <div className="mt-2 p-2.5 rounded-lg bg-rose-500/10 text-[11px] text-rose-300 border border-rose-500/20 flex items-start gap-1.5">
                              <span className="font-semibold text-rose-400 shrink-0">Decline Reason:</span>
                              <span>{res.cancellation_reason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
                        <div>
                          <span>Booked {new Date(res.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Add to Calendar for upcoming active bookings */}
                          {res.status !== "CANCELLED" && !isPast && (
                            <AddToCalendarButton
                              buttonSize="sm"
                              event={{
                                title: `Calvary Dining: ${res.restaurant_tables?.table_number ? `Table ${res.restaurant_tables.table_number}` : "Table Reservation"}`,
                                description: `Reservation for ${res.party_size} guests at Calvary Fine Dining. Booking Ref: #${res.id.slice(0, 8)}.`,
                                location: "Calvary Fine Dining, 124 Heritage Lane, Indiranagar, Bengaluru",
                                startDate: res.reservation_date,
                                startTime: res.reservation_slots?.start_time || "19:00",
                                durationMinutes: res.reservation_slots?.duration_minutes || 90,
                              }}
                            />
                          )}

                          {/* Rate Dining for past visits */}
                          {isPast && res.status !== "CANCELLED" && (
                            <button
                              type="button"
                              onClick={() => setReviewingReservation(res)}
                              className="px-2.5 py-1 rounded-lg bg-[#ffbe33]/15 border border-[#ffbe33]/30 text-[#ffbe33] hover:bg-[#ffbe33] hover:text-neutral-950 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>{res.feedback_rating ? `${res.feedback_rating}★ Reviewed` : "Rate Dining"}</span>
                            </button>
                          )}

                          {res.status !== "CANCELLED" && !isPast && (
                            <button
                              type="button"
                              onClick={() => setEditingReservation(res)}
                              className="px-2.5 py-1 rounded-lg bg-[#ffbe33]/15 border border-[#ffbe33]/30 text-[#ffbe33] font-bold text-[10px] uppercase tracking-wider hover:bg-[#ffbe33] hover:text-neutral-950 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                              <span>Alter</span>
                            </button>
                          )}

                          {isPast && res.status !== "CANCELLED" ? (
                            <span className="text-blue-400/80 font-medium">Session Concluded</span>
                          ) : (
                            <span className="text-[#ffbe33]">Calvary Hospitality</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

            {/* Dining Review Modal */}
            <DiningReviewModal
              isOpen={!!reviewingReservation}
              reservation={reviewingReservation}
              onClose={() => setReviewingReservation(null)}
              onSuccess={() => {
                setReviewingReservation(null);
              }}
            />
          </div>
        )}

        {/* Modal for Kokonut UI FileUpload */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-[#12141d] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#ffbe33]" />
                  <span>Upload Profile Photo</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Kokonut UI FileUpload Component */}
              <FileUpload
                onUploadSuccess={handleFileUploadSuccess}
                acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
                maxFileSize={2 * 1024 * 1024}
                uploadDelay={1000}
                className="w-full"
              />

              <div className="text-center">
                <p className="text-xs text-neutral-400">
                  Select or drag a JPEG, PNG, or WebP photo up to 2MB.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
