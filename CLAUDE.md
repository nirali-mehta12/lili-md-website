@AGENTS.md

# LiLi M.D. — Marketing Website

> **What this is:** a standalone marketing / lead-capture website for **LiLi M.D.**
> ("The Private Club") — invitation-only landing page for founding-member
> physicians and investors. **It is NOT part of the main LiLi product app.**

- **Live:** https://lilimd.ai
- **Repo:** https://github.com/nirali-mehta12/lili-md-website (private)
- **Local path:** `~/lili-md-website`
- **Owner:** Nirali (nirali@lilisolutions.ai)

---

## ⭐ START HERE — current status (verified 2026-07-20)

### ✅ Done / live in production
- Full responsive one-page site (13 sections) from Ronnie’s Canva + assets.
- **Gate ON:** unauthenticated visitors → `/apply` (Instant access).
- **`/locked` password UI paused** (code preserved).
- **Team one-click** `/?c=CODE` live (shared internal link; public-origin redirects).
- **Landing CTA = "Be Considered"** → `POST /api/consider` → admin email.
- `/apply` required: first/last name, phone, email + TCPA consent; other fields optional.
- Desktop `/apply` fits `100dvh` (no vertical scroll); mobile gateway image full-bleed.
- Email: direct SMTP (Gmail / nirali@ → admin@), not Firebase Trigger Email / SendGrid.
- Firebase project `lili-md-website`, Firestore locked down, App Hosting us-east4.
- Auth: keyless ADC (org blocks downloadable SA keys).

### Authoritative docs
| Doc | Role |
|-----|------|
| [`docs/PRD.md`](docs/PRD.md) | Product intent + decisions |
| [`docs/SRS.md`](docs/SRS.md) | Engineering requirements |
| [`ACCESS_GATE.md`](ACCESS_GATE.md) | Gate / invites / team link |
| [`docs/WEBSITE-PLAYBOOK.md`](docs/WEBSITE-PLAYBOOK.md) | Recipe for future sites |

> Push to `main` = auto-deploy to lilimd.ai (~5–10 min). **Never push without
> explicit approval.** Default: edit → typecheck → screenshot → STOP for review.

---

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — theme tokens in `src/app/globals.css` (`@theme`), not `tailwind.config.js`
- **Firebase Admin** (Firestore) + **nodemailer** SMTP
- Host: **Firebase App Hosting**

## Where everything lives
| Path | What it does |
|------|--------------|
| `src/app/page.tsx` | Landing composition (13 sections; `force-dynamic`) |
| `src/app/layout.tsx` | Fonts + metadata |
| `src/app/globals.css` | Design tokens |
| `src/app/apply/` | Doctor gate form |
| `src/app/locked/` | Password UI (paused) |
| `src/app/admin/` | Invite admin tool |
| `src/proxy.ts` | Access gate + `?c=` one-click |
| `src/components/sections/*` | Landing sections (incl. Be Considered in `SubmitForm.tsx`) |
| `src/lib/content.ts` | **ALL site copy** |
| `src/lib/firebase.ts` | Lazy Admin init |
| `src/lib/email.ts` | SMTP notifications |
| `src/lib/invites.ts` / `session.ts` / `request.ts` | Invites, cookies, public origin |
| `src/app/api/apply` | Gate form |
| `src/app/api/consider` | Be Considered click |
| `src/app/api/access` | Code unlock / one-click |
| `src/app/api/submit` | Legacy lead form API (UI unused) |
| `firestore.rules` | Deny all client access |
| `apphosting.yaml` | Runtime env + secrets |

## How access + forms work
1. **Physician:** `/apply` → validate → `doctor-applications` + invite + session → landing.
2. **Team:** `/?c=CODE` → `/api/access` → session → landing (no form).
3. **Be Considered:** authenticated click → `/api/consider` → admin email.
4. Unauthenticated visit to `/` → rewrite to `/apply`.

## Design / assets
- Brand: `docs/LiLi_MD_Brand_Guidelines.html`
- `/apply` reference: `docs/lili-md-access-gate-page2.html`
- Runtime images: `/public` · designer sources: `assets/` (gitignored)
- Copy: `src/lib/content.ts` only

## Commands
- `npm run dev` — http://localhost:3000
- `npm run build` — production build + typecheck
- `npm run lint` — eslint
- `npm run screenshot` — Playwright viewports → `scripts/screenshots/`
- `npm run smoke-test` — mint 30-day invite code (needs ADC)

## Conventions
- Mobile-first; `/apply` desktop is viewport-locked.
- `<Reveal/>` respects `prefers-reduced-motion`.
- Server-only modules never imported into client components.
