import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function formatIndianPhoneNumber(phone?: string | null): { valid: boolean; formatted: string; error?: string } {
  if (!phone || !phone.trim()) {
    return { valid: true, formatted: "" };
  }

  let cleaned = phone.replace(/[\s\-\(\)]/g, "");

  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(cleaned)) {
    return {
      valid: false,
      formatted: "",
      error: "Please enter a valid 10-digit mobile number (starting with 6, 7, 8, or 9).",
    };
  }

  return { valid: true, formatted: `+91${cleaned}` };
}

// POST: Send OTP or Verify OTP or Logout
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { action } = body;

    // 1. LOGOUT
    if (action === "logout") {
      await supabase.auth.signOut();
      return NextResponse.json({ success: true });
    }

    // 2. SEND OTP
    if (action === "send-otp") {
      const { email, fullName, phone, foodPreference = "all" } = body;
      const cleanEmail = email?.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return NextResponse.json({
          success: false,
          error: "Please enter a valid email address."
        }, { status: 400 });
      }

      const cleanName = fullName?.trim() || "Customer";

      let formattedPhone: string | null = null;
      if (phone?.trim()) {
        const phoneCheck = formatIndianPhoneNumber(phone);
        
        if (!phoneCheck.valid) {
          return NextResponse.json({
            success: false,
            error: phoneCheck.error
          }, { status: 400 });
        }
        formattedPhone = phoneCheck.formatted || null;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: cleanName,
            email: cleanEmail,
            phone: formattedPhone,
            food_preference: foodPreference,
            role: "customer",
          },
        },
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, email: cleanEmail });
    }

    // 3. VERIFY OTP
    if (action === "verify-otp") {
      const { email, token, fullName, phone, foodPreference = "all" } = body;
      const cleanEmail = email?.trim().toLowerCase();
      const cleanToken = token?.trim();

      if (!cleanEmail || !cleanToken || cleanToken.length !== 6) {
        return NextResponse.json({ success: false, error: "Valid email and 6-digit code are required." }, { status: 400 });
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: "email",
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      const user = data.user;
      if (user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("full_name, phone, food_preference, email")
          .eq("id", user.id)
          .maybeSingle();

        const resolvedFullName =
          fullName && fullName !== "Customer"
            ? fullName
            : existingProfile?.full_name || (user.user_metadata?.full_name as string) || "Customer";

        let formattedPhone = phone;
        if (formattedPhone) {
          const phoneCheck = formatIndianPhoneNumber(formattedPhone);
          if (phoneCheck.valid && phoneCheck.formatted) {
            formattedPhone = phoneCheck.formatted;
          }
        } else if (existingProfile?.phone) {
          formattedPhone = existingProfile.phone;
        }

        const updates: Record<string, any> = {
          id: user.id,
          email: cleanEmail,
          full_name: resolvedFullName,
          phone: formattedPhone || null,
          updated_at: new Date().toISOString(),
        };

        if (foodPreference && foodPreference !== "all") {
          updates.food_preference = foodPreference;
        } else if (existingProfile?.food_preference) {
          updates.food_preference = existingProfile.food_preference;
        } else {
          updates.food_preference = "all";
        }

        await supabase.from("profiles").upsert(updates, { onConflict: "id" });
      }

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
