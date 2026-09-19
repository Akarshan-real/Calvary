import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/app/actions/auth";
import { FileText, Clock, AlertTriangle, CheckCircle, Scale, Utensils } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Calvary Artisanal Cuisine & Bar",
  description: "Terms of service, table reservation policies, cancellation guidelines, and guest etiquette at Calvary.",
};

export default async function TermsPage() {
  const authData = await getCurrentUser().catch(() => null);

  const sections = [
    {
      icon: <Clock className="w-5 h-5 text-[#ffbe33]" />,
      title: "1. Table Reservations & Seating Policy",
      content: (
        <>
          <p className="text-neutral-300 text-sm leading-relaxed mb-3">
            To maintain our high standard of service and culinary timing:
          </p>
          <ul className="space-y-2 text-sm text-neutral-400 list-disc list-inside">
            <li><strong className="text-neutral-200">Grace Period:</strong> Reserved tables are held for a maximum of <strong>15 minutes</strong> past the confirmed booking time. If your party is delayed, please inform our reception team immediately.</li>
            <li><strong className="text-neutral-200">Admin Approval:</strong> All online reservations represent a requested dining slot and table number subject to official review and approval by restaurant management.</li>
            <li><strong className="text-neutral-200">Seating Capacity:</strong> Tables are assigned strictly based on the guest capacity indicated during booking to ensure guest safety and fire regulation compliance.</li>
          </ul>
        </>
      ),
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-[#ffbe33]" />,
      title: "2. Cancellations & No-Show Policy",
      content: (
        <p className="text-neutral-300 text-sm leading-relaxed">
          We respectfully ask that cancellations or schedule modifications be requested at least <strong>2 hours</strong> in advance. Frequent unexplained no-shows or repeated last-minute cancellations may result in automated restrictions on advance online reservations.
        </p>
      ),
    },
    {
      icon: <Utensils className="w-5 h-5 text-[#ffbe33]" />,
      title: "3. Dining Experience & Dietary Requirements",
      content: (
        <p className="text-neutral-300 text-sm leading-relaxed">
          While our culinary brigade takes exhaustive precautions regarding severe allergens, our open-concept artisanal kitchen routinely processes nuts, dairy, seafood, and gluten. Guests are required to note all allergies upon reservation or notify their server upon arrival.
        </p>
      ),
    },
    {
      icon: <Scale className="w-5 h-5 text-[#ffbe33]" />,
      title: "4. Code of Conduct & House Rules",
      content: (
        <p className="text-neutral-300 text-sm leading-relaxed">
          Calvary is dedicated to providing an elegant, respectful, and serene ambiance for all patrons. Management reserves the right to decline service or escort any guest displaying disruptive, intoxicated, or harassing behavior off the premises.
        </p>
      ),
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-[#ffbe33]" />,
      title: "5. Pricing, Taxes & Gratuities",
      content: (
        <p className="text-neutral-300 text-sm leading-relaxed">
          All prices stated on our digital menu and in-house printed cards are in the specified currency and subject to applicable local municipal taxes and service charges. Chef seasonal menus and pricing may vary based on market availability.
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
            <Scale className="w-3.5 h-3.5 text-[#ffbe33]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#ffbe33]">
              Guest Agreement
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Terms & Conditions
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm">
            Last Updated: September 2026 • Please read carefully before booking or dining with us
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

        {/* Help Note */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2 text-xs sm:text-sm text-neutral-400">
          <p>
            Have specific inquiries about our reservation policy or private party terms?
          </p>
          <p>
            Contact our guest services team directly at{" "}
            <a href="mailto:reservations@calvary.com" className="text-[#ffbe33] underline hover:text-white transition-colors">
              reservations@calvary.com
            </a>{" "}
            or call{" "}
            <a href="tel:+15552345678" className="text-[#ffbe33] underline hover:text-white transition-colors">
              +1 (555) 234-5678
            </a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
