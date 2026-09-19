"use client";

import React, { useState } from "react";
import { submitContactMessage } from "@/app/actions/restaurant";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import FuseButton from "@/components/FuseButton";

interface ContactClientFormProps {
  initialUser: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function ContactClientForm({ initialUser }: ContactClientFormProps) {
  const [formData, setFormData] = useState({
    name: initialUser.name || "",
    email: initialUser.email || "",
    phone: initialUser.phone || "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkContactConstraints = (): boolean => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Please complete all required fields (Name, Email, and Message).");
      return false;
    }
    setError(null);
    return true;
  };

  const executeSendMessage = async () => {
    if (!checkContactConstraints()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await submitContactMessage(formData);
      if (!res.success) {
        throw new Error(res.error || "Failed to send message.");
      }
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSendMessage();
  };

  if (success) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-xl font-bold text-white">Message Dispatched!</h4>
        <p className="text-sm text-neutral-300 max-w-md mx-auto">
          Thank you for reaching out to Calvary. Our culinary hospitality team has received your message and will get back to you shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="inline-block px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white tracking-wider uppercase transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Your Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Alexander Vance"
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ffbe33] transition-colors text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="alexander@example.com"
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ffbe33] transition-colors text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
          Phone Number <span className="text-neutral-500 text-[10px]">(Optional)</span>
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ffbe33] transition-colors text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
          Message & Details <span className="text-red-400">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Share your inquiry, dietary question, private dining event details, or catering request..."
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ffbe33] transition-colors text-sm resize-none"
        />
      </div>

      <div className="flex items-center pt-2">
        <FuseButton
          label={loading ? "Sending Message..." : "Send Message"}
          undoLabel="Cancel"
          doneLabel="Message Sent"
          background="#ffbe33"
          color="#0a0a0a"
          fuseColor="#0a0a0a"
          size="md"
          radius={16}
          undoWindow={3000}
          commitOn="fuseEnd"
          disabled={loading || !formData.name.trim() || !formData.email.trim() || !formData.message.trim()}
          beforeArm={checkContactConstraints}
          onFuseEnd={executeSendMessage}
          icon={<Send className="w-4 h-4 text-neutral-950" />}
          className="font-black uppercase tracking-[0.16em] text-xs shadow-lg shadow-[#ffbe33]/25 hover:bg-[#e6a827]"
        />
      </div>
    </form>
  );
}
