import { BrevoClient } from "@getbrevo/brevo";

interface SendEmailParams {
  to: string;
  name?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail({
  to,
  name,
  subject,
  htmlContent,
  textContent,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Calvary Restaurant";

  if (!apiKey || !senderEmail) {
    console.warn("[Brevo Email] BREVO_API_KEY or BREVO_SENDER_EMAIL not configured in environment variables.");
    return {
      success: false,
      error: "Email service not configured. Please add BREVO_API_KEY and BREVO_SENDER_EMAIL to your environment variables.",
    };
  }

  try {
    const client = new BrevoClient({ apiKey });

    const response = await client.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      textContent,
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: to,
          name: name || to,
        },
      ],
    });

    console.log("[Brevo Email] Successfully sent email to:", to, "messageId:", response.messageId);
    return { success: true, messageId: response.messageId };
  } catch (err: any) {
    console.error("[Brevo Email] Error sending email:", err?.response?.body || err?.message || err);
    return {
      success: false,
      error: err?.response?.body?.message || err?.message || "Failed to send email.",
    };
  }
}
