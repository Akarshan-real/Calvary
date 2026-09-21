import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCachedOrFetch, invalidateCache } from "@/lib/cache";
import type { MenuCategory, MenuItem } from "@/types/database";

export async function GET() {
  try {
    const data = await getCachedOrFetch(
      "menu:catalog",
      async () => {
        const supabase = await createClient();
        const [{ data: categories, error: catErr }, { data: items, error: itemErr }] =
          await Promise.all([
            supabase.from("menu_categories").select("*").order("display_order", { ascending: true }),
            supabase
              .from("menu_items")
              .select("*, media_assets(*), menu_item_nutrition(*)")
              .order("display_order", { ascending: true }),
          ]);

        if (catErr) throw new Error(catErr.message);
        if (itemErr) throw new Error(itemErr.message);

        return {
          categories: (categories as MenuCategory[]) || [],
          items: (items as MenuItem[]) || [],
        };
      },
      300 // 5 minutes cache
    );

    return NextResponse.json({ success: true, ...data });
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

    const body = await req.json();
    const { nutrition, ...itemData } = body;

    const { data: item, error: itemError } = await supabase
      .from("menu_items")
      .upsert(itemData)
      .select()
      .single();

    if (itemError) {
      return NextResponse.json({ success: false, error: itemError.message }, { status: 400 });
    }

    let savedNutrition = null;
    if (nutrition && item) {
      const { data: nutData, error: nutErr } = await supabase
        .from("menu_item_nutrition")
        .upsert({
          item_id: item.id,
          calories: nutrition.calories !== undefined ? nutrition.calories : null,
          protein_g: nutrition.protein_g !== undefined ? nutrition.protein_g : null,
          carbs_g: nutrition.carbs_g !== undefined ? nutrition.carbs_g : null,
          fat_g: nutrition.fat_g !== undefined ? nutrition.fat_g : null,
          fiber_g: nutrition.fiber_g !== undefined ? nutrition.fiber_g : null,
          allergens: Array.isArray(nutrition.allergens) ? nutrition.allergens : [],
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!nutErr && nutData) {
        savedNutrition = nutData;
      }
    }

    // Invalidate cached menu catalog
    invalidateCache("menu:catalog");

    return NextResponse.json({
      success: true,
      item: {
        ...item,
        menu_item_nutrition: savedNutrition,
      },
    });
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
    const { id, is_available, ...otherFields } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Item ID required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { ...otherFields };
    if (is_available !== undefined) {
      updatePayload.is_available = is_available;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .update(updatePayload)
      .eq("id", Number(id))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    invalidateCache("menu:catalog");
    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Item ID required" }, { status: 400 });
    }

    const { error } = await supabase.from("menu_items").delete().eq("id", Number(id));
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    invalidateCache("menu:catalog");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
