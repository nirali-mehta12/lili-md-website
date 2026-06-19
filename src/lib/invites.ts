import crypto from "node:crypto";
import { getDb } from "@/lib/firebase";

/*
  ============================================================
  Per-person access codes for the invitation gate
  ------------------------------------------------------------
  - Codes are random, high-entropy, and stored ONLY as a SHA-256 hash
    (never plaintext) in the Firestore `invites` collection.
  - Each invite belongs to one person (`label`), can expire, and can
    be revoked — so a leaked code is attributable and killable on its own.
  - Every successful access is counted + timestamped for tracking.

  Mint codes with: `node scripts/invite.mjs create "Dr. Name" [ttlDays]`
  ============================================================
*/

const COLLECTION = "invites";
// Unambiguous alphabet — no 0/O, 1/I/L.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateCode(len = 8): string {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out.replace(/(.{4})(.{4})/, "$1-$2"); // e.g. ABCD-EFGH
}

export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(normalizeCode(code)).digest("hex");
}

type InviteDoc = {
  label: string;
  codeHash: string;
  createdAt: string;
  expiresAt: string | null;
  revoked: boolean;
  accessCount?: number;
  lastAccessAt?: string | null;
};

/** Create an invite. Returns the plaintext code ONCE — store/send it now (not recoverable). */
export async function createInvite(opts: {
  label: string;
  ttlDays?: number | null;
}): Promise<{ id: string; code: string } | null> {
  const db = getDb();
  if (!db) return null;
  const code = generateCode();
  const id = crypto.randomUUID();
  const expiresAt =
    opts.ttlDays && opts.ttlDays > 0
      ? new Date(Date.now() + opts.ttlDays * 86_400_000).toISOString()
      : null;
  await db
    .collection(COLLECTION)
    .doc(id)
    .set({
      label: opts.label,
      codeHash: hashCode(code),
      createdAt: new Date().toISOString(),
      expiresAt,
      revoked: false,
      accessCount: 0,
      lastAccessAt: null,
    } satisfies InviteDoc);
  return { id, code };
}

export type VerifyResult =
  | { ok: true; id: string; label: string; ttlSeconds: number }
  | { ok: false; reason: "invalid" | "expired" | "revoked" };

const DEFAULT_SESSION_DAYS = 7;

/** Validate a code and, if valid, record the access (count + timestamp). */
export async function verifyCode(code: string, ip: string): Promise<VerifyResult> {
  const db = getDb();
  if (!db) return { ok: false, reason: "invalid" };

  const snap = await db
    .collection(COLLECTION)
    .where("codeHash", "==", hashCode(code))
    .limit(1)
    .get();
  if (snap.empty) return { ok: false, reason: "invalid" };

  const doc = snap.docs[0];
  const data = doc.data() as InviteDoc;
  if (data.revoked) return { ok: false, reason: "revoked" };

  let ttlSeconds = DEFAULT_SESSION_DAYS * 86_400;
  if (data.expiresAt) {
    const remaining = Math.floor(
      (new Date(data.expiresAt).getTime() - Date.now()) / 1000,
    );
    if (remaining <= 0) return { ok: false, reason: "expired" };
    ttlSeconds = Math.min(ttlSeconds, remaining);
  }

  // Record the access — best-effort, never block entry on a logging failure.
  await doc.ref
    .update({
      accessCount: (data.accessCount || 0) + 1,
      lastAccessAt: new Date().toISOString(),
      lastAccessIp: ip,
    })
    .catch(() => {});

  return { ok: true, id: doc.id, label: data.label, ttlSeconds };
}

export async function revokeInvite(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  await db.collection(COLLECTION).doc(id).update({ revoked: true });
  return true;
}

export type InviteSummary = {
  id: string;
  label: string;
  accessCount: number;
  revoked: boolean;
  createdAt: string;
  lastAccessAt: string | null;
  expiresAt: string | null;
};

/** All invites, newest first — for the admin tool. */
export async function listInvites(): Promise<InviteSummary[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await db.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => {
    const v = d.data() as InviteDoc;
    return {
      id: d.id,
      label: v.label,
      accessCount: v.accessCount || 0,
      revoked: !!v.revoked,
      createdAt: v.createdAt,
      lastAccessAt: v.lastAccessAt ?? null,
      expiresAt: v.expiresAt ?? null,
    };
  });
}
