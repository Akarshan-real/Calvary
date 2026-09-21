import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth-server";
import { Shield, Lock, Eye, FileText, Bell, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Calvary Artisanal Cuisine & Bar",
  description: "Learn how Calvary collects, uses, and safeguards your personal information and reservation data.",
};

export default async function PrivacyPolicyPage() {
  const authData = await getCurrentUser().catch(() => null);

  const sections = [
    {
      icon: <Eye className="w-5 h-5 text-[#ffbe33]" />,
      title: "1. Information We Collect",
      content: (
        <>
          <p className="text-neutral-300 text-sm leading-relaxed mb-3">
            To provide an artisanal dining and reservation experience, we collect information you provide directly to us, including:
          </p>
          <ul className="space-y-2 text-sm text-neutral-400 list-disc list-inside">
            <li><strong className="text-neutral-200">Contact Details:</strong> Full name, verified email address, and mobile phone number for SMS/email reservation confirmations.</li>
            <li><strong className="text-neutral-200">Dining Preferences & Health:</strong> Dietary requirements, food allergies, seating preferences, and special occasion notes (e.g., birthdays or anniversaries).</li>
            <li><strong className="text-neutral-200">Authentication & Account Data:</strong> Secure password hashes or one-time password (OTP) verification tokens.</li>
            <li><strong className="text-neutral-200">Technical Logs:</strong> IP address, device browser type, and interaction timestamps used strictly to protect against reservation spam and table lock abuse.</li>
          </ul>
        </>
      ),
    },
    {
      icon: <Lock className="w-5 h-5 text-[#ffbe33]" />,
      title: "2. How We Use Your Information",
      content: (
        <p className="text-neutral-300 text-sm leading-relaxed">
          Your personal data is used exclusively to facilitate table booking confirmation, notify you of status approvals or adjustments by our maître d', verify customer identity, and elevate your in-restaurant hospitality. We never sell, lease, or monetize your contact or dining records to third-party advertisers.
        </p>
      ),
    },
    {
      icon: <Shield className="w-5 h-5 text-[#ffbe33]" />,
      title: "3. Data Security & Encryption",
      content: (
        <p className="text-neutral-300 text-sm leading-relaxed">
          All communications between your browser and Calvary are secured via modern TLS 1.3 encryption. Reservation records and personal credentials stored in our database utilize Row Level Security (RLS) policies, ensuring that only authenticated profile owners and authorized restaurant management staff can access sensitive details.
        </p>
      ),
    },
    {
      icon: <Bell className="w-5 h-5 text-[#ffbe33]" />,
      title: "4. Communications & Notifications",
      content: (
        <p className="text-neutral-300 text-sm leading-relaxed">
          By submitting a table reservation request, you consent to receive direct transactional communications regarding your booking status (such as table approval emails or reminder messages). You may opt out of promotional announcements at any time from your account settings.
        </p>
      ),
    },
    {
      icon: <FileText className="w-5 h-5 text-[#ffbe33]" />,
      title: "5. Your Data Rights & Deletion",
      content: (
        <p className="text-neutral-300 text-sm leading-relaxed">
          You have the right to request a copy of your stored dining profile or request total erasure of your account and reservation history. To exercise these rights, contact our privacy officer at <a href="mailto:privacy@calvary.com" className="text-[#ffbe33] underline hover:text-white transition-colors">privacy@calvary.com</a>.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b0e] text-white flex flex-col selection:bg-[#ffbe33] selection:text-neutral-950">
      <Navbar
        user={
          authData?.user
            ? {
                name: authData.profile?.full_name,
                email: authData.user.email,
                role: authData.profile?.role,
                avatar: authData.profile?.avatar_url,
                phone: authData.user.phone,
              }
            : null
        }
      />

      <main className="flex-1 py-16 sm:py-24 px-6 sm:px-8 max-w-4xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Shield className="w-3.5 h-3.5 text-[#ffbe33]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#ffbe33]">
              Transparency & Trust
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm">
            Last Updated: September 2026 • Effective for all Calvary guests and digital services
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {sections.map((sec, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-[#12141a]/90 border border-white/10 hover:border-white/20 transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {sec.icon}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {sec.title}
                </h2>
              </div>
              <div className="pl-0 sm:pl-13 text-neutral-300">{sec.content}</div>
            </div>
          ))}
        </div>

        {/* Commitment Badge */}
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-4 text-emerald-300 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            Calvary complies with modern international privacy frameworks (including GDPR and CCPA guidelines). We prioritize your peace of mind so you can enjoy your dining experience with full confidence.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
