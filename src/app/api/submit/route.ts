import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/firebase";

/*
  POST /api/submit  — handles the "Submit Your Practice" form.

  Flow:
    1. Honeypot check (invisible "company" field) — reject bots silently.
    2. Lightweight per-IP rate limit.
    3. Validate name + email.
    4. Store the lead in Firestore `leads`.
    5. Queue an email to admin@lilisolutions.ai via the Firestore
       "Trigger Email" extension (writes a doc to the `mail` collection).

  Until Firebase env vars are set, this runs in "placeholder mode":
  it logs the lead and returns success so the form is testable locally.
*/

// This handler must run per-request (never statically cached).
export const dynamic = "force-dynamic";

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "admin@lilisolutions.ai";
const MAIL_COLLECTION = process.env.MAIL_COLLECTION || "mail";

// --- Simple in-memory rate limit (per server instance) ---
// Good enough for a low-volume, semi-private form. For multi-instance
// hosting at scale, swap for a Firestore/Redis-backed limiter.
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // 1. Honeypot — bots fill the hidden "company" field. Pretend success.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // 2. Rate limit by IP.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  // 3. Validate.
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const socials = String(body.socials || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const lead = {
    name,
    email,
    socials,
    message,
    createdAt: new Date().toISOString(),
    ip,
  };

  const db = getDb();

  // Placeholder mode — Firebase not configured yet.
  if (!db) {
    console.log("[submit] (placeholder mode) new lead:", lead);
    return NextResponse.json({ ok: true });
  }

  try {
    // 4. Store the lead.
    await db.collection("leads").add(lead);

    // 5. Queue the notification email (Trigger Email extension format).
    const html = `
      <h2>New practice submission — LiLi M.D.</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Socials:</strong> ${escapeHtml(socials) || "—"}</p>
      <p><strong>Message:</strong><br/>${escapeHtml(message) || "—"}</p>
    `;
    await db.collection(MAIL_COLLECTION).add({
      to: NOTIFY_EMAIL,
      replyTo: email,
      message: {
        subject: `New practice submission — ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nSocials: ${socials}\nMessage: ${message}`,
        html,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[submit] failed to store lead:", err);
    return NextResponse.json(
      { error: "Could not submit right now. Please try again." },
      { status: 500 },
    );
  }
}
