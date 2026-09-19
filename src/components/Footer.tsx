import React from "react";
import Link from "next/link";
import Image from "next/image";
import { TextHoverEffect } from "@/components/ui/hoover-footer";
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#0d0f13] text-white border-t border-white/10 overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-[#e60000]/10 via-[#ffbe33]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Content Columns */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#ffbe33]/50">
                <Image
                  src="/assets/images/logo.png"
                  alt="Calvary Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span
                  className="text-3xl font-bold text-white tracking-wide block leading-none"
                  style={{ fontFamily: "var(--font-cursive), cursive" }}
                >
                  Calvary
                </span>
                <span className="text-[10px] tracking-[0.2em] text-[#ffbe33] uppercase font-bold">
                  Cuisine & Bar
                </span>
              </div>
            </div>

            <p className="text-sm text-neutral-400 leading-relaxed">
              Crafting extraordinary culinary moments with artisanal techniques, fresh local ingredients, and world-class hospitality.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-sm"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-sm"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-sm"
                aria-label="X (Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-neutral-200">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-[#ffbe33] transition-colors flex items-center gap-1 group">
                  <span>Home</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-neutral-400 hover:text-[#ffbe33] transition-colors flex items-center gap-1 group">
                  <span>Full Menu</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="text-neutral-400 hover:text-[#ffbe33] transition-colors flex items-center gap-1 group">
                  <span>Our Story</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/galary" className="text-neutral-400 hover:text-[#ffbe33] transition-colors flex items-center gap-1 group">
                  <span>Gallery</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-[#ffbe33] transition-colors flex items-center gap-1 group">
                  <span>Contact & Inquiries</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/reserve" className="text-neutral-400 hover:text-[#ffbe33] transition-colors flex items-center gap-1 group">
                  <span>Reserve a Table</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours of Operation */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-neutral-200">
              Opening Hours
            </h3>
            <div className="space-y-3 text-sm text-neutral-400">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#ffbe33] mt-0.5 shrink-0" />
                <div>
                  <p className="text-neutral-200 font-medium">Tuesday – Friday</p>
                  <p className="text-xs text-neutral-400">11:00 AM – 10:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#ffbe33] mt-0.5 shrink-0" />
                <div>
                  <p className="text-neutral-200 font-medium">Saturday – Sunday</p>
                  <p className="text-xs text-neutral-400">11:00 AM – 11:00 PM</p>
                </div>
              </div>
              <p className="text-xs text-red-400 font-medium pl-6.5">
                Monday: Closed for culinary prep
              </p>
            </div>
          </div>

          {/* Col 4: Contact & Location */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-neutral-200">
              Find Us
            </h3>
            <div className="space-y-3 text-sm text-neutral-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#ffbe33] mt-0.5 shrink-0" />
                <span>124 Heritage Lane, Indiranagar, Bengaluru, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#ffbe33] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#ffbe33] shrink-0" />
                <a href="mailto:hello@calvary.com" className="hover:text-white transition-colors">
                  hello@calvary.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Big Interactive Hoover Effect Brand Display */}
        <div className="border-t border-white/10 pt-10 pb-4">
          <div className="h-28 sm:h-36 md:h-44 w-full flex items-center justify-center">
            <TextHoverEffect text="CALVARY" />
          </div>
        </div>

        {/* Copyright strip */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Calvary Restaurant. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/admin" className="hover:text-[#ffbe33] transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
