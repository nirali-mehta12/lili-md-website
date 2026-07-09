import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

/*
  ============================================================
  Access gate (Next.js 16 "proxy" — formerly middleware)
  ------------------------------------------------------------
  DISABLED by default. The site is fully PUBLIC unless
  ACCESS_GATE_ENABLED === "true". To turn the gate on:
    1. Set ACCESS_SESSION_SECRET (32+ random bytes) in the env.
    2. Set ACCESS_GATE_ENABLED="true" and redeploy.

  When enabled:
    - valid session cookie       -> pass through to the real site
    - otherwise                  -> show the /apply info-form page
                                    (URL unchanged; visitor fills form
                                    and is granted access on submit)

  --- PASSWORD GATE PAUSED (2026-07-07) ---
  Per Ronnie/Mel: /apply is now the SOLE gateway. The old /locked
  password page + one-click invite (?c=CODE) flow are commented out
  below but preserved so we can restore if needed. Files kept in
  place: src/app/locked/*, src/app/api/access/*, src/lib/invites.ts,
  scripts/invite.mjs — none of these are wired into the visitor flow
  anymore, but they still work if called directly (e.g. /admin).
  To restore: uncomment the LOCK_PAGE exemption + ?c= handling +
  change the rewrite target back to LOCK_PAGE.
  ============================================================
*/

// const LOCK_PAGE = "/locked";  // paused; see block comment above
const APPLY_PAGE = "/apply";

export function proxy(request: NextRequest) {
  if (process.env.ACCESS_GATE_ENABLED !== "true") {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;

  // Pages that handle their own auth get through the visitor gate:
  //   - /apply    : info-form entry (mints its own session on submit)
  //   - /admin    : password-protected internal tool
  // (`/locked` was exempted here before the password gate was paused.)
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

  // Already authenticated for this device?
  if (verifySession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return noStore(NextResponse.next());
  }

  // One-click invite link (?c=CODE) -> validate via /api/access, which sets
  // the session cookie and redirects to the requested page.
  //
  // Used for the SHARED TEAM LINK (2026-07-09): rather than restore the full
  // password-page UI (still paused per Ronnie/Mel), we keep just this
  // one-click handler. Mint a code labeled "Team" once via
  //     node scripts/invite.mjs create "Team" 365
  // and share the resulting `?c=CODE` link with the org — no form to fill,
  // no password to remember. See PRD §10.5 for the design decision.
  const code = searchParams.get("c");
  if (code) {
    const url = new URL("/api/access", request.url);
    url.searchParams.set("c", code);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
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
