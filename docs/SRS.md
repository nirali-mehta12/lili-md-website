# Software Requirements Specification (SRS) — LiLi M.D. Marketing Site

> IEEE-830-inspired specification for the production system at
> [lilimd.ai](https://lilimd.ai). Complements the higher-level
> [`PRD.md`](./PRD.md) (product intent + business rationale) and the
> reusable [`WEBSITE-PLAYBOOK.md`](./WEBSITE-PLAYBOOK.md).
>
> **Convention:** functional requirements are numbered `FR-N.M`, non-functional
> `NFR-<category>-N`. A requirement's priority is `MUST` / `SHOULD` / `MAY`
> (per RFC 2119). Every requirement should be verifiable — if you can't write
> an acceptance test for it, restate it.

---

## 1. Introduction

### 1.1 Purpose

Defines the software requirements — functional, non-functional, interface,
and data — for **lilimd.ai**, a single-page marketing + lead-capture site
gated to invitation-only visitors. Intended audience: engineers making
changes, QA verifying behavior, operators debugging incidents, and future
maintainers deciding whether a proposed change violates a documented
requirement.

### 1.2 Scope

**In scope:** the Next.js app that serves [lilimd.ai](https://lilimd.ai),
its Firestore data model, the SMTP notification pipeline, the two access
gates (`/locked` password, `/apply` info form), the admin invite tool, and
the operational observability layer.

**Out of scope:** the LiLi M.D. product application (separate repo,
separate infrastructure), the ops-owned monitoring Terraform in
`lili-cloud-ops`, and the physician CRM / follow-up workflow after Mel
receives a lead notification.

### 1.3 Definitions

| Term | Meaning |
|---|---|
| **Gate** | The authentication mechanism that hides the site from uninvited visitors |
| **Invite** | A hashed access code stored in Firestore that unlocks the gate for one visitor |
| **Session** | A signed cookie (`lili_access`) that carries authentication across requests, valid for 7 days |
| **Lead** | A landing-page "Submit Your Practice" form submission from an already-inside visitor |
| **Application** | A `/apply` form submission from an outreach doctor entering the site |
| **INSTANT mode** | `/apply` submissions are immediately granted access (current default) |
| **MANUAL mode** | `/apply` submissions require Mel to review + send a personal invite link |

### 1.4 References

- [`PRD.md`](./PRD.md) — business + product context
- [`WEBSITE-PLAYBOOK.md`](./WEBSITE-PLAYBOOK.md) — reusable recipe
- [`LiLi_MD_Brand_Guidelines.html`](./LiLi_MD_Brand_Guidelines.html) — canonical palette + typography
- CLAUDE.md, AGENTS.md — repo-level rules
- RFC 2119 — requirement level definitions

---

## 2. Overall description

### 2.1 Product perspective

lilimd.ai is a **standalone marketing site**, deliberately not part of the
main LiLi M.D. product app. It exists to introduce the "Private Club" —
the founding-10 physician cohort — to prospective members and investors.
Every visitor must be either explicitly invited (password) or self-verify
their credentials (`/apply` form).

The site is single-page, mobile-first, and animation-light. Persistence
is Firestore; email is direct SMTP; hosting is Firebase App Hosting on
GCP. All service accounts are keyless (ADC).

### 2.2 Product functions (summary)

- **F1 — Marketing content delivery:** render 13 designed sections that
  communicate the LiLi M.D. value proposition.
- **F2 — Invitation-only access gate:** deny unauthenticated visitors,
  redirect them to a lock page.
- **F3 — Password entry (personal invites) — PAUSED 2026-07-07:** flow
  preserved in code (`src/app/locked/*`, `src/app/api/access/*`,
  `src/lib/invites.ts`, `/admin` tool) but no longer wired into the
  visitor gate. `/apply` is the sole entry point now. Restore by
  reverting the commented block in `src/proxy.ts`.
- **F4 — Info-form entry (outreach doctors):** collect verifying info,
  persist it, notify admin, issue a session cookie.
- **F5 — Landing-page lead capture:** collect + persist practice-submission
  form + notify admin.
- **F6 — Admin invite management:** allow Mel to create / list / revoke
  invite codes with a password-protected tool.
- **F7 — Health + monitoring:** expose an uptime probe endpoint and emit
  structured logs consumable by Cloud Logging + Error Reporting.

### 2.3 User classes

| Class | Description | Primary concerns |
|---|---|---|
| **Personal invitee** | Physician invited directly by Mel via a hand-shared password | Fast entry, clean UX, understands the code came from Mel |
| **Outreach doctor** | Physician reached via outbound campaign; lands on `/apply` | Legibility, credibility signals, minimal-friction form |
| **Investor** | Non-physician evaluating LiLi M.D.; typically arrives via personal invite | Content clarity, professional presentation |
| **Admin (Mel)** | Founding CEO managing invite codes + reviewing applications | Fast triage in email inbox, ability to revoke |
| **Operator (Nirali / cloud-ops)** | Maintains the site + monitors infrastructure | Observability, alerts, ability to roll back |

### 2.4 Operating environment

- **Runtime:** Firebase App Hosting (Cloud Run under the hood), region `us-east4`.
- **Client:** modern browsers on desktop and mobile (iOS Safari, Chrome, Firefox, Edge — no IE support).
- **Data store:** Cloud Firestore (Native), `(default)` database, region `nam5`.
- **Email transport:** Gmail Google Workspace SMTP (`smtp.gmail.com:465`).
- **DNS + TLS:** GoDaddy for apex records, Google Certificate Manager for ACME-issued TLS.

### 2.5 Design + implementation constraints

- **DC-1:** Frontend framework MUST be Next.js 16 (App Router).
- **DC-2:** Styling MUST use Tailwind CSS v4 (@theme tokens in `globals.css`, no `tailwind.config.js`).
- **DC-3:** All server-side code MUST use Firebase Admin SDK with keyless ADC — the organization policy blocks downloadable service-account keys.
- **DC-4:** No secrets in source. Runtime secrets live in GCP Secret Manager and are referenced by name in `apphosting.yaml`.
- **DC-5:** Site copy MUST live in `src/lib/content.ts` — never inline in JSX. Enforced by CLAUDE.md.
- **DC-6:** Server-only modules (`firebase.ts`, `email.ts`, API routes) MUST NOT be imported by client components.
- **DC-7:** Auto-deploy on push to `main`. No manual deploy workflow.
- **DC-8:** Test coverage is currently zero. TypeScript typecheck (`tsc --noEmit`) is the CI-equivalent gate.

### 2.6 Assumptions + dependencies

- Firestore uptime is treated as very high; degradation is best-effort.
- Gmail SMTP is treated as best-effort; email loss does not block form submission from a user's perspective (record still lands in Firestore).
- The `lili-cloud-ops` Terraform is authoritative for infra alerting; this app owns only application-level logs + a `/api/health` endpoint.
- Rate-limit state is per-instance in-memory. Multi-instance scale-out is accepted as reducing effective per-IP limits proportionally.

---

## 3. External interface requirements

### 3.1 User interfaces

| Screen | Path | Purpose |
|---|---|---|
| Landing page | `/` | 13-section marketing content + inline lead-capture form |
| Lock page | `/locked` | Password entry with emblem + marina photo |
| Apply page | `/apply` | 9-field doctor info form + TCPA consent |
| Admin | `/admin` | Password-gated invite management |

All screens MUST match the designer references in `docs/` and use the
brand palette from `LiLi_MD_Brand_Guidelines.html` (exception: `/apply`
uses its own rose/mauve palette per designer spec).

### 3.2 Software interfaces

| Interface | Direction | Purpose |
|---|---|---|
| Firebase Admin SDK | Outbound (server → Firestore) | CRUD on `invites`, `leads`, `doctor-applications` |
| Nodemailer / Gmail SMTP | Outbound (server → SMTP) | Send admin notifications |
| Cloud Logging | Outbound (stdout → Cloud) | Structured JSON logs |
| Cloud Error Reporting | Auto-derived from ERROR/CRITICAL logs | Incident tracking |

### 3.3 Communications interfaces

- **HTTPS only** in production. TLS via ACME. HTTP redirects to HTTPS at
  the load-balancer layer.
- **Cookie:** `lili_access`, HttpOnly, Secure, SameSite=Lax, path=/, 7-day max-age.

---

## 4. Functional requirements

### FR-1 — Marketing content delivery

- **FR-1.1** [MUST] The landing page (`/`) SHALL render 13 sections in the order defined in `src/app/page.tsx`.
- **FR-1.2** [MUST] All user-visible copy SHALL be sourced from `src/lib/content.ts` — no inline strings in JSX.
- **FR-1.3** [MUST] Every top-level `<section>` SHALL have a stable `id` attribute for anchor links + screenshot clipping.
- **FR-1.4** [MUST] Layout SHALL be mobile-first responsive; two/three-column desktop grids SHALL collapse to single-column at the `sm:` breakpoint (640px).
- **FR-1.5** [SHOULD] Scroll-reveal animations SHALL respect `prefers-reduced-motion` — content becomes visible instantly for those users.

### FR-2 — Access gate

- **FR-2.1** [MUST] When `ACCESS_GATE_ENABLED === "true"`, every request to any non-exempt path SHALL be checked for a valid `lili_access` cookie.
- **FR-2.2** [MUST] Exempt paths from the gate SHALL be: `/apply`, `/admin/*`, and any `/api/*`. *(`/locked` was previously exempted; that exemption is commented out as of 2026-07-07 alongside the password gate pause.)*
- **FR-2.3** [MUST] Invalid or missing cookie SHALL cause the response to be rewritten to `/apply` with the URL preserved. *(Was `/locked` prior to 2026-07-07.)*
- **FR-2.4** [MUST] Gated responses SHALL carry `Cache-Control: private, no-store, must-revalidate` to prevent CDN caching one visitor's rendered output for another.
- **FR-2.5** [MUST] The gated home page SHALL be `export const dynamic = "force-dynamic"`.
- **FR-2.6** *(PAUSED 2026-07-07)* `?c=CODE` one-click invite handling is commented out in `src/proxy.ts` alongside the password gate. Preserved to restore later.
- **FR-2.7** [SHOULD] Session TTL SHALL be 7 days — currently only `/apply` issues sessions (`/locked` password flow is paused).

### FR-3 — Password entry (`/locked`) — **PAUSED 2026-07-07**

*The requirements below describe how the password gate is implemented, but the
flow is no longer wired into the visitor experience. `/apply` is the sole
gateway. Code preserved (`src/app/locked/*`, `src/app/api/access/route.ts`,
`src/lib/invites.ts`, `scripts/invite.mjs`, `/admin` invite management tool)
so the flow can be restored by reverting the pause block in `src/proxy.ts`.*

- **FR-3.1** [MUST when active] `POST /api/access { code }` SHALL SHA-256-hash the provided code and look it up in Firestore `invites` by `codeHash`.
- **FR-3.2** [MUST when active] Invalid, revoked, or expired codes SHALL return HTTP 401 with a generic error message (do not leak which of the three).
- **FR-3.3** [MUST when active] Successful validation SHALL increment `accessCount`, update `lastAccessAt` and `lastAccessIp` on the invite doc, then set the session cookie.
- **FR-3.4** [MUST when active] Endpoint SHALL rate-limit per client IP: 10 attempts per 10-minute sliding window.

### FR-4 — Info-form entry (`/apply`)

- **FR-4.1** [MUST] The form SHALL collect these fields: First Name, Last Name, Mobile Phone, Email (required); Practice / Business Name, Practice Website, Medical License No., Current EHR (from the 85-option list in `apply.ehrOptions`, per `docs/ehr_dropdown.json`), Referred By (optional). When EHR is provided it MUST be on the whitelist; empty EHR is allowed.
- **FR-4.2** [MUST] The form SHALL present a consent checkbox with the exact copy in `apply.consent` in content.ts. The submit button SHALL be disabled while the checkbox is unchecked.
- **FR-4.3** [MUST] `POST /api/apply` SHALL type-guard the body and reject primitives / arrays / null with HTTP 400.
- **FR-4.4** [MUST] Every text field SHALL be capped at 200 chars; the URL field at 500 chars. Oversize inputs SHALL return HTTP 400.
- **FR-4.5** [MUST] When `ehr` is non-empty, it SHALL be validated against `apply.ehrOptions`. Non-whitelist values SHALL return HTTP 400. Empty `ehr` is allowed (optional field).
- **FR-4.6** [MUST] `consent === true` SHALL be validated server-side and persisted as `consent: true, consentAt: <ISO>` on the Firestore doc. Server SHALL reject with HTTP 400 if false or missing.
- **FR-4.7** [MUST] On success the endpoint SHALL: persist the application to `doctor-applications`, mint an invite via `createInvite`, AWAIT the admin notification email (a **short one-liner** per Mel's answer C, 2026-07-06 — `[Gate] <Name> · <Practice>` subject + a 1-line body pointing to Firestore for the full record), and set the session cookie.
- **FR-4.8** [MUST] Endpoint SHALL rate-limit per client IP: 6 attempts per 10-minute sliding window.
- **FR-4.9** [MUST] An already-authenticated visitor submitting `/apply` SHALL receive `{ok:true, alreadyAuthenticated:true}` without creating a duplicate invite or duplicate notification email.
- **FR-4.10** [MUST] If `createInvite` returns `null` (Firestore unreachable or misconfigured), endpoint SHALL respond HTTP 503 with a friendly message and NOT set the session cookie.

### FR-5 — Lead capture (`/api/submit`)

- **FR-5.1** [MUST] The landing form SHALL collect: Name, Practice Name, Email, Phone, Practice Website, Medical License No., Current EHR, Referred By, Message. Medical License / EHR / Referred By are optional so investors (non-physicians) can still submit; they exist for consistency with the `/apply` gate form (per designer Ronnie, 2026-07-06).
- **FR-5.2** [MUST] Server SHALL validate email format + honeypot field ("company") + rate-limit before persisting.
- **FR-5.3** [MUST] On success the endpoint SHALL persist to `leads` + await the full admin notification email.
- **FR-5.4** [SHOULD] When SMTP is not configured, endpoint SHALL still return 200 (record persists) and log at WARN level.
- **FR-5.5** [MUST] Notification email SHALL be the **full detailed** template (Mel's answer C, 2026-07-06) — includes every field the doctor submitted.

### FR-6 — Admin tool (`/admin`)

- **FR-6.1** [MUST] The tool SHALL be protected by a password gate (`ADMIN_SECRET`), separate from the visitor gate.
- **FR-6.2** [MUST] Mel SHALL be able to: create a new invite for a named person, list all invites with their access counts, and revoke any invite.
- **FR-6.3** [MUST] Plaintext codes SHALL be shown exactly once, at creation time.

### FR-7 — Health probe (`/api/health`)

- **FR-7.1** [MUST] `GET /api/health` SHALL return HTTP 200 with `{ok:true, status:"healthy", uptimeSeconds}`.
- **FR-7.2** [MAY] `GET /api/health?depth=deep` SHALL additionally check Firestore reachability and return 503 with dependency status when down.

---

## 5. Non-functional requirements

### NFR-Performance

- **NFR-PERF-1** [SHOULD] Time-to-first-byte for `/` under warm-cache conditions SHALL be < 500ms at the App Hosting edge.
- **NFR-PERF-2** [SHOULD] Lighthouse LCP on `/` SHALL be < 2.5s on desktop, < 4s on mobile.
- **NFR-PERF-3** [SHOULD] `POST /api/apply` SHALL complete in < 3s p95 (dominated by Firestore write + SMTP handshake).

### NFR-Security

- **NFR-SEC-1** [MUST] All server-to-Firestore access SHALL use Firebase Admin with ADC. No client SDK writes.
- **NFR-SEC-2** [MUST] `firestore.rules` SHALL deny all public reads + writes.
- **NFR-SEC-3** [MUST] Access codes SHALL be stored ONLY as SHA-256 hashes.
- **NFR-SEC-4** [MUST] Session cookies SHALL be HttpOnly + Secure + SameSite=Lax.
- **NFR-SEC-5** [MUST] `clientIp()` SHALL parse `X-Forwarded-For` using the GCP LB convention (second-to-last hop) — never trust the leftmost.
- **NFR-SEC-6** [MUST] Values interpolated into SMTP Subject headers SHALL have CR/LF stripped before nodemailer sees them (`stripHeaderInjection`).
- **NFR-SEC-7** [MUST] Every input field SHALL have a documented maximum length + server-side enforcement.
- **NFR-SEC-8** [MUST] Consent for TCPA-covered communications SHALL be captured server-side with a timestamp, not just enforced client-side.

### NFR-Availability

- **NFR-AVAIL-1** [SHOULD] Target uptime: 99.5% monthly (App Hosting SLA is the effective ceiling).
- **NFR-AVAIL-2** [MUST] Firestore unreachable during `/api/apply` SHALL return 503 rather than hang or 500.
- **NFR-AVAIL-3** [MUST] SMTP unreachable during any form submission SHALL NOT block the response — the Firestore record is the audit trail.

### NFR-Observability

- **NFR-OBS-1** [MUST] Every /apply code path SHALL emit at least one structured log line with `severity`, `event`, and a correlation ID.
- **NFR-OBS-2** [MUST] Handled errors SHALL log at ERROR severity; unhandled or user-blocking failures at CRITICAL.
- **NFR-OBS-3** [MUST] Cloud Error Reporting SHALL auto-detect ERROR + CRITICAL entries without additional SDK integration.
- **NFR-OBS-4** [SHOULD] Uptime probes SHALL hit `/api/health` at regular intervals; deep probes hit `?depth=deep`.
- **NFR-OBS-5** [MUST] All `WARN`, `ERROR`, and `CRITICAL` log lines SHALL be dual-written to Firestore `app-events` collection (best-effort — a Firestore write failure MUST NOT block or delay the user request). Rationale: Cloud Logging access requires gcloud reauth which breaks the "just check the logs" workflow. `app-events` is queryable from the same Firebase Console that hosts `leads` / `doctor-applications`, no reauth needed.

### NFR-Compliance

- **NFR-COMP-1** [MUST] TCPA consent SHALL be persisted with the exact disclosure text as it appeared to the user + timestamp.
- **NFR-COMP-2** [MUST] `public/robots.txt` SHALL be `noindex` while the site is invitation-only.

### NFR-Usability + Accessibility

- **NFR-A11Y-1** [MUST] Form errors SHALL be announced to assistive technology via `role="alert"` + `aria-live="assertive"`.
- **NFR-A11Y-2** [MUST] Form success states SHALL be announced via `role="status"` + `aria-live="polite"`.
- **NFR-A11Y-3** [MUST] Consent checkbox SHALL use a native `<input type="checkbox">` inside a `<label>` — not a synthetic `role="checkbox"` div.
- **NFR-A11Y-4** [SHOULD] Every input SHALL have a programmatically associated label (via `<label>`, `aria-label`, or `aria-labelledby`).

### NFR-Maintainability

- **NFR-MAINT-1** [MUST] All exported functions in server code SHALL carry JSDoc describing parameters + return value.
- **NFR-MAINT-2** [SHOULD] TypeScript typecheck (`tsc --noEmit`) SHALL pass before every deploy.

---

## 6. Data requirements

### 6.1 `invites` (Firestore)

| Field | Type | Purpose |
|---|---|---|
| `label` | string | Human-readable owner (e.g. "Dr. Jane Smith · Bay Family Med") |
| `codeHash` | string | SHA-256 of the plaintext code |
| `createdAt` | string (ISO) | Creation timestamp |
| `expiresAt` | string (ISO) \| null | Expiry timestamp |
| `revoked` | boolean | Admin can flip to true to disable |
| `accessCount` | number | Incremented on each successful use |
| `lastAccessAt` | string (ISO) \| null | Last successful use |
| `lastAccessIp` | string \| null | Best-effort client IP |

### 6.2 `leads` (Firestore)

| Field | Type | Source |
|---|---|---|
| `name`, `practiceName`, `email`, `phone`, `website`, `licenseNo`, `ehr`, `referredBy`, `socials`, `message` | string | Landing page form |
| `createdAt` | string (ISO) | Server |
| `ip` | string | Server |

### 6.3 `app-events` (Firestore)

Structured log entries at severity WARN/ERROR/CRITICAL, dual-written by
`@/lib/log`. Queryable directly from Firebase Console for debugging without
requiring a gcloud reauth.

| Field | Type | Purpose |
|---|---|---|
| `severity` | `"WARN"` \| `"ERROR"` \| `"CRITICAL"` | Cloud-Logging-compatible severity |
| `event` | string | Short kebab-case event name (e.g. `apply.email_send_failed`) |
| `ts` | string (ISO) | Server timestamp |
| `cid` | string \| undefined | Correlation ID linking multiple lines from one flow |
| `error.name / message / stack` | strings | Present when the caller passed an `err` field |
| ...arbitrary | any | Any other fields the caller passed (ip, docId, etc.) |

Common queries (Firebase Console → Firestore → `app-events`):
- "Recent errors" — where `severity == "ERROR"`, order by `ts` desc
- "Trace one flow" — where `cid == "abc123"`, order by `ts` asc
- "Email failures" — where `event == "apply.email_send_failed"`

### 6.4 `doctor-applications` (Firestore)

| Field | Type | Source |
|---|---|---|
| `firstName`, `lastName`, `fullName`, `practiceName`, `website`, `phone`, `email`, `licenseNo`, `ehr`, `referredBy` | string | `/apply` form |
| `consent` | boolean (always `true` when persisted) | Server (from body.consent === true) |
| `consentAt` | string (ISO) | Server |
| `createdAt` | string (ISO) | Server |
| `ip` | string | Server |
| `cid` | string | Server (correlation ID for log tracing) |

---

## 7. System design (informative)

*Design-level context, not requirements — explains HOW the requirements
above are implemented. Not authoritative if it conflicts with §4–§6.*

### 7.1 Deployment topology

```
                    ┌──────────────────────────────┐
                    │      Browser (visitor)       │
                    └──────────────┬───────────────┘
                                   │  HTTPS
                                   ▼
              ┌────────────────────────────────────────┐
              │   Firebase App Hosting (us-east4)      │
              │   • Cloud Run backend                  │
              │   • Auto-deploy on push to main        │
              └──────────────┬─────────────────────────┘
                             │
                             ▼
                ┌───────────────────────────┐
                │   Next.js 16 (App Router) │
                │                           │
                │   proxy.ts (gate)         │
                │   ├─ /locked  (password)  │
                │   ├─ /apply   (info form) │
                │   ├─ /admin   (mel tool)  │
                │   ├─ /api/*   (server)    │
                │   └─ /        (landing)   │
                └──────────────┬────────────┘
                               │
        ┌──────────────────────┼───────────────────┐
        ▼                      ▼                   ▼
   ┌──────────┐         ┌────────────┐      ┌──────────────┐
   │ Firestore│         │ Nodemailer │      │ Cloud Logging│
   │ (native) │         │  → Gmail   │      │   + Error    │
   │          │         │    SMTP    │      │  Reporting   │
   │ invites  │         └────────────┘      └──────┬───────┘
   │ leads    │                                    │
   │ doctor-  │                                    ▼
   │ appli-   │                          ┌────────────────────┐
   │ cations  │                          │  lili-cloud-ops    │
   └──────────┘                          │  monitoring        │
                                         │  • budget alerts   │
                                         │  • error-rate      │
                                         │  • uptime probes   │
                                         │  → Google Chat     │
                                         └────────────────────┘
```

### 7.2 Repo layout

```
src/
├── app/
│   ├── layout.tsx        # Root + fonts
│   ├── globals.css       # Tailwind v4 @theme tokens
│   ├── page.tsx          # Landing page composition
│   ├── locked/           # Password gate
│   ├── apply/            # Doctor-info gate
│   ├── admin/            # Admin invite tool
│   └── api/
│       ├── access/       # Password validation
│       ├── apply/        # Info form endpoint
│       ├── submit/       # Landing form endpoint
│       ├── admin/        # Admin CRUD
│       └── health/       # Uptime probe
├── components/           # UI components (mostly landing sections)
├── lib/
│   ├── content.ts        # ALL user-visible copy
│   ├── firebase.ts       # Lazy Admin init
│   ├── email.ts          # SMTP wrapper + sanitizer
│   ├── invites.ts        # Code minting + verification
│   ├── session.ts        # HMAC signing + verify
│   ├── log.ts            # Structured JSON logger
│   └── admin.ts          # Admin auth helpers
└── proxy.ts              # Next.js 16 middleware = gate
```

### 7.3 Runtime identity + secrets

- **ADC-only** for GCP access. Runtime SA: `firebase-app-hosting-compute@lili-md-website.iam.gserviceaccount.com`.
- **Secrets:** three in GCP Secret Manager: `ACCESS_SESSION_SECRET`, `ADMIN_SECRET`, `SMTP_PASS`. Granted to backend via `firebase apphosting:secrets:grantaccess`.
- Non-secret env vars set inline in `apphosting.yaml`.

---

## 8. Failure modes + degraded operation

| Failure | User impact | System behavior | Recovery |
|---|---|---|---|
| Firestore unreachable on `/api/submit` | 200; lead not stored | Placeholder-mode fallback; email fires | Check ADC + rules deployment |
| Firestore unreachable on `/api/apply` | 503 with friendly retry message | `createInvite` returns null → route returns 503 | Same as above |
| SMTP unreachable | 200 to user; admin notification lost | `sendMail` fails; caught; log line at WARN | Check SMTP env + Gmail app-password |
| `ACCESS_SESSION_SECRET` unset | 503 after side effects | `signSession` throws; caught at CRITICAL | Re-add secret + grant access |
| Rate limit hit | 429 friendly message | Per-IP window; state resets on cold start | Investigate log volume |
| CDN cache leak | Wrong visitor sees another's page | Blocked by `force-dynamic` + `Cache-Control` invariant | Verify both are set on gated routes |

---

## 9. Acceptance / verification

Each functional requirement above SHOULD have a corresponding test — either
manual runbook step or automated. Current state: **manual verification via
`npm run screenshot` at multiple viewports + direct curl of API endpoints.**
Automated tests are a known gap (see NFR-MAINT-2).

Suggested manual acceptance checklist before a production deploy:

1. `npm run build` passes (typecheck + build).
2. `curl http://localhost:3000/api/health` returns `{ok:true}`.
3. Screenshot `/`, `/locked`, `/apply` at desktop + iphone14pro viewports.
4. Submit each form once with valid data → verify Firestore doc created + admin email arrives.
5. Submit each form once with invalid data → verify 400 with the exact error string from `content.ts`.
6. Rate-limit probe: rapid-fire 20 requests → verify 429 kicks in.
7. Live smoke against production: `npm run smoke-test` for a fresh code, log in to lilimd.ai, submit a test lead, confirm end-to-end.

---

## 10. Runbook

### Rotate the smoke-test invite code
```sh
npm run smoke-test
```

### Add a new invite for a named person
```sh
node scripts/invite.mjs create "Dr. Jane Smith" 30
```

### Revoke an invite
```sh
node scripts/invite.mjs list
node scripts/invite.mjs revoke <doc-id>
```

### Enable/disable the gate
Edit `apphosting.yaml`, flip `ACCESS_GATE_ENABLED` to `"true"` or `"false"`, commit, push.

### Switch `/apply` from INSTANT to MANUAL review
1. `route.ts`: skip `setSession()`, return `{ok:true, pending:true}`.
2. `email.ts`: render `inviteCode` in the notification HTML/text.
3. `page.tsx`: adjust success screen text (or branch on `pending`).

### Investigate "submitted but nothing arrived"
1. Cloud Logging → filter `jsonPayload.event =~ "^apply\\."`.
2. Search by user email or timestamp for the matching `cid`.
3. Follow the `cid` across log entries — missing hops show where it broke.

---

## 11. Change history

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 2026-07-06 | Initial SRS (converted from earlier ARCHITECTURE.md) | Nirali + AI |
| 1.1 | 2026-07-06 | Mel locked Q1 (Instant) + Q2 (both-with-one-liner-on-gate). FR-4.1 EHR whitelist grew from 12 → 85 options (Mel's real list, `docs/ehr_dropdown.json`). FR-5.1 landing form grew to 9 fields (added License/EHR/ReferredBy per Ronnie). FR-4.7 gate notification is now a one-liner; FR-5.5 codifies landing notification as full detail. | Nirali + AI |
| 1.2 | 2026-07-07 | Password gate (`/locked`) **paused** — code preserved but no longer wired into the visitor flow. `/apply` is the sole gateway. FR-3.* marked "when active". FR-2.2 / FR-2.3 / FR-2.6 updated. F3 in overview marked paused. Landing-page CTA is scheduled to change to a "Click to be considered" button when Ronnie's design lands — that will introduce a second alert type. `/apply` gate email upgraded from one-liner to full-detail (still triggered on every gate submission). | Nirali + AI |
| 1.3 | 2026-07-07 | Added `NFR-OBS-5`: structured logger now dual-writes WARN+ entries to Firestore `app-events` so ops can inspect errors without a gcloud reauth. Added §6.3 `app-events` data model. Also added shared US phone / email format validation (client + server) — bad phones and emails are now rejected with a 400 on both `/apply` and the landing form. | Nirali + AI |
| 1.4 | 2026-07-16 | FR-4.1 / FR-4.5: `/apply` required fields narrowed to first name, last name, phone, email (+ consent). Practice, website, license, EHR, referred-by are optional. | Nirali + AI |

---

## 12. Related documents

- [`PRD.md`](./PRD.md) — product intent + audience + business rationale
- [`WEBSITE-PLAYBOOK.md`](./WEBSITE-PLAYBOOK.md) — reusable recipe
- [`LiLi_MD_Brand_Guidelines.html`](./LiLi_MD_Brand_Guidelines.html) — visual spec
- [`lili-md-access-gate-page2.html`](./lili-md-access-gate-page2.html) — /apply designer reference
- `../CLAUDE.md` — repo rules
- `../AGENTS.md` — Next.js version warning
