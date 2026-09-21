import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reservationId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: res, error } = await supabase
      .from("reservations")
      .select("*, restaurant_tables(*), reservation_slots(*)")
      .eq("id", reservationId)
      .maybeSingle();

    if (error || !res) {
      return NextResponse.json({ success: false, error: "Reservation not found" }, { status: 404 });
    }

    const isOwner =
      res.user_id === user.id ||
      (user.phone && res.customer_phone === user.phone) ||
      (user.email && res.customer_email === user.email);

    if (!isOwner) {
      return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 });
    }

    const tableName = res.restaurant_tables?.table_number
      ? `Table ${res.restaurant_tables.table_number}`
      : "Your reserved table";
    const timeSlot = res.reservation_slots?.start_time || "scheduled time";

    await sendEmail({
      to: res.customer_email,
      name: res.customer_name,
      subject: `Upcoming Dining Reminder: Calvary Restaurant (${res.reservation_date})`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0e14; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #272a38;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffbe33; font-size: 28px; margin: 0; font-family: Georgia, serif;">CALVARY</h1>
            <p style="color: #a0a5b8; font-size: 13px; margin-top: 6px; text-transform: uppercase;">Dining Reminder & Itinerary</p>
          </div>
          <div style="background-color: #151824; padding: 24px; border-radius: 12px; border: 1px solid #232738;">
            <p>Dear ${res.customer_name},</p>
            <p>This is a gentle reminder that our culinary team is preparing for your table reservation at <strong style="color: #ffbe33;">Calvary Fine Dining</strong>!</p>
            <div style="border-top: 1px dashed #34384d; margin: 16px 0; padding-top: 12px;">
              <p style="margin: 6px 0;"><strong>📅 Date:</strong> ${res.reservation_date}</p>
              <p style="margin: 6px 0;"><strong>⏰ Time:</strong> ${timeSlot}</p>
              <p style="margin: 6px 0;"><strong>🍽️ Table:</strong> ${tableName}</p>
              <p style="margin: 6px 0;"><strong>👥 Guests:</strong> ${res.party_size} Guests</p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
