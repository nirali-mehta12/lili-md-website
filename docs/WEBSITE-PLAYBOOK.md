# Marketing-Site Build Playbook

> A reference for building **future** marketing / lead-capture sites in the
> same shape as **lilimd.ai**. Captures the stack, conventions, infra wiring,
> and the asset checklist needed from a designer so the next site can ship
> in days, not weeks.
>
> Use this when you say *"build me another one-page marketing site"* — point
> me at this doc and I'll know the recipe.

---

## 1. What this site is (lilimd.ai — the reference instance)

- **Audience:** invitation-only — prospective founding-member physicians + investors.
- **Goal:** lead capture. Visitors submit "Submit Your Practice" form → stored
  in Firestore + emailed to `admin@lilisolutions.ai`.
- **Shape:** single-page, 13 sections, mobile-first responsive, scroll-reveal
  animation, gold-on-wine luxury aesthetic.
- **Built from:** a fixed Canva design (only content was expected to change after launch).

If your next site fits that shape — single page, designer-led aesthetic, form
submissions, custom domain — the recipe in this doc applies.

---

## 2. Designer asset checklist (ask BEFORE I start coding)

The faster I get these, the faster the site ships. Every gap is a placeholder
I have to swap later.

### Required
- [ ] **Layout reference** — Canva PDF / Figma file / Sketch / pinned screenshots.
      One source of truth for the visual design.
- [ ] **Color palette** — exact hex values for primary, accent, background,
      text, divider/border colors. If there's a gradient (e.g. gold gradient
      on buttons), give the exact stops.
- [ ] **Fonts** — names + weights. Google Fonts is easiest. Otherwise hand me
      `.woff2` files (regular, italic, bold variants).
- [ ] **Logo** — SVG preferred. PNG with transparency as fallback (2x density).
- [ ] **Hero image / background** — JPG or WebP. High-res (≥2x intended display).
- [ ] **Section-by-section content** — heading, subheading, body copy for each
      block. A Google Doc with one tab per section works.
- [ ] **Form fields** — what fields, which are required, where do submissions go.

### Strongly preferred
- [ ] **Icons / decorative shapes** — SVG (lines, diamonds, ornamental flourishes).
      I can render simple ones in code, but bespoke ones need to be supplied.
- [ ] **Pre-cropped images** — square/portrait/landscape variants of any photo
      that needs to look right at multiple breakpoints. Saves us from
      `object-fit: cover` looking weird on mobile.
- [ ] **Brand voice doc** — tone, sample copy, what NOT to say. Helps me write
      placeholder copy that matches when content is missing.

### Optional but useful
- [ ] **Favicon** — 32×32 or 64×64 PNG/ICO.
- [ ] **OG image** — 1200×630 PNG/JPG for social-share previews.
- [ ] **Domain** — final URL so SEO meta + canonical tags can be set on day 1.
- [ ] **Notification email + SMTP credentials** — where form submissions go.

### Asset versioning & folder convention

Designers iterate. Expect three or four revisions of the hero alone, with
inconsistent filenames (`heroV2.png`, `hero-image-3.png`, `hero image 4.png`).
Three rules that prevent pain:

- **Stage everything in `assets/`** at the repo root, grouped by section
  (`assets/1 Hero/`, `assets/4 Problem/`, …). This folder is **gitignored**
  on the lilimd.ai precedent — designer source files don't ship to production
  and don't bloat the repo.
- **Keep every version** the designer sends. When they say "go back to V2"
  three days later (and they will), you need V2 still on disk. Never overwrite.
- **Only the chosen version gets copied into `public/`** with a stable
  filename (e.g. always `public/hero.png` regardless of which V landed).
  Code references the stable name — swaps are a one-line `cp` + a width/height
  update in the Next/Image component if intrinsic dimensions differ. No JSX
  churn across revisions.

---

## 3. Decisions to make upfront (these block setup)

| Decision | Why it matters |
|---|---|
| **Final domain** | Sets meta tags, OG canonical URL, App Hosting domain wiring |
| **Hosting target** | Defaults to Firebase App Hosting; alternatives are Vercel, Netlify |
| **Form persistence** | Firestore (cloud + searchable) vs Resend-only (email-only, no DB) |
| **Email sender** | Dedicated mailbox (`noreply@yourdomain`) vs personal mailbox |
| **Analytics** | None? GA4? Plausible? Decide before launch so the snippet is in from day 1 |
| **Auth required?** | Public site (default) vs auth-gated (changes Firestore rules entirely) |
| **Multi-language?** | If yes, change `src/lib/content.ts` strategy from flat object to locale-keyed |

---

## 4. Standard stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | SSR + image optimization + edge-friendly |
| UI | **React 19 + TypeScript** | Industry default; typecheck catches issues early |
| Styling | **Tailwind CSS v4** | Theme tokens in `@theme` block (NOT `tailwind.config.js`); responsive utility classes |
| Persistence | **Firebase Admin (Firestore)** | Keyless ADC auth; serverless; cheap; integrates with App Hosting |
| Email | **Direct SMTP via nodemailer** | Simpler than Firebase email extension; works with Gmail/Workspace App Passwords or Resend |
| Animation | **Custom `<Reveal>` (IntersectionObserver + CSS)** | Zero dependencies; respects `prefers-reduced-motion` |
| Host | **Firebase App Hosting** | Auto-deploy on push to `main`; ADC built-in; integrates with Firestore + custom domain |
| Monitoring | **lili-cloud-ops Terraform** | Budget alerts, deploy events, SA-key creation, error rate; per-project entry in `monitored_projects` |

---

## 5. Repo conventions (so I always know where things go)

```
src/
├── app/
│   ├── layout.tsx        # Fonts (next/font/google) + page metadata
│   ├── globals.css       # Design tokens: colors, gradients, animations (@theme block)
│   ├── page.tsx          # Composes all sections in order
│   └── api/
│       └── submit/route.ts  # Form handler (honeypot + rate limit + validate + write + email)
├── components/
│   ├── Nav.tsx, Footer.tsx
│   ├── sections/         # One file per page section (Hero, Problem, ...)
│   └── ui/               # Shared: Section, Button, Reveal, Placeholder, Logo
└── lib/
    ├── content.ts        # ALL site copy. Edit text HERE, never in JSX.
    ├── firebase.ts       # Lazy Admin init; returns null in "placeholder mode" pre-config
    └── email.ts          # nodemailer wrapper; best-effort send
public/                   # All bundled images live here (referenced by `/filename.png` paths)
assets/                   # Source designer files. Don't deploy these — copy into public/ as needed.
firestore.rules           # Lock: no public client writes. Only Admin SDK from server.
.env.local                # Gitignored. Local credentials only.
.env.example              # Documents required env vars.
```

### Hard rules
- **All copy lives in `src/lib/content.ts`.** Never hardcode user-facing text in JSX.
  This makes copy edits a 1-file change reviewable in a diff.
- **Every top-level `<section>` gets a stable `id`.** Pattern: `id="home"`,
  `id="about"`, `id="tiers"`, `id="growth"`, `id="contact"`. Two reasons:
  (1) header nav anchors target them (`<a href="#tiers">`), and
  (2) `npm run screenshot --section=#id` clips just that section for fast
  visual self-verification during UI iteration. Add ids from day 1 — backfilling
  later means re-running every screenshot you took.
- **Server-only code (`firebase.ts`, `email.ts`, API routes) must NEVER be imported
  into client components.** Marker: top of those files explicitly states "server only."
- **Decorative shapes drawn in code** (thin lines, dots, diamonds, gradients) —
  only detailed bespoke ornaments come in as SVG. Reduces asset shuttling.
- **Mobile-first.** Default styles target phone; `sm:` / `md:` / `lg:` add columns
  and bigger spacing. Never write `lg:` first and override down.

---

## 6. Build workflow (rough timing — 3–5 days from kickoff)

| Day | Work | Output |
|---|---|---|
| **0 — Kickoff** | I read the design + asset checklist. Surface gaps. Ask clarifying questions. Confirm stack. | Decisions table filled. Designer asset list confirmed. |
| **1 — Scaffold + tokens** | `npx create-next-app`, Tailwind v4 install. Drop in fonts. Encode color palette + gradients in `globals.css @theme`. Logo + favicon. | Boilerplate page renders, fonts load, brand colors apply. |
| **2 — Sections** | Build each section in `src/components/sections/`. Use `<Placeholder/>` for any missing image. Mobile-first responsive throughout. | All sections render; layout matches design at every breakpoint. |
| **3 — Form + API + Firestore** | `SubmitForm.tsx` (client) + `/api/submit/route.ts` (server). Honeypot + rate limit. Firestore writes. SMTP sender. | Form submissions land in Firestore `leads` + email arrives at NOTIFY_EMAIL. |
| **4 — Asset swap + polish** | Swap every `<Placeholder/>` for real designer images. Mobile polish pass. Reveal animations. | Pixel-close to designer file. Ready for review. |
| **5 — Deploy + domain** | Firebase project, Firestore rules, App Hosting backend, env vars, IAM grants, custom domain attach + DNS. | Live at production URL. Submissions stored + emailed. |

> Slack/Async iteration adds 1–2 days. Designer revisions (v2 hero, color tweaks)
> are usually 30 min each — same-day turnaround if you ping me.

---

## 7. Infrastructure setup (one-time per site, per project)

**Cloud-ops owns** project creation, billing-account linking, monitoring,
mailbox provisioning, Secret Manager. **You own** App Hosting connect, env vars,
runtime-SA IAM grant, smoke test, custom domain attach. See
[`memory/reference_ops_collaborator.md`](../../.claude/projects/-Users-niralimehta-lili-md-website/memory/reference_ops_collaborator.md).

### What gets created (in order)
1. **Firebase project** (separate from the product app — keeps marketing isolated).
2. **Firestore database** (default, native mode) + locked-down rules.
3. **Billing account linkage + Blaze plan** — required for App Hosting + outbound SMTP.
4. **App Hosting backend** — connect GitHub repo, branch `main`, auto-deploy.
5. **Backend env vars** — `FIREBASE_PROJECT_ID`, `GOOGLE_CLOUD_PROJECT`,
   `NOTIFY_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.
6. **Runtime SA IAM grant** — `roles/datastore.user` on
   `firebase-app-hosting-compute@<project>.iam.gserviceaccount.com`.
7. **Custom domain** — App Hosting → Domains → add → DNS records to registrar.
8. **Per-project monitoring entry** in `lili-cloud-ops/infra/main.tf:monitored_projects`
   (budget alerts, deploy events, SA-key creation, Cloud Run error rate).

### Auth strategy
- **Keyless (ADC) everywhere.** Org policy blocks downloadable SA keys, so:
  - Local: `gcloud auth application-default login` once.
  - App Hosting: ADC is automatic from the runtime service account.
- `.env.local` only needs `FIREBASE_PROJECT_ID` + `GOOGLE_CLOUD_PROJECT` for ADC.

---

## 8. Going-live checklist

- [ ] Production build passes (`npm run build`)
- [ ] All placeholders swapped for real assets
- [ ] App Hosting backend connected to repo
- [ ] All env vars set on backend
- [ ] Runtime SA has `roles/datastore.user`
- [ ] Firestore security rules deployed
- [ ] Smoke test: submit form on `*.hosted.app` URL → doc in `leads` + email arrives
- [ ] Custom domain attached + DNS propagated + cert provisioned
- [ ] OG image + meta description + favicon set
- [ ] Hand to cloud-ops: public URL + runtime SA email (so they activate uptime + cert-expiry alerts)

---

## 9. Tools and skills used

| Tool / Skill | When | Notes |
|---|---|---|
| **Claude Code (CLI)** | Throughout | Drives the build via this terminal session |
| **`frontend-design` skill** | When NO designer file exists | "Create distinctive, production-grade frontends." Use for sites without a fixed design. NOT used for lilimd.ai (we had Canva). |
| **TypeScript `tsc --noEmit`** | After every edit | Catches type errors before build |
| **`npm run dev`** | Local preview | Chrome DevTools device mode for mobile preview |
| **Firebase MCP server** | When connected | Project state, App Hosting backends, Firestore queries. Falls back to `firebase-tools` CLI if disconnected. |
| **`firebase-tools` CLI** | Deploy ops + auth | `npx -y firebase-tools@latest <cmd>` always uses latest |
| **`gcloud` CLI** | IAM grants + project introspection | Authenticated as `nirali@lilisolutions.ai` |
| **`lili-cloud-ops` repo** | Monitoring + budgets | Per-project entry in `infra/main.tf` |
| **Playwright (`scripts/check-mobile.mjs`)** | UI self-verification on every change | Drives headless Chromium at 5 preset viewports (android / iphone14 / iphone14pro / ipadmini / desktop) against the dev server. Flags: `--section=#id` (clip one section), `--viewport-only` (single-screen), `--code=XXXX` (pass an access-gate code). Auto-sets `prefers-reduced-motion: reduce` so `<Reveal/>` animations don't hide content in screenshots. Run via `npm run screenshot`. Output PNGs go to `scripts/screenshots/` (gitignored). |

---

## 10. Prompt template for the next site

Paste this in a fresh Claude Code session, fill the brackets, and we're off:

```
Build a one-page marketing site for [PRODUCT NAME]. It's [LEAD-CAPTURE /
NEWSLETTER / WAITLIST], targeting [AUDIENCE].

Reference the playbook at docs/WEBSITE-PLAYBOOK.md.

Inputs:
- Design: [LINK TO CANVA / FIGMA / PDF]
- Assets folder: [PATH]
- Colors: [PRIMARY HEX, ACCENT HEX, BG HEX] + gradient stops if any
- Fonts: [GOOGLE FONT NAMES, or local .woff2 path]
- Logo: [PATH]
- Domain: [PRODUCTION URL]

Sections (in order):
1. Hero
2. [SECTION 2 NAME]
3. ...
N. Submit form (fields: [LIST] → emails to [NOTIFY_EMAIL])

Stack: same as lilimd.ai (Next.js 16 + Tailwind v4 + Firebase Admin + SMTP).
Host on Firebase App Hosting; new Firebase project named [PROJECT_ID].

Cloud-ops handles project creation + monitoring + Secret Manager. I'll do
App Hosting connect + env vars + IAM grant + smoke test + domain attach.

Deliverable timing: 3–5 days from full asset handoff.
```

---

## 11. What can vary, what shouldn't

### Can vary per site
- Visual aesthetic (colors, fonts, photography)
- Section count + content
- Form fields
- Whether Firestore is needed (small sites: skip and use email-only)
- Custom domain
- Analytics integration

### Shouldn't vary (default to lilimd.ai's choices)
- Next.js App Router + Tailwind v4 + TypeScript stack
- Firebase App Hosting for hosting (until a different host is justified)
- Keyless ADC for auth (org policy)
- Copy-in-`content.ts` convention
- Per-project monitoring wired in `lili-cloud-ops`
- Cost-catalog entry in `ops/` §5.8
- New dedicated Firebase project per site (not a shared one)

If a future site needs to deviate from these, surface the *why* in a design
decision before implementation — the consistency saves more time than the
deviation gains.

---

## 12. Cost expectations

Based on the lilimd.ai precedent ($25/mo budget cap, see [`memory/project_billing_and_ops.md`](../../.claude/projects/-Users-niralimehta-lili-md-website/memory/project_billing_and_ops.md)):

- **App Hosting:** ~$5–10/mo at low traffic (Cloud Run-backed)
- **Firestore:** ~$0 at lead-capture volumes (well under free tier)
- **SMTP outbound:** ~$0 for Gmail; ~$1–5/mo for Resend at scale
- **Domain + cert:** ~$15/yr registrar + free ACME via App Hosting

Budget $25/mo as a safety cap per marketing site. Cost-catalog tier:
"Customer-facing marketing / non-HIPAA prod."
