import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface DateOccupancyInfo {
  date: string;
  density: "low" | "medium" | "high" | "full" | "closed";
  bookedCount: number;
  maxCount: number;
  remainingTables: number;
  isClosed: boolean;
  reason?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const daysAhead = Number(searchParams.get("days") || 45);

    const supabase = await createClient();

    const [
      { data: tables, error: tErr },
      { data: slots, error: sErr },
      { data: hours },
      { data: closures },
    ] = await Promise.all([
      supabase.from("restaurant_tables").select("*").eq("is_active", true).order("capacity", { ascending: true }),
      supabase.from("reservation_slots").select("*").eq("is_active", true).order("start_time", { ascending: true }),
      supabase.from("restaurant_hours").select("*").order("day_of_week", { ascending: true }),
      supabase.from("restaurant_closures").select("*"),
    ]);

    if (tErr) throw new Error(tErr.message);
    if (sErr) throw new Error(sErr.message);

    const activeTables = tables || [];
    const activeSlots = slots || [];
    const activeHours = hours || [];
    const activeClosures = closures || [];

    const totalTables = activeTables.length;
    const totalSlots = activeSlots.length;
    const maxDailyBookings = Math.max(1, totalTables * totalSlots);

    const today = new Date();
    const startDateStr = today.toISOString().split("T")[0];

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysAhead);
    const endDateStr = endDate.toISOString().split("T")[0];

    const { data: reservations } = await supabase
      .from("reservations")
      .select("id, table_id, slot_id, reservation_date, status")
      .gte("reservation_date", startDateStr)
      .lte("reservation_date", endDateStr)
      .neq("status", "CANCELLED");

    const existingReservations = reservations || [];
    const dateOccupancyMap: Record<string, DateOccupancyInfo> = {};

    for (let i = 0; i <= daysAhead; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();

      const daySchedule = activeHours.find((h) => h.day_of_week === dayOfWeek);
      const isDayClosed = daySchedule?.is_closed ?? false;

      const closureRecord = activeClosures.find((c) => c.close_date === dateStr);
      const isCustomClosed = !!closureRecord;

      const isClosed = isDayClosed || isCustomClosed;
      const closeReason = closureRecord?.reason || (isDayClosed ? "Weekly Rest Day" : undefined);

      const dayBookings = existingReservations.filter((r) => r.reservation_date === dateStr);
      const bookedCount = dayBookings.length;
      const remaining = Math.max(0, maxDailyBookings - bookedCount);

      let density: DateOccupancyInfo["density"] = "low";

      if (isClosed) {
        density = "closed";
      } else if (bookedCount >= maxDailyBookings) {
        density = "full";
      } else if (bookedCount > Math.floor(maxDailyBookings * 0.6)) {
        density = "high";
      } else if (bookedCount > Math.floor(maxDailyBookings * 0.25)) {
        density = "medium";
      } else {
        density = "low";
      }

      dateOccupancyMap[dateStr] = {
        date: dateStr,
        density,
        bookedCount,
        maxCount: maxDailyBookings,
        remainingTables: remaining,
        isClosed,
        reason: closeReason,
      };
    }

    return NextResponse.json({
      success: true,
      tables: activeTables,
      slots: activeSlots,
      dateOccupancyMap,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
