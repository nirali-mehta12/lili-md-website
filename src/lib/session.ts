import crypto from "node:crypto";

/*
  ============================================================
  Access-gate session (stateless, signed cookie)
  ------------------------------------------------------------
  A valid session cookie looks like:  <payload>.<signature>
    payload   = base64url(JSON{ sub: <inviteId>, exp: <unix-seconds> })
    signature = base64url( HMAC-SHA256(ACCESS_SESSION_SECRET, payload) )

  It's verified locally (no DB hit) so proxy.ts can check it cheaply on
  every request. Set ACCESS_SESSION_SECRET (32+ random bytes) in the
  environment before enabling the gate.
  ============================================================
*/

export const SESSION_COOKIE = "lili_access";

function getSecret(): string {
  const s = process.env.ACCESS_SESSION_SECRET;
  if (!s) throw new Error("ACCESS_SESSION_SECRET is not set");
  return s;
}

export type SessionPayload = { sub: string; exp: number };

export function signSession(sub: string, ttlSeconds: number): string {
  const payload: SessionPayload = {
    sub,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

/** Returns the payload if the token is valid and unexpired, else null. Never throws. */
export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(body)
      .digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString(),
    ) as SessionPayload;
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
