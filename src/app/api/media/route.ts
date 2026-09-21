import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BUCKET_NAME, type ImageFolder } from "@/lib/supabase/storage";
import { invalidateCache } from "@/lib/cache";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = ((formData.get("folder") as string) || "items") as ImageFolder;
    const fileName = (formData.get("fileName") as string) || file?.name || "upload";
    const altText = (formData.get("altText") as string) || "";

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const cleanBase = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const filePath = `${folder}/${Date.now()}_${cleanBase}.${fileExt}`;

    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      return NextResponse.json({ success: false, error: storageError.message }, { status: 400 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    const { data: asset, error: dbError } = await supabase
      .from("media_assets")
      .insert({
        file_path: filePath,
        file_name: fileName,
        public_url: urlData.publicUrl,
        folder,
        alt_text: altText,
        mime_type: file.type,
        size_bytes: file.size,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 400 });
    }

    invalidateCache("gallery:items");
    invalidateCache("menu:catalog");

    return NextResponse.json({ success: true, data: asset });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
