import { NextResponse, type NextRequest } from "next/server";
import { verifyCode } from "@/lib/invites";
import {
  signSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session";
import { publicOrigin } from "@/lib/request";
import { log, correlationId } from "@/lib/log";

/*
  Access-gate endpoint.

    POST { code }            -> JSON { ok } (used by the lock-page form)
    GET  ?c=CODE&next=/path  -> redirect (used by one-click invite links)

  On success it sets a signed, HttpOnly session cookie so the visitor
  stays in (per device) until it expires. Rate-limited per IP.

  Team one-click links (shared invite codes) use GET. Doctors still enter
  via /apply — this endpoint does not remove or bypass that form for the
  general audience; only a valid invite code sets a session.
*/

export const dynamic = "force-dynamic";

// --- Per-IP rate limit (per server instance) ---
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

function setSession(res: NextResponse, sub: string, ttlSeconds: number): void {
  res.cookies.set(
    SESSION_COOKIE,
    signSession(sub, ttlSeconds),
    sessionCookieOptions(ttlSeconds),
  );
}

function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, publicOrigin(request)));
}

/**
 * POST /api/access — typed unlock (lock-page form).
 */
export async function POST(request: NextRequest) {
  const cid = correlationId();
  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const code = String(body.code || "").trim();
  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Please enter your access code." },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await verifyCode(code, ip);
  } catch (err) {
    log.error("access.verify_uncaught", { cid, err });
    return NextResponse.json(
      { ok: false, error: "Temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }

  if (!result.ok) {
    if (result.reason === "unavailable") {
      return NextResponse.json(
        { ok: false, error: "Temporarily unavailable. Please try again." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "That access code isn't valid." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  setSession(res, result.id, result.ttlSeconds);
  return res;
}

/**
 * GET /api/access — one-click invite (?c=CODE), used by the shared team link.
 */
export async function GET(request: NextRequest) {
  const cid = correlationId();
  const ip = clientIp(request);
  const code = request.nextUrl.searchParams.get("c") || "";
  const nextParam = request.nextUrl.searchParams.get("next") || "/";
  // Only allow local redirects (no open-redirect via // or absolute URLs).
  const dest =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (isRateLimited(ip) || !code) {
    return redirectTo(request, "/locked");
  }

  let result;
  try {
    result = await verifyCode(code, ip);
  } catch (err) {
    log.error("access.verify_uncaught", { cid, err });
    return new NextResponse("Temporarily unavailable. Please try again.", {
      status: 503,
    });
  }

  if (!result.ok) {
    if (result.reason === "unavailable") {
      return new NextResponse("Temporarily unavailable. Please try again.", {
        status: 503,
      });
    }
    return redirectTo(request, "/locked?e=1");
  }

  const res = redirectTo(request, dest);
  setSession(res, result.id, result.ttlSeconds);
  return res;
}
