import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ success: false, error: "Date parameter required" }, { status: 400 });
    }

    const supabase = await createClient();

    const [{ data: tables }, { data: slots }, { data: existingReservations }] = await Promise.all([
      supabase.from("restaurant_tables").select("*").eq("is_active", true).order("capacity", { ascending: true }),
      supabase.from("reservation_slots").select("*").eq("is_active", true).order("start_time", { ascending: true }),
      supabase
        .from("reservations")
        .select("table_id, slot_id, status")
        .eq("reservation_date", date)
        .neq("status", "CANCELLED"),
    ]);

    const activeTables = tables || [];
    const activeSlots = slots || [];
    const bookings = existingReservations || [];

    const [year, month, day] = date.split("-").map(Number);
    const now = new Date();

    const slotsWithTables = activeSlots.map((slot) => {
      const bookedTableIds = new Set(
        bookings.filter((b) => b.slot_id === slot.id).map((b) => b.table_id)
      );

      const freeTables = activeTables.filter((t) => !bookedTableIds.has(t.id));

      const timeParts = (slot.start_time || "00:00").split(":").map(Number);
      const slotDateTime = new Date(year, month - 1, day, timeParts[0] || 0, timeParts[1] || 0, 0);
      const isPast = slotDateTime.getTime() <= now.getTime();

      return {
        slot,
        availableTables: isPast ? [] : freeTables,
        availableTableCount: isPast ? 0 : freeTables.length,
        isAvailable: !isPast && freeTables.length > 0,
        isPast,
      };
    });

    return NextResponse.json({ success: true, availability: slotsWithTables });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
