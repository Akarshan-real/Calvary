# AGENTS.md — Feane Restaurant Web Platform

> Comprehensive log of architecture, implemented features, frontend design system, modular structure, components, data sources, and pending roadmap items.

---

## 1. Project Overview & Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS + Custom Design System (`src/app/globals.css`)
- **UI Components & Primitives**: Lucide React, Custom Base UI, Radix-based primitives, Custom motion components
- **Database & Auth**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Fonts & Typography**: Inter, Playfair Display, Cinzel (Artisanal luxury dining aesthetic)

---

## 2. Summary of Work Done Till Now

### A. Homepage Modularization & Section Architecture
Extracted heavy inline sections out of `src/app/page.tsx` into modular components under `src/components/sections/home/`:
- **`HeroSection.tsx`**: Luxury hero banner with dynamic copy, quick reservation CTAs, and interactive stat counters.
- **`ParallaxHeroBg.tsx`**: Layered parallax background effect for atmospheric depth.
- **`FeaturedDishesSection.tsx`**: Highlighted culinary specialties utilizing `FoodCard` and `HighlightGrid`.
- **`GoogleReviewsMarquee.tsx`**: Continuous looping testimonial marquee driven by `Marquee.tsx`.
- **`HomeFaqSection.tsx`**: Interactive expandable FAQ accordion (`FaqAccordion.tsx`).
- **`HomeCtaBanner.tsx`**: Redesigned conversion banner with dual CTA options, trust markers, and golden badge accents.
- **`AboutSection.tsx` & `GlobalRootsSection.tsx`**: Brand story, 3D interactive Globe (`cobe`), culinary heritage, and award milestones.
- **Section Dividers**: Elegant alternating gradient dividers (gold/red/white) integrated into `page.tsx` for visual pacing.

---

### B. Global Navigation, Utilities & Enhancements
- **Back to Top (`src/components/BackToTop.tsx`)**:
  - Automatically appears when page scroll exceeds viewport height.
  - Smooth scroll to top with luxury amber glow and hover transitions.
- **Page Transitions & Smooth Scroll**:
  - `SmoothScroll.tsx` (Lenis-based smooth scrolling).
  - `PageTransition.tsx` & `template.tsx` for route change animations.
- **Navbar & Footer**:
  - Responsive sticky luxury header with reservation quick links and mobile drawer.
  - Comprehensive luxury footer with operating hours, social links, and newsletter subscription.

---

### C. UI Components & Visual Polish
- **`RevealOnScroll.tsx` (`src/components/ui/reveal-on-scroll.tsx`)**:
  - IntersectionObserver-powered reveal animation supporting `fade-up`, `fade-down`, `fade-left`, `fade-right`, and `zoom-in`.
- **`AnimatedCounter.tsx` (`src/components/ui/animated-counter.tsx`)**:
  - Smooth easing numerical counters triggering on viewport entry (e.g., `15+`, `100%`, `4.9★`, `5000+`).
- **`Marquee.tsx` (`src/components/ui/marquee.tsx`)**:
  - Seamless horizontal looping marquee with pause-on-hover capability.
- **`FuseButton.tsx` (`src/components/FuseButton.tsx`)**:
  - Custom explosive fuse/particle button effect.
  - Configured with thick white borders, strict input validation checks prior to action execution, and state handling.
- **`HighlightGrid.tsx` & `InteractiveHoverButton.tsx`**:
  - Micro-interactions, cursor tracking glows, and button hover dynamics.
- **`SystemErrorPanel` (`src/components/ui/system-error-panel/` / `ErrorSixDemo`)**:
  - Modern error state panel with action buttons and diagnostic visuals.
- **`InputOtp9.tsx` (`src/components/input-otp-9.tsx`)**:
  - Styled 4-6 digit split OTP input boxes with focus rings and automatic caret progression.

---

### D. Centralized Data Architecture (`src/data/`)
Per architecture standards, all hardcoded data has been decoupled into dedicated JSON files:
- **`src/data/reviews.json`**: Customer ratings, avatars, and review quotes for the Google Reviews Marquee.
- **`src/data/faqs.json`**: Questions and answers covering dietary restrictions, reservations, and private events.
- **`src/data/global-roots.json`**: International culinary heritage locations and coordinates for the 3D globe.
- **`src/data/gallery.json`**: Categorized visual showcase (dishes, ambiance, kitchen, drinks) with aspect ratios.

---

### E. Pages & Views Built
1. **Home (`/`)**: Complete interactive showcase with animated counters, marquee, 3D globe, and split reveals.
2. **Gallery (`/galary`)**: Masonry photo gallery consuming `src/data/gallery.json` with lightbox zoom modal and category filtering.
3. **Menu (`/menu`)**: Dynamic catalog with category filtering (`MenuClientCatalog.tsx`), dietary tags, and portion selection.
4. **Reservation System (`/reserve` & `/admin`)**:
   - Date, time slot, party size picker (`CoachSchedulingCard.tsx`, `Calender.tsx`).
   - Admin management table (`AdminReservationManagement.tsx`).
   - Supabase schema migrations (`supabase_reservation_policies.sql`, `supabase_add_portions.sql`, `supabase_seed_menu.sql`).
5. **Profile Dashboard (`/profile`)**:
   - Comprehensive profile dashboard ([page.tsx](file:///x:/projects/resturant/src/app/profile/page.tsx), [ProfileClientView.tsx](file:///x:/projects/resturant/src/app/profile/ProfileClientView.tsx)).
   - Avatar photo upload via Kokonut UI `FileUpload` modal to Supabase Storage.
   - Profile information editing (full name, verified mobile, email, birthday calendar picker via [simple-calender.tsx](file:///x:/projects/resturant/src/components/ui/simple-calender.tsx)).
   - Replaced basic native date input with interactive luxury BirthdayCalendar card.
   - "My Bookings" tab displaying real-time reservation status badges (Confirmed, Pending, Cancelled) and booking timestamps.
   - Danger Zone: "Delete Account" action with confirmation dialog, profile data erasure, avatar asset removal, and session termination.
   - Cleaned UI: Completely removed subscriptions, "VIP Diner", "VIP Member", "Dining Profile block", and "Settings".
6. **About Us (`/about-us`), Contact (`/contact`), Privacy (`/privacy`), Terms (`/terms`)**: Standard content layouts.
7. **404 Page (`/not-found.tsx`)**: Themed luxury error page with navigation fallbacks.

---

## 3. Auth & Signup/Signin Overhaul Status

### Completed:
1. **Form Styling (`/login`)**:
   - Replaced flat statement-like inputs with clearly defined, accessible, bordered input fields with labels (`Full Name *`, `Mobile Number *`, `Email Address (optional)`, `Dietary Preference`).
   - Integrated +91 phone country code badge, clear hover/focus amber glow rings, validation error indicators, and high-contrast typography.
2. **OTP Verification Integration (`InputOtp9`)**:
   - Integrated [InputOtp9](file:///x:/projects/resturant/src/components/input-otp-9.tsx) into [AuthSwitch](file:///x:/projects/resturant/src/components/ui/auth-switch.tsx) for both Sign In and Sign Up flows.
   - Configured split OTP slots (`[3] — [3]`) with gold focus borders, keyboard auto-advance, backspace handling, error styling, and automatic submission on complete 6-digit entry.

### Next Steps:
- Verify SMS gateway / Supabase Twilio or MessageBird settings in production or Supabase test phone credentials.
- Test session persistence across table reservation checkout flow.

