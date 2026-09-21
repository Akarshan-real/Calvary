import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCachedOrFetch, invalidateCache } from "@/lib/cache";

export async function GET() {
  try {
    const data = await getCachedOrFetch(
      "settings:all",
      async () => {
        const supabase = await createClient();
        const [{ data: settings }, { data: hours }] = await Promise.all([
          supabase.from("restaurant_settings").select("*").eq("id", 1).single(),
          supabase.from("restaurant_hours").select("*").order("day_of_week", { ascending: true }),
        ]);

        return {
          settings: settings || null,
          hours: hours || [],
        };
      },
      600 // 10 minutes cache
    );

    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { error } = await supabase
      .from("restaurant_settings")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    invalidateCache("settings:all");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
