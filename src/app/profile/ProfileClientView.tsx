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
} from "lucide-react";
import {
  User02Icon,
  SmartPhone01Icon,
  Mail01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { logout } from "@/app/actions/auth";
import { updateUserProfile, uploadUserAvatar, deleteUserAccount } from "@/app/actions/profile";
import type { UserReservation } from "@/app/actions/user-reservations";
import type { Profile } from "@/types/database";
import FileUpload from "@/components/kokonutui/file-upload";
import { ProfileEditableField } from "@/components/ProfileEditableField";
import { BirthdayCalendar } from "@/components/ui/simple-calender";
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
  const [activeTab, setActiveTab] = useState<"profile" | "reservations">("profile");

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || user.email || "");
  const [birthday, setBirthday] = useState(profile?.birthday || "");

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
    birthday: profile?.birthday || "",
  });

  const isChanged =
    fullName !== initialValues.fullName ||
    email !== initialValues.email ||
    birthday !== initialValues.birthday;

  // Permanently delete user account
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setStatusMsg(null);

    try {
      const res = await deleteUserAccount();
      if (!res.success) {
        setStatusMsg({ type: "error", text: res.error || "Failed to delete account." });
        setDeleting(false);
        setShowDeleteConfirm(false);
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "An error occurred while deleting account." });
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
      const res = await updateUserProfile({
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        birthday: birthday || null,
      });

      if (!res.success) {
        setStatusMsg({ type: "error", text: res.error || "Failed to update profile." });
      } else {
        setInitialValues({
          fullName: fullName.trim(),
          email: email.trim(),
          birthday: birthday || "",
        });
        setStatusMsg({ type: "success", text: "Profile details updated successfully!" });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "An unexpected error occurred." });
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

      const res = await uploadUserAvatar(formData, user.id);
      if (res.success && res.url) {
        setAvatarUrl(res.url);
        setShowUploadModal(false);
        setStatusMsg({ type: "success", text: "Profile photo uploaded successfully!" });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ type: "error", text: res.error || "Failed to upload avatar." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to upload avatar." });
    } finally {
      setUploadingAvatar(false);
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
                    await logout();
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
                    updateUserProfile({ full_name: val });
                  }}
                />

                {/* Verified Mobile Number (Read-only) */}
                <ProfileEditableField
                  icon={SmartPhone01Icon}
                  label="Verified Mobile"
                  value={user.phone || profile?.phone || "No phone linked"}
                  readOnly={true}
                  verifiedBadge={true}
                  onSave={() => {}}
                />

                {/* Email Address */}
                <ProfileEditableField
                  icon={Mail01Icon}
                  label="Email Address"
                  type="email"
                  value={email}
                  placeholder="name@example.com"
                  helperText="Required to receive automated table booking receipts."
                  onSave={(val) => {
                    setEmail(val);
                    updateUserProfile({ email: val });
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
                        updateUserProfile({ birthday: newDate });
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

            {initialReservations.length === 0 ? (
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
                {initialReservations.map((res) => (
                  <div
                    key={res.id}
                    className="bg-[#12141d] border border-white/10 rounded-2xl p-5 hover:border-[#ffbe33]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-mono text-neutral-400">
                          #{res.id.slice(0, 8).toUpperCase()}
                        </span>
                        {getStatusBadge(res.status)}
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
                          <div className="mt-2 p-2.5 rounded-lg bg-white/5 text-[11px] text-neutral-300 italic border border-white/5">
                            "{res.special_request}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
                      <span>Booked under: {res.customer_name}</span>
                      <span>{new Date(res.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
