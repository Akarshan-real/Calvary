"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  { question: "What is Vengeance UI?", answer: "Vengeance UI is a high-performance, dark-mode first component library designed for the next generation of web applications." },
  { question: "Can I use it with Tailwind CSS?", answer: "Yes! All components are built on top of Tailwind CSS and highly customizable using utility classes." },
  { question: "Are the components accessible?", answer: "Accessibility is a core focus. We ensure proper ARIA attributes, keyboard navigation, and semantic HTML structure." },
  { question: "Do I need to install a heavy npm package?", answer: "No. Vengeance UI provides a CLI that lets you copy and paste only the components you need directly into your project." },
  { question: "Is it compatible with React and Next.js?", answer: "Absolutely. The library is built with React in mind and perfectly supports Next.js Server Components and client-side rendering." },
];

export function FaqAccordion({
  items = DEFAULT_ITEMS,
  title = "Vengeance UI FAQs",
  className,
  ...props
}: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto py-8 relative font-sans", className)} {...props}>
      {title && (
        <h2 className="text-center font-bold text-2xl md:text-4xl mb-10 text-white tracking-tight">
          {title}
        </h2>
      )}
      
      <ul className="w-full mx-auto list-none p-0 flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-[#12141a]/80 backdrop-blur-md">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              className={cn(
                "w-full relative transition-all duration-300 ease-in",
                "border-b border-white/5",
                "last:border-b-0",
                isActive ? "border-b border-[#ffbe33]/30" : ""
              )}
            >
              <button
                className={cn(
                  "flex flex-row items-center justify-start w-full min-h-[64px] py-4 relative m-0 px-6 pl-14 cursor-pointer",
                  "border-l-[4px] md:border-l-[6px] transition-all duration-200 text-left outline-none text-base md:text-lg",
                  isActive 
                    ? "border-l-[#ffbe33] bg-[#ffbe33]/10 text-white font-bold" 
                    : "border-l-transparent bg-transparent text-neutral-300 hover:border-l-[#ffbe33]/50 hover:text-[#ffbe33] hover:bg-white/[0.02]"
                )}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                {/* Plus/Minus Icon */}
                <span 
                  className={cn(
                    "absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-200 leading-none select-none",
                    isActive ? "text-[28px] md:text-[34px] font-light text-[#ffbe33]" : "text-[22px] md:text-[26px] font-light text-neutral-400"
                  )}
                >
                  {isActive ? "−" : "+"}
                </span>
                
                <span className="pr-8">{item.question}</span>
                
                {/* Chevron */}
                <span 
                  className={cn(
                    "absolute right-6 block w-2 h-2 border-t-2 border-r-2 transition-transform duration-200 ease-in-out",
                    isActive ? "rotate-[-45deg] border-[#ffbe33]" : "rotate-[135deg] border-neutral-500"
                  )}
                />
              </button>

              <div 
                className={cn(
                  "grid transition-all duration-300 ease-in-out w-full",
                  "border-l-[4px] md:border-l-[6px]",
                  isActive ? "grid-rows-[1fr] border-l-[#ffbe33] bg-[#ffbe33]/5" : "grid-rows-[0fr] border-l-transparent bg-transparent"
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-row items-start justify-start w-full px-6 pl-14 pb-6 pt-1 text-sm md:text-base font-normal text-neutral-300 leading-relaxed">
                    <span className="opacity-95">{item.answer}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
