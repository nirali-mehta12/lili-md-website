/*
  ============================================================
  Minimal structured logger (server-only)
  ------------------------------------------------------------
  Cloud Logging (which App Hosting forwards stdout/stderr to) recognizes
  JSON payloads with a `severity` field and auto-classifies them. Logging
  as JSON via this helper gives us:

    - filterable severity levels (INFO / WARN / ERROR / CRITICAL)
    - Cloud Error Reporting auto-detection on ERROR + CRITICAL
    - queryable event names via the `event` field
    - structured payload fields (no regex parsing at query time)

  Usage:
    import { log } from "@/lib/log";
    log.info("apply.request_received", { ip, ua });
    log.warn("apply.rate_limited", { ip });
    log.error("apply.firestore_write_failed", { err, docId });

  Requesting a `correlationId` up-front lets one submission be traced
  across DB write, email send, and cookie set — useful when a support
  ticket says "my submission at 3:14pm failed."
  ============================================================
*/

type Severity = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";

type Payload = Record<string, unknown> & {
  err?: unknown;
};

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
  // Serialize once — Cloud Logging parses the whole line as JSON.
  const line = JSON.stringify(entry);
  if (severity === "ERROR" || severity === "CRITICAL") {
    console.error(line);
  } else if (severity === "WARN") {
    console.warn(line);
  } else {
    console.log(line);
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
