"use client";

import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import FuseButton from "@/components/FuseButton";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

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

  // Client-side fallback: Hydrate email / name from Supabase auth session if not passed via SSR
  useEffect(() => {
    // If SSR provided the values, update state
    if (initialUser.email || initialUser.name || initialUser.phone) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || initialUser.name || "",
        email: prev.email || initialUser.email || "",
        phone: prev.phone || initialUser.phone || "",
      }));
    }

    // Also check active browser session in case SSR cookies were stale or missing email
    async function loadBrowserSessionUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userEmail = user.email || (user.user_metadata?.email as string) || "";
          const userName = (user.user_metadata?.full_name as string) || "";
          const userPhone = user.phone || (user.user_metadata?.phone as string) || "";

          // Also check profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("id", user.id)
            .maybeSingle();

          const resolvedEmail = profile?.email || userEmail;
          const resolvedName = profile?.full_name || userName;
          const resolvedPhone = profile?.phone || userPhone;

          setFormData((prev) => ({
            ...prev,
            email: prev.email ? prev.email : resolvedEmail,
            name: prev.name ? prev.name : resolvedName,
            phone: prev.phone ? prev.phone : resolvedPhone,
          }));
        }
      } catch (err) {
        console.warn("Client session hydration for contact form:", err);
      }
    }

    loadBrowserSessionUser();
  }, [initialUser.email, initialUser.name, initialUser.phone]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkContactConstraints = (): boolean => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      const msg = "Please complete all required fields (Name, Email, and Message).";
      setError(msg);
      toast.error("Required fields missing", { description: msg });
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to send message.");
      }
      setSuccess(true);
      toast.success("Message sent successfully!", {
        description: "Our concierge team will respond to your email shortly.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred. Please try again.";
      setError(msg);
      toast.error("Message delivery error", { description: msg });
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
