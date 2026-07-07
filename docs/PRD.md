# Product Requirements Document (PRD) — LiLi M.D. Marketing Site

> Product-level intent for [lilimd.ai](https://lilimd.ai). Answers *why*
> this product exists, *who* it serves, and *what* success looks like.
> Complements the engineering-focused [`SRS.md`](./SRS.md).

---

## 1. Overview

**Product:** lilimd.ai — an invitation-only marketing + application website
for **The Private Club at LiLi M.D.**, the founding-10 physician cohort of
LiLi M.D.'s AI-native practice-operations platform.

**One-liner:** the private door to the private club — every visitor lands
on the `/apply` info form, provides their name / practice / license / EHR
+ TCPA consent, and is granted access. Once inside, they see the pitch and
can raise their hand to formally be considered as a founding member.

> **Note (2026-07-07):** the site previously had a second entry — a
> `/locked` password page for Mel's personal invites. That flow is
> **paused** (code preserved, unwired) per Ronnie + Mel. `/apply` is the
> sole gateway now. The password-page code stays in the repo so we can
> restore it if needed — see `src/proxy.ts` for the pause point.

### 1.1 Team & stakeholders

| Role | Owner | Responsibility |
|---|---|---|
| **CEO / founding sponsor** | Mel Interiano | Approves site direction, reviews doctor applications, manages personal invite list |
| **Chief Medical Officer / cofounder** | Dr. John Yee | Physician-side clinical positioning + domain vetting |
| **Product + engineering owner** | Nirali Mehta | Builds and maintains the site; single-maintainer engineering |
| **Website designer** | Ronnie | Owns the visual design system, page-level HTML references, and brand guidelines (see `docs/LiLi_MD_Brand_Guidelines.html`, page mockups in `docs/`, and asset library under `assets/`) |
| **Cloud-ops collaborator** | (external / delegated) | GCP infra provisioning, budgets, monitoring wiring via `lili-cloud-ops` Terraform |
| **Notification recipient** | `admin@lilisolutions.ai` | Inbox that receives every lead + doctor application |

---

## 2. Problem statement

Independent physicians building AI-native practices are a small,
hard-to-target audience. LiLi M.D. needs:

- A **credentialed, credible-feeling web presence** that says "this is a
  serious, exclusive opportunity" — not a broad marketing site.
- **Precise audience control** — the founding cohort is 10 doctors; visits
  from tire-kickers, competitors, or unrelated audiences are noise.
- **A qualification funnel** — collect enough information from prospective
  founding physicians to triage genuinely-interested candidates without
  requiring a demo call for every unqualified inquiry.
- **A private preview for investors** — the same site doubles as a pitch
  reference; it must present professionally to a non-physician audience.

---

## 3. Target users

| Segment | Description | How they arrive | What they need |
|---|---|---|---|
| **Personal invitee** | A physician Mel personally identified. | Direct link to `/apply` from Mel. | Fast entry, feels handpicked. (Password path *paused* — was the previous flow.) |
| **Outreach doctor** | A physician contacted via outbound campaign or referral. | Direct link to `/apply`. | Legible credibility signals, easy self-verification. |
| **Investor** | Non-physician evaluating the LiLi M.D. thesis. | Direct link to `/apply` from Nirali / Mel. | Professional presentation, understands the business model. |

Total addressable audience for this site is small (dozens to low hundreds).
Site is not built for scale.

---

## 4. Goals + non-goals

### 4.1 Goals

- **G1** — Present the LiLi M.D. value proposition (Work Less, Earn More;
  founding-member benefits; three-tier growth model) in a single
  scrollable page that reads well on mobile + desktop.
- **G2** — Gate access to the site behind the `/apply` info-form entry.
  (Previously there were two entries — the `/locked` password gate is
  paused as of 2026-07-07; code preserved for future restoration.)
- **G3** — Capture founding-member applications with enough structured
  information (name, practice, license, EHR, phone, email, referrer) that
  Mel can triage without needing a discovery call for every inquiry.
- **G4** — Notify Mel and the admin team by email when a new doctor
  applies or a landing-page lead is submitted.
- **G5** — Provide Mel with a lightweight admin tool to mint / list /
  revoke access codes without engineering involvement.

### 4.2 Non-goals (out of scope)

- Public marketing / SEO / search traffic (site is `noindex`).
- Payment collection or membership billing (handled outside the site).
- Live scheduling / calendar integration.
- Multi-language support.
- Persistent visitor accounts / password reset flows.
- Multi-tenant support — this site serves LiLi M.D. only.
- The product application itself (separate repo, separate infra).

---

## 5. User stories

### Personal invitee (Mel's list)

- **US-1** *(paused — was: click a password invite link and see the site
  immediately without a form).* Currently personal invitees go through
  `/apply` like everyone else. Restore the password flow to re-enable this.
- **US-2** As a physician viewing the site, I want to understand who the
  founding-10 are, what I get by joining, and how to formally apply — all
  from a single page.
- **US-3** As a physician ready to apply, I want to submit my practice
  details in a form that feels selective (not a generic contact form) and
  receive confirmation that my submission was received.

### Outreach doctor

- **US-4** As a physician who received an outreach email, I want to click
  the link, briefly demonstrate that I'm a licensed U.S. physician, and
  gain immediate access — no waiting for approval.
- **US-5** As a physician filling the info form, I want the form to feel
  respectful of my time (~90 seconds to complete), clearly labeled, and
  visually consistent with a premium clinical brand.
- **US-6** As a physician submitting the form, I want to see clearly that
  I'm agreeing to receive SMS/email communications and that my info is
  confidential.

### Investor

- **US-7** As an investor viewing the site, I want the presentation to be
  professional enough to reinforce the LiLi M.D. investment thesis — no
  broken links, no placeholder copy, mobile-quality equal to desktop.

### Admin (Mel)

- **US-8** As Mel, I want to mint a new access code for a named prospect
  without going through engineering — self-serve via `/admin`.
- **US-9** As Mel, I want to receive an email every time a doctor applies
  via `/apply` or submits the landing-page form — with enough detail to
  decide next steps from the inbox.
- **US-10** As Mel, I want to revoke a leaked or expired invite code
  without touching Firestore directly.

### Operator (Nirali)

- **US-11** As the site operator, I want structured logs for every
  submission so I can trace "why didn't Dr. X's application arrive" in
  under 5 minutes.
- **US-12** As the operator, I want uptime alerts routed to a Google Chat
  space so I know before customers do when the site is down.

---

## 6. Success metrics

### 6.1 Business

- **B-M1** — 10 qualified founding-physician applications received via
  `/apply` (target: within 60 days of gate launch).
- **B-M2** — Zero investor complaints about broken UX / typos / mobile
  layout issues on the site.
- **B-M3** — Every landing-page "Submit Your Practice" form submission
  reaches admin@lilisolutions.ai within 30 seconds of submission.

### 6.2 Product

- **P-M1** — `/apply` form completion rate ≥ 60% (started → submitted).
- **P-M2** — Median time from `/apply` submission to Mel opening the
  notification email ≤ 2 hours during business days.
- **P-M3** — Zero incidents where the CDN caches gated content across
  visitors (documented Cache-Control invariant holds).

### 6.3 Operational

- **O-M1** — 99.5% monthly uptime (App Hosting SLA is the ceiling).
- **O-M2** — Zero secrets committed to git.
- **O-M3** — Zero data-loss incidents involving `leads` or
  `doctor-applications`.

---

## 7. Feature requirements (business view)

Cross-referenced against the numbered SRS requirements for traceability.

| # | Feature | User stories | SRS mapping |
|---|---|---|---|
| **P1** | 13-section marketing landing page | US-2, US-7 | FR-1 |
| **P2** | Invitation-only access gate | US-1, US-4, US-11 | FR-2 |
| ~~**P3**~~ | ~~Password entry for personal invites~~ **PAUSED 2026-07-07** — code preserved but not wired. | US-1 | FR-3 |
| **P4** | Info-form entry — sole gateway now | US-4, US-5, US-6 | FR-4 |
| **P5** | TCPA consent capture (SMS/email opt-in) | US-6 | FR-4.2, FR-4.6, NFR-COMP-1 |
| **P6** | Landing-page "Submit Your Practice" lead capture | US-3 | FR-5 |
| **P7** | Admin tool for invite management | US-8, US-10 | FR-6 |
| **P8** | Email notifications for every submission | US-9, US-11 | FR-4.7, FR-5.3 |
| **P9** | Uptime + error monitoring | US-12 | FR-7, NFR-OBS-* |
| **P10** | Structured audit logging | US-11 | NFR-OBS-1..3 |

---

## 8. Constraints + assumptions

### 8.1 Constraints

- **C1 — Design fidelity.** All screens must match Ronnie's designer references
  in `docs/` (brand guide + page-level HTMLs). Copy edits allowed via
  `content.ts`; layout deviations require Ronnie's sign-off.
- **C2 — Budget.** $25/month operational cap enforced by budget alerts.
- **C3 — Security posture.** Site is invitation-only and never indexed by
  search engines while the founding cohort is being recruited.
- **C4 — Team scale.** Single-maintainer engineering with an ops
  collaborator. No dedicated QA. Automated testing is not yet in place.
- **C5 — Compliance.** TCPA consent must be captured server-side with
  timestamp + exact disclosure text. HIPAA does **not** apply to this
  site — no PHI is collected (only physician contact + practice info).

### 8.2 Assumptions

- Founding-10 is finite; site may sunset or transform once the cohort is
  complete.
- Firebase App Hosting SLA (~99.5%) is acceptable — no multi-region
  redundancy needed.
- Physicians will complete `/apply` on desktop or a modern smartphone —
  no legacy-browser support.
- SMTP notifications via Gmail Workspace are sufficient; no need for a
  transactional-email vendor at this volume.

---

## 9. Milestones + timeline

| Milestone | Deliverable | Status |
|---|---|---|
| **M1 — MVP landing page** | 13 sections rendered at pixel parity with designer's Canva | ✅ Complete |
| **M2 — Access gate v1** | `/locked` password gate + admin tool + invite CLI | ✅ Complete |
| **M3 — Production deploy** | App Hosting live at lilimd.ai over HTTPS | ✅ Complete |
| **M4 — /apply doctor gate** | Info-form entry with TCPA consent + hardening | ✅ Complete |
| **M5 — Observability layer** | Structured logging + `/api/health` + monitoring alerts | ✅ Complete |
| **M6 — Instant/manual mode decision** | Mel confirms `/apply` submissions grant access immediately or require review | ⏳ Pending Mel |
| **M7 — First 10 founding applications** | 10 qualified `/apply` submissions received | ⏳ In progress |
| **M8 — www subdomain** | `www.lilimd.ai` → `lilimd.ai` redirect | 🅾 Deferred (optional) |
| **M9 — Automated tests** | Basic E2E coverage for gate + form flows | 🅾 Deferred (post-founding-10) |

---

## 10. Risks + mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Site indexed by search engines despite `noindex` | Low | High (invitation-only broken) | Cache-Control invariant + `noindex` in robots.txt; check periodically |
| Gate defeated by curl attack on `/apply` | Medium | Medium (site no longer invite-only, spam Firestore + inbox) | Rate limits, XFF handling, EHR whitelist, consent required. Ultimately relies on the low-value target profile — a determined attacker can always self-verify |
| Firestore outage during `/apply` | Low | Medium (doctor sees error) | Endpoint returns 503, log alerts fire, doctor retries when back |
| SMTP outage | Low | Low (Mel loses one notification email) | Firestore record is the audit trail |
| Designer sends v4 asset conflicting with brand guide | Medium | Low | Reconciliation caveat documented in playbook §2 — ask before deviating |
| Nirali unavailable + Mel needs a new code | Low | Low | `/admin` self-serve tool + CLI documented in runbook |

---

## 10.5 Recent design decisions (Ronnie + Mel, 2026-07-07)

- **Password gate paused.** `/locked` is no longer wired into the visitor
  flow — `/apply` is the sole gateway. Files are preserved in the repo so
  the flow can be restored later without a rebuild. See `src/proxy.ts`
  block comment for the pause point.
- **Landing-page CTA is changing** — currently a full "Submit Your Practice
  for Qualification" form. Ronnie is sending updated design where this
  becomes a simple **"Click to be considered"** button (since `/apply`
  already captures the physician's info at the gate). Implementation
  waits for Ronnie's design; the form stays as-is in the interim.
- **Two email alerts** confirmed:
  1. **Gate entry** (`/apply` submit) — already firing with full detail.
  2. **"Click to be considered"** button — new alert to be wired when the
     button lands.

## 11. Open questions

- **Q1 (RESOLVED 2026-07-06)** — Instant vs Manual review for `/apply`?
  **Mel: A (Instant).** Doctor submits the form → immediate access.
  Implemented in `src/app/api/apply/route.ts` (setSession + 7-day cookie).
- **Q2 (RESOLVED 2026-07-06)** — When does Mel get notified?
  **Mel: C (Both).** Every `/apply` gate entry produces a short one-liner
  email (`[Gate] <Name> · <Practice>`); every landing-page "Submit Your
  Practice" form submission produces the full detailed email. Landing form
  also captures Medical License / EHR / Referred By so both forms are
  consistent.
- **Q3 (Deferred)** — Sunset plan: when the 10 founding members are secured,
  does this site go offline, transform into a member portal, or stay as an
  investor reference? Deferred until milestone M7.

**Ronnie's note (2026-07-06):** the `/apply` page is *publicly accessible*
(anyone with the URL can visit it) but is shared only via personal outreach
links — the site itself never navigates to `/apply` and it stays out of the
public nav. This is by design: the gate captures who came in, but the URL
isn't a secret. If we later want per-outreach attribution (which doctor
came from which campaign), we'd add a query-param token like
`/apply?ref=<campaign-code>`; not scoped for MVP.

---

## 12. Related documents

- [`SRS.md`](./SRS.md) — engineering requirements + acceptance criteria
- [`WEBSITE-PLAYBOOK.md`](./WEBSITE-PLAYBOOK.md) — reusable recipe for future sites
- [`LiLi_MD_Brand_Guidelines.html`](./LiLi_MD_Brand_Guidelines.html) — canonical visual spec
- [`lili-md-access-gate-page2.html`](./lili-md-access-gate-page2.html) — `/apply` designer reference

---

## 13. Approval + change history

| Version | Date | Change | Approver |
|---|---|---|---|
| 1.0 | 2026-07-06 | Initial PRD | Nirali (pending Mel/investor review) |
