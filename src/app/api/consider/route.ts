import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/firebase";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { sendBeConsideredNotification } from "@/lib/email";
import { log, correlationId } from "@/lib/log";
import { submit } from "@/lib/content";

/*
  ============================================================
  "Be Considered" click endpoint — /api/consider
  ------------------------------------------------------------
  Fires when a doctor (who has already passed the /apply gate) clicks
  the "Be Considered" button on the landing page. Per Mel's decision
  (2026-07-06 Option C): a full notification email lands in admin@
  with the doctor's details pulled from their invite record.

  Rate-limited per IP to avoid a curious visitor firing the button
  repeatedly.
  ============================================================
*/

export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 4; // Deliberate: this button is a one-shot for real doctors.
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  const parts = xff
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || "unknown";
}

/**
 * POST /api/consider
 *
 * Uses the caller's session cookie to identify which doctor clicked the
 * button. Looks up the invite → looks up the matching doctor-applications
 * record → sends a notification email with the full details.
 *
 * @returns
 *   - 200 `{ ok: true }` on success (email fired)
 *   - 401 `{ ok: false }` if the caller has no valid session
 *   - 429 `{ ok: false }` if rate-limited
 *   - 503 `{ ok: false }` on infrastructure failure (Firestore/SMTP)
 */
export async function POST(request: NextRequest) {
  const cid = correlationId();
  const ip = clientIp(request);

  if (isRateLimited(ip)) {
    log.warn("consider.rate_limited", { cid, ip });
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again shortly." },
      { status: 429 },
    );
  }

  // Session cookie identifies which doctor is clicking. We need this both
  // for auditing (who clicked) and to fetch their info for the email.
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(cookieValue);
  if (!session) {
    log.warn("consider.unauthenticated", { cid, ip });
    return NextResponse.json(
      { ok: false, error: submit.errorGeneric },
      { status: 401 },
    );
  }

  const inviteId = session.sub;
  log.info("consider.clicked", { cid, ip, inviteId });

  // Look up the doctor's application by inviteId — this is the linkage
  // we established in /api/apply. Single-field WHERE query, so Firestore
  // does NOT require a composite index (unlike the older name-based
  // lookup which needed .where("fullName", "==", …).orderBy("createdAt")).
  type ApplicationRecord = {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    practiceName?: string;
    website?: string;
    phone?: string;
    email?: string;
    licenseNo?: string;
    ehr?: string;
    referredBy?: string;
    createdAt?: string;
  };
  const db = getDb();
  let doctorApp: ApplicationRecord | null = null;
  if (db) {
    try {
      const apps = await db
        .collection("doctor-applications")
        .where("inviteId", "==", inviteId)
        .limit(1)
        .get();
      if (!apps.empty) {
        doctorApp = apps.docs[0].data() as ApplicationRecord;
      } else {
        // Older applications (pre-inviteId-link) — fall back to the invite
        // label so at least the doctor's name reaches Mel's inbox.
        const inviteDoc = await db.collection("invites").doc(inviteId).get();
        if (inviteDoc.exists) {
          const label = (inviteDoc.data() as { label?: string }).label ?? "";
          const parts = label.split(" · ");
          doctorApp = {
            fullName: parts[0]?.trim() || "",
            practiceName: parts[1]?.trim() || "",
          };
        }
      }
    } catch (err) {
      log.error("consider.firestore_lookup_failed", { cid, err });
    }
  }

  // Fire the notification email — awaited so serverless doesn't freeze
  // the container before SMTP resolves.
  try {
    await sendBeConsideredNotification({
      cid,
      application: doctorApp,
    });
    log.info("consider.email_sent", { cid, inviteId });
  } catch (err) {
    log.error("consider.email_send_failed", { cid, err });
    return NextResponse.json(
      { ok: false, error: submit.errorGeneric },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
