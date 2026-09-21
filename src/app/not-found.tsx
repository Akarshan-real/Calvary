import SystemErrorPanel from "@/components/ui/system-error-panel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth-server";

export const metadata = {
  title: "404 - Page Not Found | Calvary Artisanal Cuisine & Bar",
  description: "The page or culinary experience you requested could not be found.",
};

export default async function NotFound() {
  const authData = await getCurrentUser().catch(() => null);

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white flex flex-col selection:bg-[#e60000] selection:text-white">
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

      <main className="flex-1 flex items-center justify-center py-16 px-4 max-w-6xl mx-auto w-full">
        <SystemErrorPanel
          code="404"
          title="This table isn't set."
          description="The culinary dish or page you attempted to open may have been moved, archived, or temporarily disconnected."
          buttonLabel="Return to Calvary Home"
          buttonHref="/"
        />
      </main>

      <Footer />
    </div>
  );
}
