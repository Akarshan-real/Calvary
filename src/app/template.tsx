"use client";

import { motion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Top glowing transition indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ffbe33] via-[#ff6b35] to-[#e60000] z-[9999] shadow-[0_0_14px_rgba(255,190,51,0.85)] pointer-events-none origin-left"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: [1, 1, 0] }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Page entrance transition with subtle slide, zoom, and blur-in */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.988, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col w-full"
      >
        {children}
      </motion.div>
    </>
  );
}
