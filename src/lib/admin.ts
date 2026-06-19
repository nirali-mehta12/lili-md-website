import crypto from "node:crypto";
import { signSession, verifySession } from "@/lib/session";

/*
  ============================================================
  Admin auth for the invite-creation tool (/admin)
  ------------------------------------------------------------
  Separate from the visitor gate. Protected by a single password
  (ADMIN_SECRET) known only to the admin. On login we issue a signed
  `lili_admin` session cookie with sub="admin" — reusing the same HMAC
  signer as the visitor session, so a regular invite cookie (sub=inviteId)
  can never pass the admin check.

  Set ADMIN_SECRET in the environment before using the admin tool.
  ============================================================
*/

export const ADMIN_COOKIE = "lili_admin";
const ADMIN_SUB = "admin";

/** Timing-safe compare of the submitted password to ADMIN_SECRET. */
export function checkAdminPassword(password: string): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function signAdmin(ttlSeconds: number): string {
  return signSession(ADMIN_SUB, ttlSeconds);
}

export function isAdmin(token: string | undefined | null): boolean {
  return verifySession(token)?.sub === ADMIN_SUB;
}
