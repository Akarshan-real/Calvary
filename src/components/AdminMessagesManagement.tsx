"use client";

import React, { useState, useTransition } from "react";
import {
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Trash2,
  Reply,
  AlertCircle,
  MessageSquare,
  Search,
  Check,
} from "lucide-react";
import type { ContactMessage } from "@/types/database";
import {
  updateContactMessageStatus,
  deleteContactMessage,
} from "@/app/actions/restaurant";

interface AdminMessagesManagementProps {
  initialMessages: ContactMessage[];
}

export default function AdminMessagesManagement({
  initialMessages,
}: AdminMessagesManagementProps) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const filteredMessages = messages.filter((m) => {
    if (filter !== "ALL" && m.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleMarkStatus = (id: number, status: "UNREAD" | "READ") => {
    startTransition(async () => {
      const res = await updateContactMessageStatus(id, status);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this customer message?")) return;
    startTransition(async () => {
      const res = await deleteContactMessage(id);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setStatusMsg({ type: "success", text: "Message removed from inbox." });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg({ type: "error", text: res.error || "Failed to delete message." });
      }
    });
  };

  const openMailtoReply = (msg: ContactMessage) => {
    // Automatically mark as read
    if (msg.status === "UNREAD") {
      handleMarkStatus(msg.id, "READ");
    }

    const subject = encodeURIComponent(`Regarding your inquiry at Calvary Restaurant`);
    const body = encodeURIComponent(
      `Dear ${msg.name},\n\n` +
      `Thank you for reaching out to Calvary Artisanal Cuisine.\n\n` +
      `In response to your message:\n` +
      `"${msg.message}"\n\n` +
      `[Write your reply here]\n\n` +
      `Warm regards,\n` +
      `Calvary Restaurant Guest Relations\n` +
      `reservations@calvary.com | +91 98765 43210`
    );

    window.location.href = `mailto:${msg.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#ffbe33]" />
            <span>Customer Inquiries & Messages</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Review incoming feedback, dietary queries, and questions submitted via the Contact Us page. Reply directly to user emails with one click.
          </p>
        </div>
      </div>

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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(["ALL", "UNREAD", "READ"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filter === st
                  ? "bg-[#ffbe33] text-black"
                  : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white"
              }`}
            >
              {st} ({messages.filter((m) => (st === "ALL" ? true : m.status === st)).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or message..."
            className="w-full bg-[#0e111a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#ffbe33]"
          />
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-[#12141d] border border-white/10 rounded-3xl p-12 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Messages Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            There are currently no customer inquiries matching your filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-[#12141d] border rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                msg.status === "UNREAD"
                  ? "border-[#ffbe33]/40 shadow-lg shadow-[#ffbe33]/5"
                  : "border-white/10"
              }`}
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      msg.status === "UNREAD"
                        ? "bg-[#ffbe33]/15 text-[#ffbe33] border border-[#ffbe33]/30"
                        : "bg-white/5 text-neutral-400 border border-white/10"
                    }`}
                  >
                    {msg.status}
                  </span>
                  <span className="font-bold text-sm sm:text-base text-white">
                    {msg.name}
                  </span>
                  <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
                  <a
                    href={`mailto:${msg.email}`}
                    className="flex items-center gap-1.5 hover:text-[#ffbe33] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#ffbe33]" />
                    <span>{msg.email}</span>
                  </a>
                  {msg.phone && (
                    <a
                      href={`tel:${msg.phone}`}
                      className="flex items-center gap-1.5 hover:text-[#ffbe33] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#ffbe33]" />
                      <span>{msg.phone}</span>
                    </a>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e111a] border border-white/5 text-xs text-neutral-200 leading-relaxed">
                  "{msg.message}"
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center md:flex-col gap-2 shrink-0 pt-2 md:pt-0">
                <button
                  type="button"
                  onClick={() => openMailtoReply(msg)}
                  className="px-4 py-2 rounded-xl bg-[#ffbe33] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#e6a827] transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#ffbe33]/15"
                >
                  <Reply className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Reply via Email</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleMarkStatus(msg.id, msg.status === "UNREAD" ? "READ" : "UNREAD")
                    }
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-[11px] font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
                  >
                    {msg.status === "UNREAD" ? "Mark Read" : "Mark Unread"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
