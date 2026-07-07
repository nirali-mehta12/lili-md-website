import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { log } from "@/lib/log";

/*
  ============================================================
  Health check endpoint — /api/health
  ------------------------------------------------------------
  Uptime probes (Cloud Monitoring / lili-cloud-ops) hit this to verify
  the app is up. Kept intentionally minimal so it stays cheap to run
  and doesn't itself become a failure mode.

  Depth: "shallow" (default) returns immediately with app status only.
         "deep" (?depth=deep) also checks Firestore reachability by
         calling getDb() — useful for outage debugging but not for
         high-frequency probes.
  ============================================================
*/

export const dynamic = "force-dynamic";

/**
 * GET /api/health[?depth=shallow|deep]
 *
 * @returns `{ ok: true, status: "healthy", uptimeSeconds, deps? }`
 *          Status 200 when healthy; 503 when a deep-check dependency is down.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const deep = url.searchParams.get("depth") === "deep";
  const uptimeSeconds = Math.floor(process.uptime());

  if (!deep) {
    return NextResponse.json(
      { ok: true, status: "healthy", uptimeSeconds },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  // Deep check: verify Firestore is reachable. Runs on every deep probe,
  // so keep the read cheap (a single doc from a tiny collection).
  const deps: Record<string, string> = {};
  let allOk = true;
  try {
    const db = getDb();
    if (!db) {
      deps.firestore = "unconfigured";
      allOk = false;
    } else {
      // A doc reference resolves instantly; the .get() is what round-trips.
      // Any doc in any collection works — we don't care about the payload.
      await db.collection("_health").doc("probe").get();
      deps.firestore = "ok";
    }
  } catch (err) {
    log.error("health.firestore_probe_failed", { err });
    deps.firestore = "down";
    allOk = false;
  }

  return NextResponse.json(
    { ok: allOk, status: allOk ? "healthy" : "degraded", uptimeSeconds, deps },
    { status: allOk ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
