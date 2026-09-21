import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile });
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
    const { full_name, email, phone, birthday, food_preference, dietary_notes } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updates.full_name = full_name?.trim() || null;
    if (email !== undefined && email) updates.email = email.trim();
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (birthday !== undefined) updates.birthday = birthday || null;
    if (food_preference !== undefined) updates.food_preference = food_preference;
    if (dietary_notes !== undefined) updates.dietary_notes = dietary_notes?.trim() || null;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: "No image file provided." }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size exceeds 2MB limit." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `userPfp/${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "0",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ success: false, error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: avatarUrl });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Delete profile (cascades or cleans up)
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Sign out user
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


