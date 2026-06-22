import nodemailer, { type Transporter } from "nodemailer";

/*
  ============================================================
  Lead-notification email (server-only)
  ------------------------------------------------------------
  Sends the "new submission" email directly over SMTP — works with
  any provider (Google Workspace / Gmail, Resend, SendGrid SMTP…).
  No Firebase "Trigger Email" extension needed.

  Env vars (set in .env.local locally, and as backend secrets in prod):
    SMTP_HOST     e.g. smtp.gmail.com   (Workspace) | smtp.resend.com (Resend)
    SMTP_PORT     465 (SSL) or 587 (STARTTLS)        default 465
    SMTP_USER     sending mailbox        e.g. noreply@lilisolutions.ai | "resend"
    SMTP_PASS     app password / API key
    NOTIFY_EMAIL  where to send          default admin@lilisolutions.ai

  If SMTP isn't configured, sendLeadNotification() is a no-op and
  returns false, so the form still works (lead is stored either way).
  ============================================================
*/

export type Lead = {
  name: string;
  practiceName: string;
  email: string;
  phone: string;
  website: string;
  socials: string;
  message: string;
};

let cached: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (cached !== undefined) return cached;
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    cached = null;
    return null;
  }
  const port = Number(SMTP_PORT) || 465;
  cached = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // SSL on 465, STARTTLS on 587
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return cached;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Sends the notification. Returns true if sent, false if SMTP unconfigured. */
export async function sendLeadNotification(lead: Lead): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("[email] SMTP not configured — skipping notification");
    return false;
  }

  const to = process.env.NOTIFY_EMAIL || "admin@lilisolutions.ai";
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;

  // Prefer practice name in the subject when present — easier to triage in
  // an inbox — fall back to the person's name otherwise.
  const subjectLabel = lead.practiceName || lead.name;

  await transporter.sendMail({
    from: `"LiLi M.D. — New Submission" <${from}>`,
    to,
    replyTo: lead.email,
    subject: `New practice submission — ${subjectLabel}`,
    text:
      `Name: ${lead.name}\n` +
      `Practice Name: ${lead.practiceName || "—"}\n` +
      `Email: ${lead.email}\n` +
      `Phone: ${lead.phone || "—"}\n` +
      `Website: ${lead.website || "—"}\n` +
      `Socials: ${lead.socials || "—"}\n\n` +
      `${lead.message || "—"}`,
    html: `
      <h2 style="font-family:Georgia,serif">New practice submission — LiLi M.D.</h2>
      <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
      <p><strong>Practice Name:</strong> ${escapeHtml(lead.practiceName) || "—"}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(lead.phone) || "—"}</p>
      <p><strong>Website:</strong> ${escapeHtml(lead.website) || "—"}</p>
      <p><strong>Socials:</strong> ${escapeHtml(lead.socials) || "—"}</p>
      <p><strong>Message:</strong><br/>${escapeHtml(lead.message) || "—"}</p>
    `,
  });
  console.log("[email] notification sent ->", to);
  return true;
}
