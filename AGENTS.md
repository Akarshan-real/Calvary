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
1. **Email OTP Authentication Transition**:
   - Switched from SMS/Twilio OTP to **Email OTP** (`supabase.auth.signInWithOtp({ email, ... })` and `verifyOtp({ email, token, type: 'email' })`).
   - Implemented `sendEmailOtp` and `verifyEmailOtp` in [`src/app/actions/auth.ts`](file:///x:/projects/resturant/src/app/actions/auth.ts).
   - Created Supabase SQL migration [`supabase_migration_email_not_null.sql`](file:///x:/projects/resturant/supabase_migration_email_not_null.sql) to backfill profiles and enforce `email NOT NULL` while making `phone` nullable.
2. **Form Redesign (`/login`)**:
   - In [`AuthSwitch`](file:///x:/projects/resturant/src/components/ui/auth-switch.tsx), converted Sign In to email-first input with email validation regex.
   - On Sign Up: Full Name (`*`) and Email (`*`) are mandatory; Mobile Number is an optional contact field.
3. **OTP Verification Experience (`InputOtp9`)**:
   - Preserved luxury 6-digit split OTP slots (`[3] — [3]`) driven by [`InputOtp9`](file:///x:/projects/resturant/src/components/input-otp-9.tsx).
   - Updated copy to clearly indicate that a 6-digit verification code is delivered to the user's email inbox (with reminder to check spam).
   - Added clean "Change email address" / "Change email or edit details" resets.
4. **Profile Dashboard Update (`/profile`)**:
   - Made **Email Address** the verified, read-only credential with the Verified badge.
   - Made **Mobile Number** an editable contact field that can be updated alongside full name and birthday.
   - Updated `Profile` TypeScript interface in [`src/types/database.ts`](file:///x:/projects/resturant/src/types/database.ts) so `email: string` is non-nullable.

### Next Steps:
- Execute [`supabase_migration_email_not_null.sql`](file:///x:/projects/resturant/supabase_migration_email_not_null.sql) in Supabase SQL Editor.
- Ensure Supabase Email Auth provider is enabled in the dashboard.

---

## 4. Hospitality & Dining Experience Enhancements

### A. Calendar Export & Dining Itinerary Reminders
- **1-Click Calendar Sync ([AddToCalendarButton.tsx](file:///x:/projects/resturant/src/components/reservation/AddToCalendarButton.tsx), [calendar.ts](file:///x:/projects/resturant/src/lib/calendar.ts))**:
  - Direct integration with Google Calendar (one-click pre-filled event link).
  - RFC-5545 compliant `.ics` iCalendar generator/downloader for Apple Calendar, Outlook, and mobile devices.
  - Automatically embedded in booking confirmation receipts (`CoachSchedulingCard`), `MyBookingsClientView`, and `ProfileClientView`.
- **Automated Dining Reminders (`sendDiningReminder`)**:
  - One-click itinerary email dispatch for guests on confirmed bookings.
  - Formatted email containing reservation date, time, table number, zone, and valet parking instructions.

### B. Interactive Table Floor Map Visualizer
- **Architectural Floor Plan ([TableFloorMap.tsx](file:///x:/projects/resturant/src/components/reservation/TableFloorMap.tsx))**:
  - Custom SVG/CSS floor plan visually mapping Calvary's 4 dining zones:
    1. *Window View Bay* (Tables 1–3)
    2. *Grand Dining Hall* (Tables 4–7)
    3. *Artisanal Private Booths* (Tables 8–10)
    4. *Veranda & Garden Patio* (Tables 11–13)
  - Live table availability and occupancy indicators matching database state.
  - Dual view toggle `[Floor Map | List View]` embedded seamlessly into Step 2 of `CoachSchedulingCard`.

### C. Concluded Dining History & Guest Reviews
- **Dining Reviews ([DiningReviewModal.tsx](file:///x:/projects/resturant/src/components/reservation/DiningReviewModal.tsx), [user-reservations.ts](file:///x:/projects/resturant/src/app/actions/user-reservations.ts))**:
  - Automatic identification of concluded dining reservations.
  - Interactive 1–5 star rating system with luxury gold star animations and chef feedback notes.
  - Accessible via "Rate Dining" triggers in both `MyBookingsClientView` and `ProfileClientView`.

### D. Cinematic Parallax & Animation System Across All Pages
- **Parallax Hero Atmospheric System ([ParallaxHeroBg.tsx](file:///x:/projects/resturant/src/components/sections/home/ParallaxHeroBg.tsx))**:
  - Extended cinematic layered parallax backgrounds with subtle darkness gradients across:
    - `/menu` (Culinary Catalog)
    - `/about-us` (Heritage & Ethos)
    - `/contact` (Concierge & Headquarters)
    - `/reserve` (Table Booking Experience)
    - `/galary` (Visual Showcase)
    - `/my-bookings` (Guest Reservation Manager)
- **Viewport Scroll Reveals ([RevealOnScroll.tsx](file:///x:/projects/resturant/src/components/ui/reveal-on-scroll.tsx))**:
  - Integrated directional reveals (fade-up, fade-down, slide-left, slide-right) with staggered micro-delays for cards, text headers, forms, and galleries.

---

### E. My Bookings Modernization & Database Expansion
- **Spacious 2-Column Booking Cards ([MyBookingsClientView.tsx](file:///x:/projects/resturant/src/app/my-bookings/MyBookingsClientView.tsx))**:
  - Replaced cramped 3-column layout with a generous 2-column grid (`lg:grid-cols-2 gap-8`), providing ~600px width per card with `p-7 sm:p-8` internal padding.
  - Removed `overflow-hidden` from cards so tooltips and popovers never clip.
  - Visual hierarchy: Booking reference tag, Zone badge, VIP indicators, large table number, 2-column date & time tiles with gold icons, customer info, and quote block for special requests.
  - Uncramped footer action row with separated action groups (Calendar / Reminder / Review on the left, Alter / Cancel on the right).
- **Portal-based AddToCalendarButton ([AddToCalendarButton.tsx](file:///x:/projects/resturant/src/components/reservation/AddToCalendarButton.tsx))**:
  - Converted dropdown to Base UI Popover rendering inside a portal with `z-50`, ensuring it floats freely without displacing card content.
- **Date Range Filtering with DatePicker6 ([date-picker-6.tsx](file:///x:/projects/resturant/src/components/date-picker-6.tsx))**:
  - Upgraded `DatePicker6` with full dual-mode support: controlled Date Range mode (`range`, `onRangeChange`) and single-date fallback (`value`, `onChange`).
  - Integrated luxury gold range styling (`range_start`, `range_middle`, `range_end`), automatic range formatting via `little-date`, single-day fallback display, and quick clear reset.
  - Deployed in `/my-bookings` ([MyBookingsClientView.tsx](file:///x:/projects/resturant/src/app/my-bookings/MyBookingsClientView.tsx)) to filter bookings across customizable date spans.
  - Deployed in `/admin` ([AdminReservationManagement.tsx](file:///x:/projects/resturant/src/components/AdminReservationManagement.tsx)) alongside the search input for filtering all guest reservations by start and end dates.
- **`restaurant_tables` Schema Expansion & Seeding ([supabase_migration_restaurant_tables_expand.sql](file:///x:/projects/resturant/supabase_migration_restaurant_tables_expand.sql), [database.ts](file:///x:/projects/resturant/src/types/database.ts))**:
  - Added new columns: `zone`, `zone_slug`, `description`, `shape`, `min_capacity`, `is_vip`, `sort_order`, `floor`.
  - Expanded table inventory to 14 signature tables across 4 zones:
    - *Window View Bay*: T1 (2 seats), T2 (4 seats), T3 (4 seats)
    - *Grand Dining Hall*: T4 (6 seats), T5 (8 seats), T6 (8 seats), T7 (4 seats), T8 (6 seats)
    - *Artisanal Private Booths*: T9 (4 seats, VIP), T10 (6 seats, VIP), T11 (6 seats, VIP)
    - *Veranda & Garden Patio*: T12 (2 seats), T13 (4 seats), T14 (10 seats, VIP)
  - Updated [TableFloorMap.tsx](file:///x:/projects/resturant/src/components/reservation/TableFloorMap.tsx) and [CoachSchedulingCard.tsx](file:///x:/projects/resturant/src/components/CoachSchedulingCard.tsx) to support the expanded table schemas with graceful fallbacks.

---

## 5. REST API Architecture, TanStack Query & Server Caching Overhaul

### A. Centralized REST API Route Handlers (`src/app/api/*`)
Migrated direct frontend Server Action calls to dedicated RESTful API Route Handlers providing robust error responses, role validation, authentication checks, and server caching:
- **`GET/POST/DELETE /api/menu` ([route.ts](file:///x:/projects/resturant/src/app/api/menu/route.ts))**:
  - `GET`: Cached retrieval of categories and menu items with nutrition, portions, and allergens.
  - `POST`: Upsert menu item (admin role check enforced) + automatic cache invalidation.
  - `DELETE`: Remove menu item by query param `?id=...` + automatic cache invalidation.
- **`GET/POST /api/reservations` ([route.ts](file:///x:/projects/resturant/src/app/api/reservations/route.ts))**:
  - `GET`: Authenticated reservation fetcher (admin list with relations or guest's personal reservations matching user ID, phone, or email).
  - `POST`: Collision-safe reservation booking with email verification, party size constraint validation, and confirmation dispatch.
- **`PATCH /api/reservations/[id]` ([route.ts](file:///x:/projects/resturant/src/app/api/reservations/[id]/route.ts))**:
  - Supports dynamic actions: `cancel`, `alter`, `approve` (admin only with email notification), `reject` (admin only with reason and decline notice), and `email` (admin bespoke concierge email dispatch).
- **`GET /api/reservations/availability` ([route.ts](file:///x:/projects/resturant/src/app/api/reservations/availability/route.ts))**:
  - Dynamic slot & table availability query by date (`?date=YYYY-MM-DD`). Real-time table collision checks against database reservations.
- **`GET /api/reservations/calendar` ([route.ts](file:///x:/projects/resturant/src/app/api/reservations/calendar/route.ts))**:
  - Returns 45-day heatmap density occupancy mapping (`low`, `medium`, `high`, `full`, `closed`) along with active tables and slots.
- **`POST /api/reservations/[id]/reminder` ([route.ts](file:///x:/projects/resturant/src/app/api/reservations/[id]/reminder/route.ts))**:
  - Dispatches one-click HTML dining itinerary reminder email to the guest.
- **`POST /api/reservations/[id]/review` ([route.ts](file:///x:/projects/resturant/src/app/api/reservations/[id]/review/route.ts))**:
  - Records guest 1-5 star dining review ratings and culinary feedback comments on concluded dining visits.
- **`GET/PATCH/DELETE /api/profile` ([route.ts](file:///x:/projects/resturant/src/app/api/profile/route.ts))**:
  - Current user profile retrieval, sanitized partial updates (full name, email, phone, birthday, food preferences), and account erasure.
- **`GET/POST/PATCH/DELETE /api/contact` ([route.ts](file:///x:/projects/resturant/src/app/api/contact/route.ts))**:
  - Guest contact message submissions with Brevo auto-acknowledgment email dispatch, and admin inbox inquiry management.
- **`GET/PATCH /api/settings` ([route.ts](file:///x:/projects/resturant/src/app/api/settings/route.ts))**:
  - Cached restaurant profile, operating hours, and configuration settings.
- **`GET/POST/DELETE /api/gallery` ([route.ts](file:///x:/projects/resturant/src/app/api/gallery/route.ts))**:
  - Curated visual showcase items with category filtering and custom image additions.

---

### B. Redis-Ready Server Caching Adapter (`src/lib/cache.ts`)
- **Dual-Mode Cache Strategy**:
  - In-memory Map cache with TTL and timestamp eviction as standard local runtime fallback.
  - Pluggable Redis configuration: Detects `REDIS_URL` or `UPSTASH_REDIS_REST_URL` to effortlessly switch to distributed Redis without modifying any route handlers or UI components.
  - Utilities: `getCachedOrFetch<T>(key, fetcher, ttlSeconds)` and `invalidateCache(keyOrPrefix)`.

---

### C. Client-Side Data Layer & TanStack Query Hooks (`src/hooks/api/*`)
- **`QueryProvider` ([query-provider.tsx](file:///x:/projects/resturant/src/providers/query-provider.tsx))**:
  - Configured globally in `src/app/layout.tsx` with 5-minute default stale time and 30-minute garbage collection time.
- **Dedicated Hooks**:
  - `use-menu.ts`: `useMenu(initialData)`, `useUpsertMenuItem()`, `useDeleteMenuItem()`.
  - `use-reservations.ts`: `useUserReservations()`, `useCreateReservation()`, `useCancelReservation()`, `useAlterReservation()`, `useSendReminder()`, `useSubmitReview()`.
  - `use-scheduling.ts`: `useCalendarData()`, `useSlotAvailability(date)`.
  - `use-admin-reservations.ts`: `useAdminReservations()`, `useApproveReservation()`, `useRejectReservation()`, `useSendAdminEmail()`.
  - `use-profile.ts`: `useProfile()`, `useUpdateProfile()`, `useDeleteAccount()`.

---

### D. Component Modernization
- **`CoachSchedulingCard.tsx`**:
  - Real-time slot availability powered by `useSlotAvailability(selectedDate)` and calendar heatmap driven by `useCalendarData()`.
  - Instant table collision lock and reservation submission via `useCreateReservation().mutateAsync`.
- **`AdminReservationManagement.tsx`**:
  - Live table approval, rejection with reasons, and custom guest emails powered by TanStack Query mutations with instant optimistic cache invalidation.
- **`MyBookingsClientView.tsx`**:
  - Guest bookings synchronized via `useUserReservations()`, with 1-click reminders and cancellations powered by TanStack Query.
- **`ProfileClientView.tsx`**:
  - Reactive profile updates and account deletion through `useUpdateProfile()` and `useDeleteAccount()`.
- **`MenuClientCatalog.tsx`**:
  - Instant SSR hydration fallback coupled with `useMenu()` query cache for dynamic category and dish updates.
- **Modals (`EditReservationModal.tsx`, `DiningReviewModal.tsx`)**:
  - Direct integration with TanStack Query mutations (`useAlterReservation`, `useSubmitReview`) triggering multi-cache invalidations across user bookings, calendar heatmap, and slot availability.

---

### E. Complete Elimination of Server Actions (`actions/`)
- **Deprecated & Removed**: The entire `src/app/actions/` directory has been deleted (`auth.ts`, `gallery.ts`, `media.ts`, `profile.ts`, `restaurant.ts`, `user-reservations.ts`).
- **Server Data Layer (`src/lib/db-server.ts` & `src/lib/auth-server.ts`)**:
  - Server components (SSR pages) now import pure database and auth utilities directly without `'use server'` RPC action wrappers, avoiding client action bundle exposure and improving render efficiency.
- **REST API Endpoints (`src/app/api/*`)**:
  - All client components communicate exclusively with `/api/auth`, `/api/profile`, `/api/menu`, `/api/media`, `/api/gallery`, `/api/contact`, `/api/reservations`, and `/api/settings`.
- **Zero TypeScript Errors**: Type integrity verified across all pages and components with `npx tsc --noEmit`.
