import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/firebase";
import { createInvite } from "@/lib/invites";
import { signSession, SESSION_COOKIE, verifySession, sessionCookieOptions } from "@/lib/session";
import { sendDoctorApplicationNotification } from "@/lib/email";
import { log, correlationId } from "@/lib/log";
import { apply } from "@/lib/content";
import { isValidEmail, isValidPhoneUS } from "@/lib/format";

/*
  ============================================================
  Doctor-info access gate — /api/apply
  ------------------------------------------------------------
  Public POST endpoint. A doctor fills the /apply form; on success the
  server:
    1. Persists the application to Firestore `doctor-applications`
    2. Mints an invite record (label = "First Last · Practice")
    3. Emails admin@lilisolutions.ai (awaited — must land)
    4. Signs a session cookie so the gate lets them through
                                                       [INSTANT MODE]

  To switch to MANUAL review, replace step 4 with a `pending: true`
  response and skip setSession. The client already understands both.

  Rate-limited per IP (best-effort, per-instance).
  All handled errors emit structured logs via @/lib/log.
  ============================================================
*/

export const dynamic = "force-dynamic";

// --- Constants -----------------------------------------------------------
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;
// Match /api/access session lifetime rather than diverging silently.
// createInvite is minted with 30-day expiry; the SESSION cookie uses 7d.
const SESSION_TTL_SECONDS = 7 * 86_400;
const INVITE_TTL_DAYS = 30;
// Server-side max lengths. Slightly generous so real inputs never bounce.
const MAX_FIELD = 200;
const MAX_URL = 500;
const EHR_WHITELIST = new Set<string>(apply.ehrOptions);

// Per-IP rate limit state (module-scope). Note: in-memory per instance —
// under multi-instance scale-out an attacker can effectively multiply the
// budget by the instance count. Adequate for a marketing site's soft limit.
const hits = new Map<string, number[]>();

// --- Helpers -------------------------------------------------------------

/**
 * Slide the per-IP request window and check whether this IP has exceeded
 * MAX_ATTEMPTS within WINDOW_MS.
 *
 * @param ip  Client identifier (see clientIp).
 * @returns   `true` when the caller should be refused (429).
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}

/**
 * Derive the client IP from Google's HTTPS Load Balancer forwarding chain.
 * GCP sets `X-Forwarded-For: <client-supplied>,<real-client>,<gclb-proxy>`
 * — the SECOND-TO-LAST value is the trusted client. Using the leftmost
 * would let an attacker set their own IP via a request header.
 *
 * @param req  The incoming request.
 * @returns    Best-effort client IP, or "unknown".
 */
function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  const parts = xff
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return "unknown";
  // On GCP LB: [supplied?, ..., real-client, gclb-proxy]. Pick second-to-last
  // when the chain has >= 2 hops, otherwise the only value.
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
}

/**
 * @returns `true` iff the value is a plain object we can safely index into.
 *          Rejects arrays, null, primitives (which throw on property access).
 */
function isObjectPayload(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Trim + coerce an unknown value to a bounded string. Values longer than
 * `max` return null (caller should surface a friendly error).
 *
 * @param v    Untrusted input from the request body.
 * @param max  Maximum length in characters.
 * @returns    The trimmed string, or `null` if the input exceeds `max`.
 */
function boundedString(v: unknown, max: number): string | null {
  const s = String(v ?? "").trim();
  if (s.length > max) return null;
  return s;
}

/**
 * Attach the signed session cookie to a response.
 *
 * @param res         Response to mutate.
 * @param sub         Cookie subject — typically the invite doc ID.
 * @param ttlSeconds  Cookie lifetime.
 */
function setSession(
  res: NextResponse,
  sub: string,
  ttlSeconds: number,
): void {
  res.cookies.set(
    SESSION_COOKIE,
    signSession(sub, ttlSeconds),
    sessionCookieOptions(ttlSeconds),
  );
}

// --- Route ---------------------------------------------------------------

/**
 * POST /api/apply
 *
 * @param request  JSON body with the doctor's info + consent flag.
 * @returns
 *   - 200 `{ ok: true }` on success (cookie set in INSTANT mode)
 *   - 400 `{ ok: false, error }` for validation failures
 *   - 429 `{ ok: false, error }` when rate-limited
 *   - 503 `{ ok: false, error }` when a hard dependency is down
 */
export async function POST(request: NextRequest) {
  const cid = correlationId();
  const ip = clientIp(request);

  // 0. Rate limit ---------------------------------------------------------
  if (isRateLimited(ip)) {
    log.warn("apply.rate_limited", { cid, ip });
    return NextResponse.json(
      { ok: false, error: apply.errors.rateLimited },
      { status: 429 },
    );
  }

  // 1. Parse + type-guard the body ---------------------------------------
  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    log.warn("apply.body_parse_failed", { cid, ip, err });
    return NextResponse.json(
      { ok: false, error: apply.errors.generic },
      { status: 400 },
    );
  }
  if (!isObjectPayload(body)) {
    log.warn("apply.body_shape_invalid", { cid, ip, type: typeof body });
    return NextResponse.json(
      { ok: false, error: apply.errors.generic },
      { status: 400 },
    );
  }

  // 2. Coerce + bound each field. Any oversize field short-circuits. -----
  const raw = {
    firstName: boundedString(body.firstName, MAX_FIELD),
    lastName: boundedString(body.lastName, MAX_FIELD),
    practiceName: boundedString(body.practiceName, MAX_FIELD),
    website: boundedString(body.website, MAX_URL),
    phone: boundedString(body.phone, MAX_FIELD),
    email: boundedString(body.email, MAX_FIELD),
    licenseNo: boundedString(body.licenseNo, MAX_FIELD),
    ehr: boundedString(body.ehr, MAX_FIELD),
    referredBy: boundedString(body.referredBy, MAX_FIELD),
  };
  if (Object.values(raw).some((v) => v === null)) {
    log.warn("apply.field_too_large", { cid, ip });
    return NextResponse.json(
      { ok: false, error: apply.errors.tooLarge },
      { status: 400 },
    );
  }
  // After the null-check, TS still sees `string | null` — narrow with `!`.
  const application = raw as { [K in keyof typeof raw]: string };
  const consent = body.consent === true;

  // 3. Required-field validation -----------------------------------------
  // Required: first name, last name, phone, email (+ TCPA consent below).
  // Optional: practice, website, license, EHR, referred-by.
  if (
    !application.firstName ||
    !application.lastName ||
    !application.phone ||
    !application.email
  ) {
    return NextResponse.json(
      { ok: false, error: apply.errors.missingFields },
      { status: 400 },
    );
  }
  if (!isValidEmail(application.email)) {
    return NextResponse.json(
      { ok: false, error: apply.errors.invalidEmail },
      { status: 400 },
    );
  }
  if (!isValidPhoneUS(application.phone)) {
    return NextResponse.json(
      { ok: false, error: apply.errors.invalidPhone },
      { status: 400 },
    );
  }
  // EHR is optional; when provided it must be on Mel's whitelist.
  if (application.ehr && !EHR_WHITELIST.has(application.ehr)) {
    log.warn("apply.ehr_not_whitelisted", { cid, ip, ehr: application.ehr });
    return NextResponse.json(
      { ok: false, error: apply.errors.invalidEhr },
      { status: 400 },
    );
  }
  if (!consent) {
    log.warn("apply.consent_missing", { cid, ip });
    return NextResponse.json(
      { ok: false, error: apply.errors.missingConsent },
      { status: 400 },
    );
  }

  // 4. Dedup: an already-authenticated visitor doesn't need a fresh invite.
  //    Returning ok:true lets the client redirect them straight to /.
  if (verifySession(request.cookies.get(SESSION_COOKIE)?.value)) {
    log.info("apply.already_authenticated", { cid, ip });
    return NextResponse.json({ ok: true, alreadyAuthenticated: true });
  }

  const fullName = `${application.firstName} ${application.lastName}`.trim();
  const label = application.practiceName
    ? `${fullName} · ${application.practiceName}`
    : fullName;
  log.info("apply.request_received", {
    cid,
    ip,
    email: application.email,
    practice: application.practiceName,
  });

  // 5. Mint the invite FIRST so we can link the application record to it.
  //    Ordering matters: /api/consider later looks up the application by
  //    inviteId (single-field query, no composite index needed) — writing
  //    the invite ID onto the application makes that lookup trivial.
  //    createInvite can return null (getDb null) or throw (Firestore
  //    reachable but the write failed) — both mean 503 to the user.
  const db = getDb();
  let invite: Awaited<ReturnType<typeof createInvite>> = null;
  try {
    invite = await createInvite({ label, ttlDays: INVITE_TTL_DAYS });
  } catch (err) {
    log.error("apply.invite_creation_threw", { cid, err });
  }
  if (!invite) {
    log.error("apply.invite_creation_failed", { cid });
    return NextResponse.json(
      { ok: false, error: apply.errors.unavailable },
      { status: 503 },
    );
  }
  log.info("apply.invite_minted", { cid, inviteId: invite.id });

  // 6. Persist the application record, linked to the invite ID above.
  const now = new Date().toISOString();
  let applicationDocId: string | null = null;
  if (db) {
    try {
      const docRef = await db.collection("doctor-applications").add({
        ...application,
        fullName,
        inviteId: invite.id, // link back to invites/{id} for later lookup.
        consent, // audit trail: proves the doctor ticked the box.
        consentAt: now,
        createdAt: now,
        ip,
        cid,
      });
      applicationDocId = docRef.id;
      log.info("apply.application_stored", { cid, docId: applicationDocId });
    } catch (err) {
      log.error("apply.firestore_write_failed", { cid, err });
      // Continue: without the record we still want to email admin + gate the
      // user through — the review-side impact is losing the audit row, not
      // blocking access.
    }
  } else {
    log.warn("apply.placeholder_mode_no_db", { cid, ip });
  }

  // 7. Notify admin — AWAITED so serverless can't freeze the container
  //    before nodemailer's TLS handshake completes.
  try {
    await sendDoctorApplicationNotification({
      ...application,
      fullName,
      inviteCode: invite.code,
    });
    log.info("apply.email_sent", { cid });
  } catch (err) {
    log.error("apply.email_send_failed", { cid, err });
    // Best-effort: the visitor still gets through; Mel loses one notification
    // but the Firestore record above lets them recover from the dashboard.
  }

  // 8. Instant access — sign the session cookie ---------------------------
  const res = NextResponse.json({ ok: true });
  try {
    setSession(res, invite.id, SESSION_TTL_SECONDS);
    log.info("apply.session_issued", {
      cid,
      inviteId: invite.id,
      ttlSeconds: SESSION_TTL_SECONDS,
    });
  } catch (err) {
    log.critical("apply.session_sign_failed", { cid, err });
    return NextResponse.json(
      { ok: false, error: apply.errors.unavailable },
      { status: 503 },
    );
  }
  return res;
}
