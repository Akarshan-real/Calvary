import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5 stars" },
        { status: 400 }
      );
    }

    const { data: res, error: fetchErr } = await supabase
      .from("reservations")
      .select("id, user_id, customer_phone, customer_email, special_request")
      .eq("id", reservationId)
      .maybeSingle();

    if (fetchErr || !res) {
      return NextResponse.json({ success: false, error: "Reservation not found" }, { status: 404 });
    }

    const isOwner =
      res.user_id === user.id ||
      (user.phone && res.customer_phone === user.phone) ||
      (user.email && res.customer_email === user.email);

    if (!isOwner) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    let { error: updateErr } = await supabase
      .from("reservations")
      .update({
        feedback_rating: rating,
        feedback_comment: comment?.trim() || null,
        status: "COMPLETED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservationId);

    // Fallback if feedback columns are absent
    if (updateErr && updateErr.message?.toLowerCase().includes("feedback_rating")) {
      const existingReq = res.special_request || "";
      const feedbackTag = `[Guest Review ${rating}★]: ${comment?.trim() || "No comment"}`;
      const combined = existingReq ? `${existingReq} | ${feedbackTag}` : feedbackTag;

      const fallback = await supabase
        .from("reservations")
        .update({
          special_request: combined,
          status: "COMPLETED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reservationId);
      updateErr = fallback.error;
    }

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
