import { NextResponse, type NextRequest } from "next/server";
import { verifyCode } from "@/lib/invites";
import { signSession, SESSION_COOKIE } from "@/lib/session";

/*
  Access-gate endpoint.

    POST { code }            -> JSON { ok } (used by the lock-page form)
    GET  ?c=CODE&next=/path  -> redirect (used by one-click invite links)

  On success it sets a signed, HttpOnly session cookie so the visitor
  stays in (per device) until it expires. Rate-limited per IP.
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
  res.cookies.set(SESSION_COOKIE, signSession(sub, ttlSeconds), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ttlSeconds,
  });
}

export async function POST(request: NextRequest) {
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

  const result = await verifyCode(code, ip);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "That access code isn't valid." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  setSession(res, result.id, result.ttlSeconds);
  return res;
}

export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  const code = request.nextUrl.searchParams.get("c") || "";
  const nextParam = request.nextUrl.searchParams.get("next") || "/";
  // Only allow local redirects (no open-redirect via // or absolute URLs).
  const dest =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (isRateLimited(ip) || !code) {
    return NextResponse.redirect(new URL("/locked", request.url));
  }

  const result = await verifyCode(code, ip);
  if (!result.ok) {
    return NextResponse.redirect(new URL("/locked?e=1", request.url));
  }

  const res = NextResponse.redirect(new URL(dest, request.url));
  setSession(res, result.id, result.ttlSeconds);
  return res;
}
