import React from "react";
import { Star } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import reviewsData from "@/data/reviews.json";

export interface GoogleReview {
  author: string;
  handle: string;
  avatar: string;
  rating: number;
  time: string;
  text: string;
}

const reviewsList = reviewsData as GoogleReview[];
const midPoint = Math.ceil(reviewsList.length / 2);
const reviewsRow1 = reviewsList.slice(0, midPoint);
const reviewsRow2 = reviewsList.slice(midPoint);

function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <div className="w-[320px] sm:w-[380px] shrink-0 p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#ffbe33]/40 transition-all duration-300 flex flex-col justify-between shadow-lg group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={review.avatar}
              alt={review.author}
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">
                {review.author}
              </h4>
              <p className="text-[11px] text-neutral-400">{review.handle}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 text-[#ffbe33]">
            {[...Array(review.rating)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-[#ffbe33] group-hover:scale-110 transition-transform"
                style={{ transitionDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed italic">
          &ldquo;{review.text}&rdquo;
        </p>
      </div>
      <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ffbe33]/60" />
          Google Review
        </span>
        <span>{review.time}</span>
      </div>
    </div>
  );
}

export default function GoogleReviewsMarquee() {
  return (
    <section className="py-16 overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-[#ffbe33]/5 blur-3xl pointer-events-none" />

      <RevealOnScroll direction="up" duration={700}>
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <div className="flex items-center gap-1 text-[#ffbe33]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#ffbe33]" />
              ))}
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-white">
              4.9 / 5.0 on Google Reviews
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Loved by Foodies &amp; Critics Alike
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Real guest impressions from tables at Calvary. Live Google reviews sync enabled.
          </p>
        </div>
      </RevealOnScroll>

      {/* Marquee Row 1 - Forward */}
      <div className="relative w-full overflow-hidden">
        {/* Edge Fade Gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0b0c0f] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0b0c0f] to-transparent z-10" />

        <Marquee pauseOnHover className="[--duration:35s] py-3">
          {reviewsRow1.map((review, idx) => (
            <ReviewCard key={idx} review={review} />
          ))}
        </Marquee>

        {/* Marquee Row 2 - Reverse */}
        <Marquee reverse pauseOnHover className="[--duration:40s] py-3">
          {reviewsRow2.map((review, idx) => (
            <ReviewCard key={idx} review={review} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
