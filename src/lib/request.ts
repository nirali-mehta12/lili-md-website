import type { NextRequest } from "next/server";

/**
 * Public site origin for absolute redirects.
 *
 * On Firebase App Hosting / Cloud Run, `request.url` and `nextUrl.origin`
 * are the container listen address (`https://0.0.0.0:8080`). Building
 * `Location` from that sends the browser to an unreachable host — which
 * broke team one-click links (`/?c=CODE`) even when the invite was valid.
 *
 * Prefer proxy headers; fall back to SITE_ORIGIN / lilimd.ai when the
 * derived host is an internal listen address.
 */
export function publicOrigin(req: NextRequest): string {
  const forwardedHost = req.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const forwardedProto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";

  if (forwardedHost && !isInternalListenHost(forwardedHost)) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const hostHeader = req.headers.get("host")?.split(",")[0]?.trim();
  if (hostHeader && !isInternalListenHost(hostHeader)) {
    // Local `next dev` has no x-forwarded-*; Host is localhost:3000.
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      req.nextUrl.protocol.replace(":", "") ||
      "http";
    return `${proto}://${hostHeader}`;
  }

  if (!isInternalListenHost(req.nextUrl.host)) {
    return req.nextUrl.origin;
  }

  return process.env.SITE_ORIGIN || "https://lilimd.ai";
}

function isInternalListenHost(host: string): boolean {
  const name = host.toLowerCase().split(":")[0];
  return name === "0.0.0.0" || name === "::" || name === "[::]";
}
