import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import GlobalRootsSection from "@/components/GlobalRootsSection";
import HeroSection from "@/components/sections/home/HeroSection";
import FeaturedDishesSection from "@/components/sections/home/FeaturedDishesSection";
import HomeFaqSection from "@/components/sections/home/HomeFaqSection";
import GoogleReviewsMarquee from "@/components/sections/home/GoogleReviewsMarquee";
import HomeCtaBanner from "@/components/sections/home/HomeCtaBanner";
import { getMenuItems, getRestaurantSettings } from "@/lib/db-server";
import { getCurrentUser } from "@/lib/auth-server";

/** Elegant gradient divider between sections */
function SectionDivider({ variant = "default" }: { variant?: "default" | "red" | "gold" }) {
  const gradients: Record<string, string> = {
    default: "from-transparent via-white/8 to-transparent",
    red: "from-transparent via-[#e60000]/20 to-transparent",
    gold: "from-transparent via-[#ffbe33]/15 to-transparent",
  };
  return (
    <div className={`w-full h-px bg-gradient-to-r ${gradients[variant]} my-0`} />
  );
}

export default async function Home() {
  const [items, settings, authData] = await Promise.all([
    getMenuItems().catch(() => []),
    getRestaurantSettings().catch(() => null),
    getCurrentUser().catch(() => null),
  ]);

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white flex flex-col selection:bg-[#e60000] selection:text-white">
      {/* Dynamic Navbar */}
      <Navbar
        user={
          authData?.user
            ? {
                name: authData.profile?.full_name,
                email: authData.user.email,
                role: authData.profile?.role,
                avatar: authData.profile?.avatar_url,
                phone: authData.user.phone,
              }
            : null
        }
      />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection settings={settings} />

        <SectionDivider variant="gold" />

        {/* 2. Signature Dishes Highlights */}
        <FeaturedDishesSection items={items} />

        <SectionDivider />

        {/* 3. About / Culinary Story */}
        <AboutSection />

        <SectionDivider variant="gold" />

        {/* 4. Global Culinary Provenance (3D Globe) */}
        <GlobalRootsSection />

        <SectionDivider />

        {/* 5. Frequently Asked Questions */}
        <HomeFaqSection />

        <SectionDivider variant="gold" />

        {/* 6. Google Reviews Marquee */}
        <GoogleReviewsMarquee />

        <SectionDivider />

        {/* 7. Reservation CTA Banner */}
        <HomeCtaBanner />
      </main>

      {/* Interactive Hover Footer */}
      <Footer />
    </div>
  );
}
