"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminReservationManagement from "@/components/AdminReservationManagement";
import AdminMenuManagement from "@/components/AdminMenuManagement";
import AdminGalleryManagement from "@/components/AdminGalleryManagement";
import AdminMessagesManagement from "@/components/AdminMessagesManagement";
import {
  Calendar,
  Utensils,
  Camera,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { MenuItem, MenuCategory, ContactMessage } from "@/types/database";
import type { GalleryItem } from "@/app/actions/gallery";

interface AdminDashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
    avatar?: string | null;
    phone?: string | null;
  } | null;
  initialReservations: any[];
  initialMenuItems: MenuItem[];
  categories: MenuCategory[];
  galleryItems: GalleryItem[];
  initialMessages: ContactMessage[];
}

type AdminTab = "reservations" | "menu" | "gallery" | "messages";

export default function AdminDashboardClient({
  user,
  initialReservations,
  initialMenuItems,
  categories,
  galleryItems,
  initialMessages,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("reservations");

  const unreadMessagesCount = initialMessages.filter((m) => m.status === "UNREAD").length;
  const pendingReservationsCount = initialReservations.filter((r) => r.status === "PENDING").length;

  const tabs: { key: AdminTab; label: string; icon: any; count?: number }[] = [
    {
      key: "reservations",
      label: "Table Reservations",
      icon: Calendar,
      count: pendingReservationsCount,
    },
    {
      key: "menu",
      label: "Menu & Dishes",
      icon: Utensils,
      count: initialMenuItems.length,
    },
    {
      key: "gallery",
      label: "Visual Gallery",
      icon: Camera,
      count: galleryItems.length,
    },
    {
      key: "messages",
      label: "Contact Inquiries",
      icon: MessageSquare,
      count: unreadMessagesCount,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b0e] text-white flex flex-col selection:bg-[#ffbe33] selection:text-neutral-950">
      <Navbar user={user} />

      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffbe33]/15 border border-[#ffbe33]/30 text-[#ffbe33] text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin & Maître D&apos; Console</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Restaurant Control Center
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Manage dining reservations, curate menu catalog dishes, upload gallery photos, and reply to guest contact inquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/reserve"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#ffbe33]" />
              <span>Live Booking Page</span>
            </Link>
            <Link
              href="/menu"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#ffbe33]" />
              <span>Live Menu</span>
            </Link>
          </div>
        </div>

        {/* Master Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#ffbe33] text-black shadow-lg shadow-[#ffbe33]/20"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-[#ffbe33]"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                      isActive
                        ? "bg-black/20 text-black"
                        : tab.key === "messages" && tab.count > 0
                        ? "bg-[#ffbe33]/20 text-[#ffbe33] font-bold"
                        : "bg-white/10 text-neutral-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab Panel */}
        <div className="pt-2">
          {activeTab === "reservations" && (
            <AdminReservationManagement initialReservations={initialReservations} />
          )}

          {activeTab === "menu" && (
            <AdminMenuManagement initialItems={initialMenuItems} categories={categories} />
          )}

          {activeTab === "gallery" && (
            <AdminGalleryManagement initialItems={galleryItems} />
          )}

          {activeTab === "messages" && (
            <AdminMessagesManagement initialMessages={initialMessages} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
