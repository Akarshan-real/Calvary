"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ position = "bottom-right", ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={position}
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-400" />
        ),
        info: (
          <InfoIcon className="size-4 text-[#ffbe33]" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-400" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-rose-400" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-[#ffbe33]" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#12141c]/95 group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:backdrop-blur-xl group-[.toaster]:font-sans",
          description: "group-[.toast]:text-neutral-400 text-xs",
          actionButton:
            "group-[.toast]:bg-[#ffbe33] group-[.toast]:text-neutral-950 group-[.toast]:font-bold",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-neutral-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }

