import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cursiveScript = localFont({
  src: "../../public/fonts/Cinzel,Dancing_Script/Dancing_Script/DancingScript-VariableFont_wght.ttf",
  variable: "--font-cursive",
  display: "swap",
});

const cinzelFont = localFont({
  src: "../../public/fonts/Cinzel,Dancing_Script/Cinzel/Cinzel-VariableFont_wght.ttf",
  variable: "--font-cinzel",
  display: "swap",
});

// PT Serif Caption from local public/fonts
const ptSerifFont = localFont({
  src: [
    {
      path: "../../public/fonts/PT_Serif_Caption/PTSerifCaption-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/PT_Serif_Caption/PTSerifCaption-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-pt-serif",
  display: "swap",
});

// Huninn from local public/fonts
const huninnFont = localFont({
  src: "../../public/fonts/Huninn/Huninn-Regular.ttf",
  variable: "--font-huninn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calvary | Culinary Excellence & Dining",
  description: "Exquisite culinary creations, craft dining, and unforgettable hospitality. Reserve a table or order online.",
  icons: {
    icon: "/assets/images/logo.png",
    shortcut: "/assets/images/logo.png",
    apple: "/assets/images/logo.png",
  },
};

import SmoothScroll from "@/components/SmoothScroll";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import BackToTop from "@/components/BackToTop";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/query-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cursiveScript.variable} ${cinzelFont.variable} ${ptSerifFont.variable} ${huninnFont.variable} antialiased dark`}
    >
      <body className="min-h-screen flex flex-col bg-[#0b0c0f] text-white selection:bg-[#e60000] selection:text-white">
        <ScrollProgress className="top-0 z-[100] h-[3px] bg-gradient-to-r from-[#ffbe33] via-[#ff9900] to-[#e60000] shadow-[0_0_12px_rgba(255,190,51,0.7)]" />
        <QueryProvider>
          <SmoothScroll>
            <TooltipProvider>{children}</TooltipProvider>
            <BackToTop />
          </SmoothScroll>
        </QueryProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
