import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(req.url);
    const isAdminQuery = searchParams.get("admin") === "true";

    if (isAdminQuery) {
      if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      // Check admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        return NextResponse.json({ success: false, error: "Admin permission required" }, { status: 403 });
      }

      const { data, error } = await supabase
        .from("reservations")
        .select("*, restaurant_tables(*), reservation_slots(*)")
        .order("reservation_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return NextResponse.json({ success: true, reservations: data || [] });
    }

    // Standard user reservations
    if (!user) {
      return NextResponse.json({ success: true, reservations: [] });
    }

    const userPhone = user.phone;
    const userEmail = user.email;

    let query = supabase
      .from("reservations")
      .select("*, restaurant_tables(*), reservation_slots(*)")
      .order("reservation_date", { ascending: false });

    if (userPhone && userEmail) {
      query = query.or(`user_id.eq.${user.id},customer_phone.eq.${userPhone},customer_email.eq.${userEmail}`);
    } else if (userPhone) {
      query = query.or(`user_id.eq.${user.id},customer_phone.eq.${userPhone}`);
    } else if (userEmail) {
      query = query.or(`user_id.eq.${user.id},customer_email.eq.${userEmail}`);
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, reservations: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const {
      table_id,
      slot_id,
      reservation_date,
      customer_name,
      customer_phone,
      customer_email,
      party_size,
      special_request,
    } = body;

    // Email verification
    const cleanEmail = customer_email?.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is mandatory for table reservations." },
        { status: 400 }
      );
    }

    // Collision check
    const { data: collision } = await supabase
      .from("reservations")
      .select("id")
      .eq("table_id", table_id)
      .eq("slot_id", slot_id)
      .eq("reservation_date", reservation_date)
      .neq("status", "CANCELLED")
      .maybeSingle();

    if (collision) {
      return NextResponse.json(
        {
          success: false,
          error: "This specific table was just reserved by another guest. Please select another table.",
        },
        { status: 409 }
      );
    }

    // Validate slot time has not passed
    const { data: slotRecord } = await supabase
      .from("reservation_slots")
      .select("start_time")
      .eq("id", slot_id)
      .maybeSingle();

    if (slotRecord?.start_time) {
      const [year, month, day] = reservation_date.split("-").map(Number);
      const timeParts = slotRecord.start_time.split(":").map(Number);
      const slotDateTime = new Date(year, month - 1, day, timeParts[0] || 0, timeParts[1] || 0, 0);
      if (slotDateTime.getTime() <= Date.now()) {
        return NextResponse.json(
          { success: false, error: "This dining time slot has already passed." },
          { status: 400 }
        );
      }
    }

    // Insert reservation
    const insertPayload = {
      table_id,
      slot_id,
      reservation_date,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: cleanEmail,
      party_size,
      special_request: special_request?.trim() || null,
      user_id: user?.id || null,
      status: "PENDING" as const,
    };

    let reservationData: any;

    if (user) {
      // Authenticated user: insert + select in one call (RLS allows read-back)
      const { data, error } = await supabase
        .from("reservations")
        .insert(insertPayload)
        .select("*, restaurant_tables(*), reservation_slots(*)")
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      reservationData = data;
    } else {
      // Anonymous guest: insert without .select() to avoid RLS SELECT denial,
      // then build response from the known payload
      const { error: insertError } = await supabase
        .from("reservations")
        .insert(insertPayload);

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 400 });
      }

      // Build response from known data (we can't read back due to RLS)
      reservationData = {
        ...insertPayload,
        id: "guest-booking",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        restaurant_tables: null,
        reservation_slots: slotRecord ? { id: slot_id, start_time: slotRecord.start_time } : null,
      };
    }

    // Send confirmation email asynchronously
    try {
      const tableName = reservationData.restaurant_tables?.table_number
        ? `Table ${reservationData.restaurant_tables.table_number}`
        : "Reserved Table";
      const timeSlot = reservationData.reservation_slots?.start_time || "Scheduled Time";

      await sendEmail({
        to: cleanEmail,
        name: reservationData.customer_name,
        subject: `Reservation Request Received: Calvary Restaurant (${reservationData.reservation_date})`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0e14; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #272a38;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #ffbe33; font-size: 28px; margin: 0; font-family: Georgia, serif; letter-spacing: 2px;">CALVARY</h1>
              <p style="color: #a0a5b8; font-size: 13px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Artisanal Cuisine & Fine Dining</p>
            </div>
            <div style="background-color: #151824; padding: 24px; border-radius: 12px; border: 1px solid #232738; margin-bottom: 24px;">
              <h2 style="font-size: 18px; color: #ffffff; margin-top: 0;">Dear ${reservationData.customer_name},</h2>
              <p style="color: #d1d5db; font-size: 14px; line-height: 1.6;">
                Thank you for choosing Calvary. We have successfully received your table reservation request. Our dining host is reviewing your booking.
              </p>
              <div style="border-top: 1px dashed #34384d; margin: 20px 0; padding-top: 16px;">
                <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>📅 Date:</strong> ${reservationData.reservation_date}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>⏰ Time:</strong> ${timeSlot}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>🍽️ Table:</strong> ${tableName}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>👥 Guests:</strong> ${reservationData.party_size} People</p>
                <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>🔖 Booking ID:</strong> <span style="color: #ffbe33; font-family: monospace;">${reservationData.id}</span></p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn("[Reservation Email] Failed to send email:", emailErr);
    }

    return NextResponse.json({ success: true, reservation: reservationData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
