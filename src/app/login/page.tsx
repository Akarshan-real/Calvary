import type { Metadata } from "next";
import AuthSwitch from "@/components/ui/auth-switch";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In / Sign Up | Calvary Restaurant",
  description: "Sign in or create your Calvary dining account with your email address.",
};

export default async function LoginPage() {
  const authData = await getCurrentUser();

  // If already logged in, redirect to home
  if (authData?.user) {
    redirect("/");
  }

  return <AuthSwitch />;
}
