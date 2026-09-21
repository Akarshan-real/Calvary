"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, X, Sparkles, Utensils, MessageSquare } from "lucide-react";
import { useSubmitReview } from "@/hooks/api/use-reservations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DiningReviewModalProps {
  isOpen: boolean;
  reservation: {
    id: string;
    reservation_date: string;
    restaurant_tables?: { table_number: string } | null;
    reservation_slots?: { start_time: string } | null;
    feedback_rating?: number | null;
    feedback_comment?: string | null;
  } | null;
  onClose: () => void;
  onSuccess: (updated: { id: string; rating: number; comment?: string }) => void;
}

export default function DiningReviewModal({
  isOpen,
  reservation,
  onClose,
  onSuccess,
}: DiningReviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState<number>(reservation?.feedback_rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>(reservation?.feedback_comment || "");
  const submitReviewMutation = useSubmitReview();
  const isSubmitting = submitReviewMutation.isPending;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (reservation) {
      setRating(reservation.feedback_rating || 5);
      setComment(reservation.feedback_comment || "");
    }
  }, [reservation]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !reservation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReviewMutation.mutateAsync({
        id: reservation.id,
        rating,
        comment,
      });

      toast.success("Thank you for your review!", {
        description: "Your feedback has been saved and shared with our culinary team.",
      });
      onSuccess({ id: reservation.id, rating, comment });
      onClose();
    } catch (err: any) {
      toast.error("Error", { description: err?.message || "Failed to submit review." });
    }
  };

  const ratingDescriptions: Record<number, string> = {
    1: "Needs Substantial Improvement",
    2: "Fair Dining Experience",
    3: "Pleasant & Standard",
    4: "Delightful Culinary Service",
    5: "Exceptional Artisanal Masterpiece ★",
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12141d] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffbe33]/15 border border-[#ffbe33]/30 text-[#ffbe33] text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Diner Feedback</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Rate Dining Experience
            </h3>
            <p className="text-xs text-neutral-400">
              {reservation.reservation_date} •{" "}
              {reservation.restaurant_tables?.table_number
                ? `Table ${reservation.restaurant_tables.table_number}`
                : "Dining Table"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating Selector */}
          <div className="text-center space-y-3 p-4 rounded-2xl bg-[#090b0e] border border-white/5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              How was your evening at Calvary?
            </label>

            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= currentDisplayRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8 transition-colors",
                        isActive
                          ? "text-[#ffbe33] fill-[#ffbe33] drop-shadow-[0_0_8px_rgba(255,190,51,0.5)]"
                          : "text-neutral-600 hover:text-neutral-400"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-semibold text-[#ffbe33] tracking-wide">
              {ratingDescriptions[currentDisplayRating] || ""}
            </p>
          </div>

          {/* Comment input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#ffbe33]" />
              <span>Notes for the Chef &amp; Service (Optional)</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What dishes stood out? How was the service, ambiance, or wine pairing?"
              className="w-full px-4 py-3 rounded-xl bg-[#090b0e] border border-white/10 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-[#ffbe33] transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-[#ffbe33] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#e6a827] transition-all shadow-lg shadow-[#ffbe33]/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
