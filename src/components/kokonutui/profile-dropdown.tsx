"use client";

import { CreditCard, LogOut, ShieldCheck, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";

export interface Profile {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  role?: string;
}

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon: React.ReactNode;
}

const SAMPLE_PROFILE_DATA: Profile = {
  name: "Guest Gourmet",
  email: "guest@calvary.com",
  avatar: "/assets/images/logo.png",
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Profile;
  onSignOut?: () => Promise<unknown> | unknown;
}

export default function ProfileDropdown({
  data = SAMPLE_PROFILE_DATA,
  onSignOut,
  className,
  ...props
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const displayName = data.name || "Customer";
  const displayContact = data.email || data.phone || "Dine with us";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  const menuItems: MenuItem[] = [
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="h-4 w-4 text-neutral-400 group-hover:text-[#ffbe33]" />,
    },
    {
      label: "My Bookings",
      href: "/my-bookings",
      icon: <CreditCard className="h-4 w-4 text-neutral-400 group-hover:text-[#ffbe33]" />,
    },
    ...(data.role === "admin"
      ? [
          {
            label: "Admin Portal",
            href: "/admin",
            icon: <ShieldCheck className="h-4 w-4 text-[#ffbe33]" />,
          },
        ]
      : []),
  ];

  const handleSignOut = async () => {
    toast.info("Signing out...", { description: "Ending your session." });
    if (onSignOut) {
      await onSignOut();
    } else {
      await api.post("/api/auth", { action: "logout" });
      window.location.href = "/";
    }
  };

  return (
    <div className={cn("relative", className)} {...props}>
      <DropdownMenu onOpenChange={setIsOpen}>
        <div className="group relative">
          <DropdownMenuTrigger
            render={
              <button
                className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-white/10 bg-[#16181f]/90 p-1.5 sm:px-3 sm:py-2 transition-all duration-200 hover:border-[#ffbe33]/40 hover:bg-[#1f232e] focus:outline-none"
                type="button"
                aria-label="User Account Menu"
              />
            }
          >
            {/* User name only (visible on desktop) */}
            <div className="flex-1 text-left hidden md:block">
              <div className="font-semibold text-xs sm:text-sm text-zinc-100 leading-tight tracking-tight">
                {displayName}
              </div>
            </div>

            {/* Circular Avatar with Luxury Gradient Ring */}
            <div className="relative">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-[#ffbe33] via-[#ff6b35] to-[#e60000] p-[2px] shadow-sm">
                <div className="h-full w-full overflow-hidden rounded-full bg-[#0b0c0f] flex items-center justify-center">
                  {data.avatar ? (
                    <Image
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover"
                      height={36}
                      src={data.avatar}
                      width={36}
                    />
                  ) : (
                    <span className="text-xs font-black text-[#ffbe33]">
                      {initial}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>

          {/* Kokonut UI Bending Line Indicator on the Right */}
          <div
            className={cn(
              "absolute top-1/2 -right-3 -translate-y-1/2 transition-all duration-200 pointer-events-none",
              isOpen ? "opacity-100" : "opacity-60 group-hover:opacity-100"
            )}
          >
            <svg
              aria-hidden="true"
              className={cn(
                "transition-all duration-200",
                isOpen
                  ? "scale-110 text-[#ffbe33]"
                  : "text-zinc-500 group-hover:text-zinc-300"
              )}
              fill="none"
              height="24"
              viewBox="0 0 12 24"
              width="12"
            >
              <path
                d="M2 4C6 8 6 16 2 20"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <DropdownMenuContent
            align="end"
            className="w-60 origin-top-right rounded-2xl border border-white/10 bg-[#16181f]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl text-neutral-200"
            sideOffset={6}
          >
            <div className="space-y-1">
              {menuItems.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  render={
                    <Link
                      className="group flex cursor-pointer items-center rounded-xl border border-transparent p-2.5 transition-all duration-200 hover:border-white/10 hover:bg-white/5 hover:text-[#ffbe33]"
                      href={item.href}
                    />
                  }
                >
                  <div className="flex flex-1 items-center gap-2.5">
                    {item.icon}
                    <span className="whitespace-nowrap font-medium text-xs sm:text-sm text-zinc-200 transition-colors group-hover:text-[#ffbe33]">
                      {item.label}
                    </span>
                  </div>
                  {item.value && (
                    <div className="ml-auto flex-shrink-0">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 font-bold text-[10px] tracking-wider uppercase",
                          item.label === "Admin Portal"
                            ? "border border-[#ffbe33]/30 bg-[#ffbe33]/15 text-[#ffbe33]"
                            : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        )}
                      >
                        {item.value}
                      </span>
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator className="my-2 bg-white/10" />

            <DropdownMenuItem
              render={
                <button
                  onClick={handleSignOut}
                  className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-transparent bg-red-500/10 p-2.5 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/20 hover:shadow-sm"
                  type="button"
                />
              }
            >
              <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300" />
              <span className="font-medium text-red-400 text-xs sm:text-sm group-hover:text-red-300">
                Sign Out
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </div>
  );
}
