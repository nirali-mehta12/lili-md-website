# LiLi M.D. Marketing Site — Architecture & Specs

> **Scope:** the production system serving [lilimd.ai](https://lilimd.ai) —
> a one-page marketing / lead-capture site for LiLi M.D. ("The Private Club"),
> gated to invitation-only visitors. This doc describes the runtime topology,
> data model, security model, and operational runbook.
>
> **For the reusable recipe** ("how do I build another site like this from scratch"),
> see [`WEBSITE-PLAYBOOK.md`](./WEBSITE-PLAYBOOK.md).
> This doc describes what already exists in production.

---

## 1. System overview

lilimd.ai is a single-page Next.js 16 app served by Firebase App Hosting on
GCP. Every incoming request passes through a proxy (Next.js middleware) that
either **shows the site** to authenticated visitors or **redirects to a lock
screen** to unauthenticated ones. There are two entry points into the site:

- `/locked` — password gate for hand-picked personal invites (Mel's list)
- `/apply` — info-form gate for outreach doctors (their info is captured + admin
  is notified before they're let in)

Both hand out the same signed session cookie, so once inside, the user experience
is identical. The landing page then invites the doctor to formally submit their
practice for the founding-10 cohort via a separate contact form.

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
   ┌──────────┐         ┌────────────┐      ┌─────────────┐
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

---

## 2. Deployment topology

| Layer | Service | Location | Notes |
|---|---|---|---|
| **Runtime** | Firebase App Hosting | GCP project `lili-md-website`, region `us-east4` | Backed by Cloud Run under the hood |
| **Data** | Cloud Firestore (Native) | `(default)` database, region `nam5` | Rules deployed via `firestore.rules` — no public client writes |
| **Secrets** | GCP Secret Manager | `lili-md-website` | Three secrets: `ACCESS_SESSION_SECRET`, `ADMIN_SECRET`, `SMTP_PASS` |
| **Email** | Gmail (Google Workspace) SMTP | `smtp.gmail.com:465` | Sender: `nirali@lilisolutions.ai`, receiver: `admin@lilisolutions.ai` |
| **Domain / DNS** | GoDaddy (John Yee's account, delegated) | Apex `lilimd.ai` | `A @ 35.219.200.201` + FAH claim TXT + ACME challenge CNAME |
| **TLS** | ACME via Google Certificate Manager | Auto-renewed | Certificate status `ACTIVE` |
| **Repo** | GitHub `nirali-mehta12/lili-md-website` | main branch auto-deploys | Push → App Hosting build → rollout ~5–10 min |
| **Monitoring** | Cloud Monitoring + `lili-cloud-ops` Terraform | Alerts → Google Chat cloud-ops space | Budget, deploy events, SA-key creation, Cloud Run error rate, uptime, cert expiry |
| **Billing** | GCP billing account `0128BE-2AEBB5-25F4D4` (temporary) | $25/mo budget cap | Migrating to `01066A` once quota lifted |

### Runtime identity
- **Application Default Credentials (keyless)** everywhere.
  - Local dev: `gcloud auth application-default login` (one time).
  - App Hosting: automatic — the runtime service account
    `firebase-app-hosting-compute@lili-md-website.iam.gserviceaccount.com`
    is granted `roles/datastore.user` on the project.
- **No downloadable service-account keys** — org policy blocks them.

---

## 3. Authentication & access control

There are **two independent authentication surfaces**: the visitor gate and the
admin tool. Each has its own credential material.

### 3.1 Visitor gate — `proxy.ts`

Toggle: `ACCESS_GATE_ENABLED="true"`.

```
┌───────────────┐
│  Any request  │
└───────┬───────┘
        ▼
┌────────────────────────┐        yes
│ ACCESS_GATE_ENABLED?   │──────────────→  Pass through (public site)
└───────┬────────────────┘
        │ no
        ▼
┌────────────────────────┐
│ Path is /locked,       │        yes
│ /apply, or /admin/*?   │──────────────→  Pass through (self-authed pages)
└───────┬────────────────┘
        │ no
        ▼
┌────────────────────────┐        yes
│ Valid session cookie?  │──────────────→  Pass through, no-store headers
└───────┬────────────────┘
        │ no
        ▼
┌────────────────────────┐
│ ?c=CODE query param?   │──────yes─────→  /api/access?c=CODE (validate + set cookie)
└───────┬────────────────┘
        │ no
        ▼
   /locked page (URL preserved)
```

- **Session cookie:** `lili_access`, HMAC-SHA256 signed with `ACCESS_SESSION_SECRET`, 7-day lifetime, HttpOnly, Secure, SameSite=Lax.
- **Codes:** stored as SHA-256 hashes in Firestore `invites`. Never plaintext at rest.
- **Per-person accounting:** each invite has `label`, `codeHash`, `expiresAt`, `revoked`, `accessCount`, `lastAccessAt` — a leaked code is attributable + killable on its own.
- **Two entry paths mint the session cookie:**
  1. `/locked` → `/api/access` (POST code or GET `?c=`)
  2. `/apply` → `/api/apply` (POST doctor info form)

### 3.2 Admin tool — `/admin`

Independent password gate (`ADMIN_SECRET`), separate from the visitor session.
Excluded from the visitor gate entirely. Mel uses it to:
- Create a new invite code for a named person
- List existing invites + access counts
- Revoke an invite

CLI alternative: `npm run smoke-test` (creates a 30-day smoke-test code) or
`node scripts/invite.mjs create|list|revoke`.

### 3.3 Cache-Control invariant (critical gotcha)

The gated home page (`/`) MUST be `export const dynamic = "force-dynamic"` and
the proxy sets `Cache-Control: private, no-store, must-revalidate` on gated
responses. If either is missed, the CDN would serve one visitor's rendered
output (locked or unlocked) to every subsequent visitor, silently bypassing
the gate. See [`memory/project_access_gate.md`](../../.claude/projects/-Users-niralimehta-lili-md-website/memory/project_access_gate.md).

---

## 4. Data model (Firestore)

| Collection | Purpose | Written by | Read by |
|---|---|---|---|
| `invites` | Hashed access codes for the gate | `/api/access` (implicitly via `createInvite`), `/api/apply`, `scripts/invite.mjs`, `/admin` | `/api/access` (`verifyCode`), `/admin` |
| `leads` | Landing-page "Submit Your Practice" form submissions | `/api/submit` | Manual review (Firebase console); email notification is the primary alert |
| `doctor-applications` | `/apply` gate submissions from outreach doctors | `/api/apply` | Manual review; email notification is the primary alert |
| `mail` (unused) | Was intended for the Firebase Trigger Email extension — we ended up using direct SMTP instead | — | — |

### `invites` document shape

```ts
{
  label: string;                     // "Dr. Jane Smith · Bay Family Med"
  codeHash: string;                  // SHA-256 of the plaintext code
  createdAt: string;                 // ISO
  expiresAt: string | null;          // ISO or null (no expiry)
  revoked: boolean;
  accessCount: number;               // incremented on each successful use
  lastAccessAt: string | null;
  lastAccessIp?: string;
}
```

### `leads` document shape (landing-page submissions)

```ts
{
  name, practiceName, email, phone, website, socials, message,
  createdAt, ip,
}
```

### `doctor-applications` document shape (/apply submissions)

```ts
{
  firstName, lastName, fullName, practiceName, website, phone, email,
  licenseNo, ehr, referredBy,
  consent: true,                     // consent flag + timestamp (TCPA audit trail)
  consentAt: string,
  createdAt: string,
  ip: string,
  cid: string,                       // correlation ID linking to log lines
}
```

### Security rules

`firestore.rules` denies all public client reads/writes. Every write goes
through a server-side API route using Firebase Admin (keyless via ADC).

---

## 5. API endpoints

All routes live under `src/app/api/`. Every route:
- Uses `export const dynamic = "force-dynamic"` (no static caching of dynamic responses).
- Sets response `Cache-Control: no-store` implicitly via the gated-response path.
- Rate-limits per client IP (best-effort, per-instance).
- Structured-logs every code path via `@/lib/log`.

| Route | Method | Purpose |
|---|---|---|
| `/api/access` | POST `{code}` or GET `?c=&next=` | Validate a password gate code; on success set the session cookie |
| `/api/apply` | POST `{firstName, lastName, ...consent}` | Doctor-info gate: validate, persist, notify admin, set cookie |
| `/api/submit` | POST `{name, email, ...}` | Landing-page "Submit Your Practice" form: persist a lead + notify admin |
| `/api/admin/login` | POST `{password}` | Admin tool login (separate from visitor gate) |
| `/api/admin/invite/*` | POST | Create / list / revoke invites via the admin UI |
| `/api/health` | GET `[?depth=deep]` | Uptime + dependency health probe. Deep check hits Firestore |

### Rate-limit policy

Every user-facing POST uses the same shape:

- Sliding 10-minute window per client IP.
- Max attempts vary per endpoint (`/api/apply` = 6, `/api/access` = 10, `/api/admin/login` = stricter).
- State is in-memory per Cloud Run instance. Effective global limit is
  `max × N instances` during scale-out. Acceptable for a marketing site.

### `/api/apply` specifically (INSTANT mode)

1. Rate-limit check → 429 if exceeded.
2. Type-guard body → 400 if not a plain object.
3. Coerce + length-cap each field (200 chars text, 500 chars URL) → 400 if any oversize.
4. Required-field + email format + EHR whitelist + consent flag → 400 on any failure.
5. Session dedup — if already authenticated, return `{ok:true, alreadyAuthenticated:true}` without a fresh invite.
6. Firestore write to `doctor-applications` (best-effort — logs on failure, continues).
7. Mint an invite via `createInvite` → 503 if Firestore is unreachable at this step.
8. Send admin notification email (AWAITED — must complete before response returns).
9. Sign + set the session cookie → 503 if `ACCESS_SESSION_SECRET` is unset.

**Manual-mode switch** (when Mel decides): skip step 9's `setSession()` and
return `{ok:true, pending:true}`; the client already understands this shape and
shows "thanks, we'll be in touch." The invite code is captured in the admin
email so Mel can share the one-click link personally.

---

## 6. Email notifications

Two notification types, one SMTP transport:

| Event | Trigger | Template | Route |
|---|---|---|---|
| **New lead** | Landing form `/api/submit` | `sendLeadNotification` | Awaited before response returns |
| **New doctor application** | `/api/apply` | `sendDoctorApplicationNotification` | Awaited before response returns |

### Transport

- Direct SMTP via `nodemailer` — no Firebase Trigger Email extension.
- `smtp.gmail.com:465` (SSL). App Password on `nirali@lilisolutions.ai`.
- Sender: `nirali@lilisolutions.ai` → Receiver: `admin@lilisolutions.ai`.
- If SMTP env vars are unset, `sendXxxNotification()` is a no-op (returns `false`)
  — the form still stores the lead but no email fires.

### Subject-line hardening

Both templates run `stripHeaderInjection()` on user-supplied strings before
interpolating into the `Subject` header, preventing CRLF injection that could
smuggle a `Bcc:` header past nodemailer's own sanitization.

---

## 7. Observability & monitoring

### 7.1 Application logs (Cloud Logging)

All server-side logs use the structured `log.info/warn/error/critical` helper
in `@/lib/log`. Each line is a JSON object like:

```json
{
  "severity": "INFO",
  "event": "apply.request_received",
  "ts": "2026-07-06T21:14:00.000Z",
  "cid": "a3f9c1b207d5",
  "ip": "1.2.3.4",
  "email": "dr@example.com"
}
```

- **`severity`** is recognized by Cloud Logging and drives filtering + alerting.
- **`event`** is a stable kebab-case identifier for log-based metrics + alerts.
- **`cid` (correlation ID)** ties multiple log lines from one submission together.
- **`ERROR` and `CRITICAL` severity** are auto-detected by Cloud Error Reporting
  and become an incident visible in the Firebase / GCP console.

### 7.2 Uptime + infra alerts (`lili-cloud-ops`)

Wired via Terraform in `lili-cloud-ops/infra/main.tf` under `monitored_projects`.
Alerts route to the cloud-ops Google Chat space.

- **Budget alerts** at 50 / 80 / 100% of the $25/mo cap.
- **Deploy events** — every App Hosting rollout is announced.
- **SA-key creation detection** — flags if anyone attempts to bypass keyless.
- **Cloud Run error-rate alert** — spikes above baseline page cloud-ops.
- **Uptime probe** — `/api/health` hit every N minutes.
- **Cert near-expiry alert** — reminds before ACME renewal window.

### 7.3 Cost-catalog entry

`ops/` §5.8 lists `lili-md-website` under tier
**"Customer-facing marketing / non-HIPAA prod"** at $25/mo budget.

---

## 8. CI/CD

- Push to `main` → App Hosting auto-builds + rolls out (~5–10 min end to end).
- All runtime config lives in `apphosting.yaml`. Secrets are referenced by name;
  values come from Secret Manager at deploy time.
- No branch protection currently (small team, single maintainer).
- **Rollback:** re-push the previous commit, or use the App Hosting console's
  "revert to previous rollout" button.
- **Preview builds:** not enabled. Every push to `main` is a real deploy.

---

## 9. Secrets management

Three secrets in GCP Secret Manager (project `lili-md-website`), granted to the
App Hosting runtime SA via
`firebase apphosting:secrets:grantaccess <NAME> --backend lili-md-website`:

| Name | Purpose |
|---|---|
| `ACCESS_SESSION_SECRET` | HMAC-SHA256 key for signing `lili_access` session cookies |
| `ADMIN_SECRET` | Password for the `/admin` invite tool |
| `SMTP_PASS` | Gmail app password for `nirali@lilisolutions.ai` |

Non-secret env vars are set inline in `apphosting.yaml`:
- `FIREBASE_PROJECT_ID`, `GOOGLE_CLOUD_PROJECT`, `NOTIFY_EMAIL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`
- `ACCESS_GATE_ENABLED`

---

## 10. DNS + TLS

- **Registrar:** GoDaddy, under John Yee's account (Nirali is a delegate).
- **Apex (`lilimd.ai`):** live.
  - `A @ 35.219.200.201` — App Hosting IP (replaced GoDaddy's parked WebsiteBuilder record)
  - `TXT @ fah-claim=…` — App Hosting ownership claim
  - `CNAME _acme-challenge_<id> <id>.authorize.certificatemanager.goog.` — ACME validation
- **`www.lilimd.ai`:** returns 404 (not wired). To enable: add `www.lilimd.ai` as
  a custom domain in App Hosting Console → Domains, and add the matching CNAME
  in GoDaddy.
- **`robots.txt`:** `noindex` — invitation-only site intentionally excluded
  from search engines.

---

## 11. Failure modes & degraded operation

Documenting how the app behaves when a dependency is down. This informs the
runbook + tells operators what to expect.

| Failure | User impact | System behavior | Fix |
|---|---|---|---|
| **Firestore unreachable** on `/api/submit` | Form still returns 200; lead is not stored | `getDb()` returns null → placeholder mode; email still fires; log line `[submit] placeholder mode` (should be added) | Check ADC + firestore rules deployment |
| **Firestore unreachable** on `/api/apply` | 503 with "Please try again in a minute" | `createInvite` returns null → route returns 503 without setting cookie | Same as above |
| **SMTP unreachable** on any form | 200 to user; admin notification lost | `sendMail` fails; caught in try/catch; log line `[email] send failed`; Firestore record is the audit trail | Check SMTP env vars + Gmail app-password validity |
| **`ACCESS_SESSION_SECRET` unset** | User submits, gets 503 after Firestore write + email have fired | `signSession` throws; caught; `log.critical` fires (Cloud Error Reporting picks up) | Re-add secret to Secret Manager + grant access to backend |
| **Rate limit hit** | 429 "too many attempts, wait a few minutes" | Per-IP window; state resets on cold start | Genuine attack: check Cloud Logging for `apply.rate_limited` frequency |
| **CDN cache leak** (see §3.3) | Wrong visitor sees another visitor's page | Should be blocked by `force-dynamic` + `Cache-Control: private, no-store` | Verify both are set on all gated routes |

### Monitoring alerts that would fire

- `apply.firestore_write_failed` at rate > 0.1/min → Cloud Run error-rate alert
- `apply.session_sign_failed` (CRITICAL) → Error Reporting incident
- Budget threshold crossed → Google Chat post
- Uptime probe failure → Google Chat + email

---

## 12. Runbook — common operations

### Rotate the smoke-test invite code
```sh
npm run smoke-test
# Copy the plaintext code that's printed. It's shown ONCE.
```

### Add a new invite for a named person
```sh
node scripts/invite.mjs create "Dr. Jane Smith" 30
# 30 = days until expiry; omit for no expiry
```

### Revoke an invite
```sh
node scripts/invite.mjs list
node scripts/invite.mjs revoke <doc-id>
```

### Enable/disable the gate
Edit `apphosting.yaml`:
```yaml
env:
  - name: ACCESS_GATE_ENABLED
    value: "true"   # or "false"
```
Commit + push → App Hosting rebuilds → takes effect in ~5–10 min.

### Switch `/apply` from INSTANT to MANUAL review
1. In `src/app/api/apply/route.ts`, comment out `setSession(...)` and change the response to `{ok:true, pending:true}`.
2. In `src/lib/email.ts` `sendDoctorApplicationNotification`, render `inviteCode` visibly in the HTML + text (so Mel can share the link).
3. In `src/app/apply/page.tsx`, update the success screen text (or branch on `pending`).
4. Commit + push.

### Investigate a "form submitted but nothing arrived" report
1. Open Cloud Logging for `lili-md-website` App Hosting service.
2. Filter: `jsonPayload.event =~ "^apply\\."` (or `"^submit\\."`)
3. Search by user's email or approximate timestamp for the matching `cid`.
4. Follow the `cid` across `request_received` → `application_stored` → `email_sent` → `session_issued`.
5. Missing hops indicate where it broke.

### Check current billing spend
Firebase Console → Project `lili-md-website` → Settings → Usage and Billing.

---

## 13. Related documents

- [`WEBSITE-PLAYBOOK.md`](./WEBSITE-PLAYBOOK.md) — reusable recipe for building future sites
- [`LiLi_MD_Brand_Guidelines.html`](./LiLi_MD_Brand_Guidelines.html) — canonical palette + typography
- [`lili-md-access-gate-page2.html`](./lili-md-access-gate-page2.html) — designer HTML reference for `/apply`
- `../CLAUDE.md` — repo-level rules for AI + human contributors
- `../AGENTS.md` — Next.js version warning

## 14. Owner + escalation

- **Primary owner:** Nirali (`nirali@lilisolutions.ai`)
- **Cloud-ops collaborator:** provisions infra + monitors budgets. Repo: `lili-cloud-ops`.
- **Escalation for auth secrets:** re-derive `ACCESS_SESSION_SECRET` from Secret Manager;
  never store outside GCP.
- **Escalation for DNS:** John Yee's GoDaddy account (Nirali is a delegate).

---

*Last updated: this doc lives alongside the code — update it when infrastructure changes.*
