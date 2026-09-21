import { NextResponse } from "next/server";
import { getGalleryItems } from "@/lib/db-server";
import { getCachedOrFetch, invalidateCache } from "@/lib/cache";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const items = await getCachedOrFetch(
      "gallery:items",
      async () => {
        return await getGalleryItems();
      },
      600 // 10 minutes cache
    );

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { title, imageUrl, category, tag, aspect } = body;

    if (!imageUrl || !imageUrl.trim()) {
      return NextResponse.json({ success: false, error: "Valid image URL required." }, { status: 400 });
    }

    const packed = JSON.stringify({
      category: category || "dishes",
      tag: tag?.trim() || "Artisanal Selection",
      aspect: aspect || "aspect-[4/3]",
    });

    const { data: asset, error } = await supabase
      .from("media_assets")
      .insert({
        file_path: `url_${Date.now()}`,
        file_name: title?.trim() || "Artisanal Selection",
        public_url: imageUrl.trim(),
        folder: "displayAssets",
        alt_text: packed,
        mime_type: "image/external",
        size_bytes: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    invalidateCache("gallery:items");
    return NextResponse.json({
      success: true,
      item: {
        id: asset.id,
        title: asset.file_name,
        category: category || "dishes",
        image: asset.public_url,
        aspect: aspect || "aspect-[4/3]",
        tag: tag || "Artisanal Selection",
        isCustom: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { id, title, imageUrl, category, tag, aspect } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Photo ID required." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updatePayload.file_name = title.trim();
    if (imageUrl !== undefined) updatePayload.public_url = imageUrl.trim();

    if (category !== undefined || tag !== undefined || aspect !== undefined) {
      const packed = JSON.stringify({
        category: category || "dishes",
        tag: tag?.trim() || "Artisanal Selection",
        aspect: aspect || "aspect-[4/3]",
      });
      updatePayload.alt_text = packed;
    }

    const { error: dbError } = await supabase
      .from("media_assets")
      .update(updatePayload)
      .eq("id", id);

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 400 });
    }

    invalidateCache("gallery:items");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Photo ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: dbError } = await supabase.from("media_assets").delete().eq("id", id);
    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 400 });
    }

    invalidateCache("gallery:items");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
