import React from "react";
import Link from "next/link";
import { FaqAccordion, type FaqItem } from "@/components/ui/faq-accordion";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import faqsData from "@/data/faqs.json";

export default function HomeFaqSection() {
  const faqItems: FaqItem[] = faqsData.map((item) => ({
    question: item.question,
    answer: <span>{item.answer}</span>,
  }));

  return (
    <section className="py-20 px-6 sm:px-8 max-w-7xl mx-auto w-full relative">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ffbe33]/5 rounded-full blur-[120px] pointer-events-none" />

      <RevealOnScroll direction="up" duration={700}>
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#ffbe33]">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Everything you need to know about our reservation lock, private dining, dress code, and artisanal culinary preparations.
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll direction="up" delay={150} duration={800}>
        <FaqAccordion title="" items={faqItems} />
      </RevealOnScroll>
    </section>
  );
}
