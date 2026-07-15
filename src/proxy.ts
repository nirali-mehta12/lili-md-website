import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

/*
  ============================================================
  Access gate (Next.js 16 "proxy" — formerly middleware)
  ------------------------------------------------------------
  Gate enforcement is OFF unless ACCESS_GATE_ENABLED === "true".
  One-click invite links (?c=CODE) ALWAYS run — they mint a session
  cookie via /api/access. That matters because:
    - Landing "Be Considered" requires a session even when the site
      is otherwise public locally
    - Shared team links (PRD §10.5) must work the same in every env

  When the gate IS enabled:
    - valid session cookie       -> pass through to the real site
    - otherwise                  -> rewrite to /apply

  --- PASSWORD GATE PAUSED (2026-07-07) ---
  /locked UI is preserved but not wired. Restore by uncommenting
  LOCK_PAGE exemption + changing the rewrite target back to LOCK_PAGE.
  ============================================================
*/

// const LOCK_PAGE = "/locked";  // paused; see block comment above
const APPLY_PAGE = "/apply";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // One-click invite (?c=CODE) — always, even when the gate is off.
  // Without this, local `/?c=…` is a no-op (site is public) and
  // /api/consider stays 401 forever. Prod behavior unchanged: gate
  // still requires a session for everything else.
  const code = searchParams.get("c");
  if (code) {
    const url = new URL("/api/access", request.url);
    url.searchParams.set("c", code);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (process.env.ACCESS_GATE_ENABLED !== "true") {
    return NextResponse.next();
  }

  // Pages that handle their own auth get through the visitor gate:
  //   - /apply    : info-form entry (mints its own session on submit)
  //   - /admin    : password-protected internal tool
  if (
    // pathname === LOCK_PAGE ||  // paused
    pathname === APPLY_PAGE ||
    pathname.startsWith("/admin")
  ) {
    return NextResponse.next();
  }

  // Gated responses must never be shared-cached — otherwise the CDN would serve
  // one visitor's result (locked or unlocked) to everyone, bypassing this check.
  const noStore = (res: NextResponse) => {
    res.headers.set("Cache-Control", "private, no-store, must-revalidate");
    return res;
  };

  if (verifySession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return noStore(NextResponse.next());
  }

  // No session -> show the /apply info-form page (keep the URL they came to).
  return noStore(NextResponse.rewrite(new URL(APPLY_PAGE, request.url)));
}

export const config = {
  // Run on every page EXCEPT api routes, Next internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
  ],
};
