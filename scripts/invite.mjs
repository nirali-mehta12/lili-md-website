/*
  Mint / list / revoke access-gate invite codes.

  Auth: uses Application Default Credentials. Locally, run once:
    gcloud auth application-default login

  Usage:
    node scripts/invite.mjs create "Dr. Jane Smith" [ttlDays]
    node scripts/invite.mjs list
    node scripts/invite.mjs revoke <id>

  IMPORTANT: the plaintext code is shown only at creation time — it is
  stored hashed and is NOT recoverable. Copy it when you create it.
*/
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "node:crypto";

const PROJECT = process.env.FIREBASE_PROJECT_ID || "lili-md-website";
const SITE = process.env.SITE_ORIGIN || "https://lilimd.ai";
const COLLECTION = "invites";
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

if (!getApps().length) initializeApp({ projectId: PROJECT });
const db = getFirestore();

const generateCode = (len = 8) => {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out.replace(/(.{4})(.{4})/, "$1-$2");
};
const normalize = (c) => c.toUpperCase().replace(/[^A-Z0-9]/g, "");
const hash = (c) => crypto.createHash("sha256").update(normalize(c)).digest("hex");

const [cmd, ...args] = process.argv.slice(2);

if (cmd === "create") {
  const label = args[0];
  const ttlDays = args[1] ? Number(args[1]) : null;
  if (!label) {
    console.error('Usage: node scripts/invite.mjs create "Name" [ttlDays]');
    process.exit(1);
  }
  const code = generateCode();
  const id = crypto.randomUUID();
  const expiresAt = ttlDays
    ? new Date(Date.now() + ttlDays * 86_400_000).toISOString()
    : null;
  await db.collection(COLLECTION).doc(id).set({
    label,
    codeHash: hash(code),
    createdAt: new Date().toISOString(),
    expiresAt,
    revoked: false,
    accessCount: 0,
    lastAccessAt: null,
  });
  console.log(`\n  Invite for: ${label}`);
  console.log(`  Code:       ${code}`);
  console.log(`  One-click:  ${SITE}/?c=${normalize(code)}`);
  console.log(`  ID:         ${id}`);
  if (expiresAt) console.log(`  Expires:    ${expiresAt}`);
  console.log("");
} else if (cmd === "list") {
  const snap = await db.collection(COLLECTION).orderBy("createdAt", "desc").get();
  if (snap.empty) console.log("(no invites yet)");
  snap.forEach((d) => {
    const v = d.data();
    const mark = v.revoked ? "REVOKED" : "active ";
    console.log(
      `  [${mark}] ${v.label}  · accesses: ${v.accessCount || 0}  · id: ${d.id}`,
    );
  });
} else if (cmd === "revoke") {
  const id = args[0];
  if (!id) {
    console.error("Usage: node scripts/invite.mjs revoke <id>");
    process.exit(1);
  }
  await db.collection(COLLECTION).doc(id).update({ revoked: true });
  console.log(`  Revoked ${id}`);
} else {
  console.log('Commands:\n  create "Name" [ttlDays]\n  list\n  revoke <id>');
}
process.exit(0);
