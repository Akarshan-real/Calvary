import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, messages: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        message: message.trim(),
        status: "UNREAD",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Auto-acknowledgement email
    try {
      await sendEmail({
        to: email.trim(),
        name: name.trim(),
        subject: "We have received your message - Calvary Restaurant",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0e14; color: #ffffff; padding: 32px; border-radius: 16px;">
            <h1 style="color: #ffbe33;">CALVARY</h1>
            <p>Hello ${name.trim()},</p>
            <p>Thank you for getting in touch with us at Calvary. We have safely received your inquiry:</p>
            <div style="background-color: #151824; padding: 16px; border-radius: 8px; margin: 16px 0; font-style: italic;">
              "${message.trim()}"
            </div>
            <p>Our hospitality team will review your message and get back to you shortly!</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn("[Contact Email Warning]", emailErr);
    }

    return NextResponse.json({ success: true, message: data });
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
    const { id, status } = body;

    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
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

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", Number(id));

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
