import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function PATCH(
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

    const body = await req.json();
    const { action } = body;

    // Fetch current reservation
    const { data: current, error: fetchErr } = await supabase
      .from("reservations")
      .select("*, restaurant_tables(*), reservation_slots(*)")
      .eq("id", reservationId)
      .maybeSingle();

    if (fetchErr || !current) {
      return NextResponse.json({ success: false, error: "Reservation not found" }, { status: 404 });
    }

    const isOwner =
      current.user_id === user.id ||
      (user.phone && current.customer_phone === user.phone) ||
      (user.email && current.customer_email === user.email);

    // Check user's role for admin operations
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin";

    // 1. CANCEL ACTION
    if (action === "cancel") {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 });
      }

      const { error: updateErr } = await supabase
        .from("reservations")
        .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
        .eq("id", reservationId);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    // 2. ALTER ACTION
    if (action === "alter") {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 });
      }

      const { reservation_date, slot_id, table_id, party_size, special_request } = body;

      // Collision check
      const { data: collision } = await supabase
        .from("reservations")
        .select("id")
        .eq("table_id", table_id)
        .eq("slot_id", slot_id)
        .eq("reservation_date", reservation_date)
        .neq("id", reservationId)
        .neq("status", "CANCELLED")
        .maybeSingle();

      if (collision) {
        return NextResponse.json(
          { success: false, error: "Table was just taken for this slot. Please pick another table." },
          { status: 409 }
        );
      }

      const { data: updated, error: updateErr } = await supabase
        .from("reservations")
        .update({
          reservation_date,
          slot_id,
          table_id,
          party_size,
          special_request: special_request !== undefined ? special_request?.trim() || null : current.special_request,
          status: "PENDING",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reservationId)
        .select("*, restaurant_tables(*), reservation_slots(*)")
        .single();

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, reservation: updated });
    }

    // 3. ADMIN APPROVE ACTION
    if (action === "approve") {
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: "Admin authorization required" }, { status: 403 });
      }

      const { error: updateErr } = await supabase
        .from("reservations")
        .update({ status: "CONFIRMED", updated_at: new Date().toISOString() })
        .eq("id", reservationId);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 });
      }

      // Send approval email
      try {
        const tableName = current.restaurant_tables?.table_number
          ? `Table ${current.restaurant_tables.table_number}`
          : "your reserved table";
        const timeSlot = current.reservation_slots?.start_time || "scheduled time";

        await sendEmail({
          to: current.customer_email,
          name: current.customer_name,
          subject: `Reservation Confirmed: ${tableName} at Calvary Restaurant`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0e14; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #272a38;">
              <h1 style="color: #ffbe33; font-size: 28px; margin: 0; font-family: Georgia, serif;">CALVARY</h1>
              <p style="color: #a0a5b8; font-size: 13px; text-transform: uppercase;">Table Reservation Confirmed</p>
              <div style="background-color: #151824; padding: 24px; border-radius: 12px; margin-top: 16px;">
                <p>Dear ${current.customer_name},</p>
                <p>Your table reservation has been officially approved!</p>
                <p><strong>📅 Date:</strong> ${current.reservation_date}</p>
                <p><strong>⏰ Time:</strong> ${timeSlot}</p>
                <p><strong>🍽️ Table:</strong> ${tableName}</p>
                <p><strong>👥 Guests:</strong> ${current.party_size}</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("[Approval Email Error]", emailErr);
      }

      return NextResponse.json({ success: true });
    }

    // 4. ADMIN REJECT ACTION
    if (action === "reject") {
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: "Admin authorization required" }, { status: 403 });
      }

      if (current.status === "CONFIRMED") {
        return NextResponse.json(
          { success: false, error: "Cannot decline a confirmed reservation. Table is already locked." },
          { status: 400 }
        );
      }

      const { reason } = body;
      const { error: updateErr } = await supabase
        .from("reservations")
        .update({
          status: "CANCELLED",
          cancellation_reason: reason?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reservationId);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    // 5. ADMIN CUSTOM EMAIL ACTION
    if (action === "email") {
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: "Admin authorization required" }, { status: 403 });
      }

      if (!current.customer_email) {
        return NextResponse.json({ success: false, error: "No customer email found" }, { status: 400 });
      }

      const { subject, message } = body;
      if (!message || !message.trim()) {
        return NextResponse.json({ success: false, error: "Message content is required" }, { status: 400 });
      }

      const tableName = current.restaurant_tables?.table_number
        ? `Table ${current.restaurant_tables.table_number}`
        : "Reserved Table";
      const timeSlot = current.reservation_slots?.start_time || "Scheduled Time";

      const formattedMessage = message
        .trim()
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean)
        .map((p: string) => `<p style="margin: 8px 0; color: #f3f4f6; font-size: 14px; line-height: 1.6;">${p}</p>`)
        .join("");

      const emailRes = await sendEmail({
        to: current.customer_email,
        name: current.customer_name,
        subject: (subject || "Update regarding your reservation at Calvary Restaurant").trim(),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0e14; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #272a38;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #ffbe33; font-size: 28px; margin: 0; font-family: Georgia, serif; letter-spacing: 2px;">CALVARY</h1>
              <p style="color: #a0a5b8; font-size: 13px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Guest Concierge Message</p>
            </div>
            <div style="background-color: #151824; padding: 24px; border-radius: 12px; border: 1px solid #232738; margin-bottom: 24px;">
              <h2 style="font-size: 18px; color: #ffffff; margin-top: 0;">Dear ${current.customer_name},</h2>
              <div style="background-color: #0d0f15; border-left: 3px solid #ffbe33; padding: 14px 18px; border-radius: 8px; margin: 18px 0;">
                <p style="margin: 0 0 8px 0; color: #ffbe33; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Message from Dining Concierge:</p>
                ${formattedMessage}
              </div>
              <div style="border-top: 1px dashed #34384d; margin: 20px 0; padding-top: 16px;">
                <p style="margin: 4px 0; font-size: 13px; color: #9ca3af;"><strong>📅 Reservation Date:</strong> ${current.reservation_date}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #9ca3af;"><strong>⏰ Reserved Slot:</strong> ${timeSlot}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #9ca3af;"><strong>🍽️ Table:</strong> ${tableName} (${current.party_size} Guests)</p>
                <p style="margin: 4px 0; font-size: 13px; color: #9ca3af;"><strong>🔖 Reference:</strong> <span style="color: #ffbe33; font-family: monospace;">#${current.id.slice(0, 8).toUpperCase()}</span></p>
              </div>
            </div>
            <div style="text-align: center; color: #6b7280; font-size: 12px;">
              <p style="margin: 4px 0;">Calvary Restaurant • Artisanal Gastronomy</p>
              <p style="margin: 4px 0;">Phone: +91 98765 43210 • Email: reservations@calvary.com</p>
            </div>
          </div>
        `,
      });

      if (!emailRes.success) {
        return NextResponse.json({ success: false, error: emailRes.error || "Failed to send email" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
