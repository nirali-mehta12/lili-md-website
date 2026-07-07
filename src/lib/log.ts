/*
  ============================================================
  Structured logger with dual-write (server-only)
  ------------------------------------------------------------
  Every log line goes to TWO places:

    1. stdout as JSON → Cloud Logging picks it up automatically.
       Cloud Error Reporting auto-detects ERROR + CRITICAL severity.
       Queryable via `gcloud logging read` or the Firebase Console →
       App Hosting → Logs tab. Retention: 30 days free.

    2. Firestore `app-events` collection (WARN / ERROR / CRITICAL only)
       — a durable record queryable from the same Firebase Console
       everyone already uses for `leads` / `doctor-applications`. No
       gcloud reauth required to view. Retention: forever (until pruned).

  Why the dual-write:
    Cloud Logging access requires an interactive gcloud reauth every
    time the token drifts. In practice that made "just check the logs"
    a 15-minute chore. Firestore is trivial to query from any
    Firebase-authed context (console, MCP, or the /admin tool later).

  Cost note: Firestore writes on the free tier allow 20K/day. Even
  aggressive validation-warning volume stays well inside that.

  Usage:
    import { log } from "@/lib/log";
    log.info("apply.request_received", { ip, cid });   // → stdout only
    log.warn("apply.rate_limited", { ip, cid });       // → stdout + Firestore
    log.error("apply.email_send_failed", { err, cid }); // → stdout + Firestore

  Requesting a `correlationId` up-front lets one submission be traced
  across DB write, email send, and cookie set — useful when a support
  ticket says "my submission at 3:14pm failed."
  ============================================================
*/

import { getDb } from "@/lib/firebase";

type Severity = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";

type Payload = Record<string, unknown> & {
  err?: unknown;
};

const APP_EVENTS_COLLECTION = "app-events";

/**
 * Best-effort Firestore write for a log entry.
 * Never throws — the logger must not itself be a source of unhandled errors.
 * Never blocks — fires async and lets the caller move on.
 */
function persistToFirestore(entry: Record<string, unknown>): void {
  try {
    const db = getDb();
    if (!db) return; // Placeholder mode or Firebase unconfigured — stdout is enough.
    // Don't await — the caller doesn't need to wait for the log write.
    db.collection(APP_EVENTS_COLLECTION)
      .add(entry)
      .catch(() => {
        // Firestore write failed (auth expired, quota, network) — silent.
        // The stdout log already fired; we've done what we can.
      });
  } catch {
    // getDb() itself threw somehow — silent.
  }
}

/**
 * Emit a single structured log line.
 *
 * @param severity  Cloud Logging severity level.
 * @param event     Short kebab-case event name (e.g. "apply.request_received").
 * @param payload   Optional structured context. Errors get their stack included.
 */
function emit(severity: Severity, event: string, payload: Payload = {}): void {
  const { err, ...rest } = payload;
  const entry: Record<string, unknown> = {
    severity,
    event,
    ts: new Date().toISOString(),
    ...rest,
  };
  if (err instanceof Error) {
    entry.error = { name: err.name, message: err.message, stack: err.stack };
  } else if (err !== undefined) {
    entry.error = { value: String(err) };
  }
  // 1. Serialize once and print to stdout — Cloud Logging parses the whole
  //    line as JSON and classifies by the `severity` field.
  const line = JSON.stringify(entry);
  if (severity === "ERROR" || severity === "CRITICAL") {
    console.error(line);
  } else if (severity === "WARN") {
    console.warn(line);
  } else {
    console.log(line);
  }
  // 2. Persist WARN+ entries to Firestore so they're queryable from
  //    Firebase Console without a gcloud reauth. Skip DEBUG/INFO — those
  //    would be noisy in Firestore and are only useful for step-through
  //    diagnostics via Cloud Logging.
  if (severity === "WARN" || severity === "ERROR" || severity === "CRITICAL") {
    persistToFirestore(entry);
  }
}

export const log = {
  /** Verbose diagnostics; usually off in production. */
  debug: (event: string, payload?: Payload) => emit("DEBUG", event, payload),
  /** Normal operations (request received, work completed, side effects fired). */
  info: (event: string, payload?: Payload) => emit("INFO", event, payload),
  /** Something recoverable that a human should occasionally review. */
  warn: (event: string, payload?: Payload) => emit("WARN", event, payload),
  /** Handled error path — Cloud Error Reporting picks these up automatically. */
  error: (event: string, payload?: Payload) => emit("ERROR", event, payload),
  /** Unhandled or user-blocking failure. Pages the on-call ideally. */
  critical: (event: string, payload?: Payload) =>
    emit("CRITICAL", event, payload),
};

/**
 * Generate a short correlation ID for tracing a single flow across log lines.
 * Not cryptographically strong — just enough to disambiguate concurrent submissions.
 *
 * @returns 12-hex-char id, e.g. "a3f9c1b207d5"
 */
export function correlationId(): string {
  // crypto.randomUUID is Node 16+; slicing keeps log lines readable.
  return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}
