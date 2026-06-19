import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

/*
  ============================================================
  Access gate (Next.js 16 "proxy" — formerly middleware)
  ------------------------------------------------------------
  DISABLED by default. The site is fully PUBLIC unless
  ACCESS_GATE_ENABLED === "true". To turn the gate on:
    1. Build the lock page at src/app/locked/page.tsx (UI).
    2. Set ACCESS_SESSION_SECRET (32+ random bytes) in the env.
    3. Set ACCESS_GATE_ENABLED="true" and redeploy.

  When enabled:
    - valid session cookie       -> pass through to the real site
    - ?c=CODE on any URL         -> hand off to /api/access to validate
                                    (one-click invite links)
    - otherwise                  -> show the lock page (URL unchanged)
  ============================================================
*/

const LOCK_PAGE = "/locked";

export function proxy(request: NextRequest) {
  if (process.env.ACCESS_GATE_ENABLED !== "true") {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;

  // Let the lock page itself render.
  if (pathname === LOCK_PAGE) return NextResponse.next();

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

  // One-click invite link (?c=CODE) -> validate via the access route, which
  // sets the session cookie and redirects back to the page they wanted.
  const code = searchParams.get("c");
  if (code) {
    const url = new URL("/api/access", request.url);
    url.searchParams.set("c", code);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // No session, no code -> show the lock page (keep the URL they came to).
  return noStore(NextResponse.rewrite(new URL(LOCK_PAGE, request.url)));
}

export const config = {
  // Run on every page EXCEPT api routes, Next internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
  ],
};
