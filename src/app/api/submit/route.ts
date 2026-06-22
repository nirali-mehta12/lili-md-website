import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/firebase";
import { sendLeadNotification } from "@/lib/email";

/*
  POST /api/submit  — handles the "Submit Your Practice" form.

  Flow:
    1. Honeypot check (invisible "company" field) — reject bots silently.
    2. Lightweight per-IP rate limit.
    3. Validate name + email.
    4. Store the lead in Firestore `leads` (durable record).
    5. Email the notification directly via SMTP (best-effort).

  Lead storage and email are independent: a lead is never lost because
  email failed. With neither Firestore nor SMTP configured, the route
  runs in "placeholder mode" (logs the lead, returns success) so the
  form is testable locally.
*/

// This handler must run per-request (never statically cached).
export const dynamic = "force-dynamic";

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
  const practiceName = String(body.practiceName || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const website = String(body.website || "").trim();
  const socials = String(body.socials || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Name, email, and contact number are required." },
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
    practiceName,
    email,
    phone,
    website,
    socials,
    message,
    createdAt: new Date().toISOString(),
    ip,
  };

  const db = getDb();
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );

  // Placeholder mode — nothing configured yet.
  if (!db && !smtpConfigured) {
    console.log("[submit] (placeholder mode) new lead:", lead);
    return NextResponse.json({ ok: true });
  }

  // 4. Store the lead (durable record). A storage failure is a real error.
  if (db) {
    try {
      await db.collection("leads").add(lead);
    } catch (err) {
      console.error("[submit] failed to store lead:", err);
      return NextResponse.json(
        { error: "Could not submit right now. Please try again." },
        { status: 500 },
      );
    }
  }

  // 5. Send the notification email (best-effort — never lose a stored lead).
  try {
    const sent = await sendLeadNotification(lead);
    if (!sent && !db) {
      console.log("[submit] (placeholder mode) new lead:", lead);
    }
  } catch (err) {
    console.error("[submit] failed to send notification email:", err);
  }

  return NextResponse.json({ ok: true });
}
