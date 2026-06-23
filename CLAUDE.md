@AGENTS.md

# LiLi M.D. — Marketing Website

> **What this is:** a standalone marketing / lead-capture website for **LiLi M.D.**
> ("The Private Club") — an invitation-only landing page shown to prospective
> founding-member physicians and investors. Visitors fill a "Submit Your Practice"
> form; submissions are stored and emailed to `admin@lilisolutions.ai`.
> Built faithfully from a fixed Canva design (only content is expected to change).
> **It is NOT part of the main LiLi product app** — it's its own site and repo.

- **Repo:** https://github.com/nirali-mehta12/lili-md-website (private)
- **Local path:** `~/lili-md-website`
- **Owner:** Nirali (nirali@lilisolutions.ai)

---

## ⭐ START HERE — current status (as of 2026-06-17)

### ✅ Done
- Full responsive one-page site, all 13 sections, matches the Canva layout.
- Submit form → `/api/submit`: validation, spam protection (honeypot + rate limit),
  Firestore lead storage, email-on-submit.
- Design tokens, fonts, and every image are **placeholders**, built to be swapped.
- Production build passes; committed and pushed to the private repo.
- **Firebase project `lili-md-website` created.**
- **Firestore database live** (`(default)`, nam5, Native) + **security rules deployed**
  (locked: no public access; only the server's Admin SDK writes).
- **`.env.local` set to keyless ADC mode** (`FIREBASE_PROJECT_ID`, `GOOGLE_CLOUD_PROJECT`).
  NOTE: the `lilisolutions.ai` org policy blocks downloadable service-account keys,
  so we authenticate with **Application Default Credentials (keyless)**, not a key file.

### ⏳ Next steps (in order) — RESUME HERE
1. **Verify local keyless auth.** The user just ran `gcloud auth application-default login`
   (account: nirali@lilisolutions.ai). Confirm it worked: restart `npm run dev`, submit a
   test form (or POST to `/api/submit`), and check a doc appears in Firestore `leads`.
   - If the API logs `(placeholder mode)`, env isn't loaded → ensure `.env.local` exists and dev was restarted.
   - If it 500s with an auth/permission error → ADC isn't set; re-run `gcloud auth application-default login`,
     and if needed `gcloud auth application-default set-quota-project lili-md-website`.
2. **Swap in Canva assets.** Design PDF is in the project dir; images are in the `assets/` folder.
   Apply exact colors/gradient/fonts (globals.css + layout.tsx) and replace every
   `<Placeholder/>` with the real image (see "Swapping in designer assets").
3. **Email sending:** enable Blaze plan → SendGrid account + API key → install the
   `firebase/firestore-send-email` extension watching the `mail` collection.
4. **Deploy** to Firebase App Hosting + connect the domain.

> Whoever picks this up: read this file top to bottom, then run `npm run dev` and
> open http://localhost:3000 to see the current state.

---

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — theme tokens live in `src/app/globals.css` (`@theme` block), NOT a `tailwind.config.js`
- **Firebase Admin** (Firestore) for storing form submissions
- Host target: **Firebase App Hosting** (Google Cloud)

## Where everything lives (file map)
| Path | What it does |
|------|--------------|
| `src/app/page.tsx` | Composes all sections in order |
| `src/app/layout.tsx` | Root layout — **fonts** (Playfair Display + Inter placeholders) + page metadata |
| `src/app/globals.css` | **Design tokens**: colors, gold gradient, divider line, reveal animation |
| `src/components/sections/*` | One component per page section (Hero, Problem, WhatWeHandle, Asset, Benefits, Phases, Trust, Tiers, Timeline, FoundingTen, SubmitForm) |
| `src/components/Nav.tsx`, `Footer.tsx` | Header (with mobile menu) and footer |
| `src/components/ui/*` | Shared pieces: `Section`, `Button`, `Reveal` (scroll animation), `Placeholder`, `Logo` |
| `src/lib/content.ts` | **ALL site copy.** Edit text here, never in JSX |
| `src/lib/firebase.ts` | Lazy Firebase Admin init. Returns `null` ("placeholder mode") when unconfigured |
| `src/app/api/submit/route.ts` | Form handler: honeypot + rate limit + validation → Firestore `leads` + email |
| `firestore.rules` | Locks Firestore: no public client access (only the server's Admin SDK writes) |
| `.env.example` | Documents the env vars; copy to `.env.local` (gitignored) |

## How the form works (end to end)
1. Visitor submits `SubmitForm.tsx` (client) → POSTs JSON to `/api/submit`.
2. The route rejects bots (hidden "company" honeypot field) and rate-limits per IP.
3. Validates name + email.
4. Writes the lead to Firestore collection **`leads`**.
5. Writes an email doc to collection **`mail`**, which the Firebase **"Trigger Email"**
   extension watches and sends to `admin@lilisolutions.ai` (via SendGrid).
6. **Until Firebase creds exist in `.env.local`**, steps 4–5 are skipped and the lead
   is just logged to the server console (placeholder mode) — the form still "works".

---

## Swapping in designer assets (when they arrive)
Everything is centralized so a swap touches one place:
- **Colors + gold gradient** → `src/app/globals.css` (`@theme` block + `.gradient-gold`). Replace the PLACEHOLDER hex/stops with the exact Canva values.
- **Fonts** → `src/app/layout.tsx`. Swap the two `next/font/google` imports. If a font isn't on Google Fonts, drop `.woff2` files in `src/app/fonts/` and use `next/font/local`.
- **Images** → drop files in `/public`, then replace each `<Placeholder label="…" />` with `<Image src="/file.ext" alt="…" … />`. Search the codebase for `Placeholder` to find every spot.
- **Logo** → replace the inline SVG in `src/components/ui/Logo.tsx` with the real `/public/logo.svg`.
- **Text** → `src/lib/content.ts`.

Asset formats expected from the designer: transparent images as **PNG/SVG**, the hero/background as **JPG/WebP**, the logo + icons + decorative shapes (lines, diamonds, ornaments) as **SVG**.

---

## Firebase & Google Cloud setup (to go live)
Use the Firebase CLI via `npx -y firebase-tools@latest …` (always latest).
`firebase login` and `firebase init` are **interactive** — run those in a real
terminal, not a non-interactive tool shell. Config files are written by hand here.

1. **Log in:** `npx -y firebase-tools@latest login --reauth` (sign in as nirali@lilisolutions.ai).
2. **Create the project** (decided: a NEW dedicated project, e.g. `lili-md-website`):
   `npx -y firebase-tools@latest projects:create lili-md-website --display-name "LiLi MD Website"`
   then `npx -y firebase-tools@latest use lili-md-website`.
3. **Enable Firestore** and **deploy the rules:**
   create the database, then `npx -y firebase-tools@latest deploy --only firestore:rules`.
4. **Enable the Blaze (pay-as-you-go) plan** on the project (required for the email
   extension + App Hosting; generous free tier). Done by the owner in the Firebase console.
5. **Trigger Email extension + SendGrid:** create a free SendGrid account + API key,
   then install the `firebase/firestore-send-email` extension configured to watch the
   `mail` collection using the SendGrid SMTP credentials.
6. **Auth = keyless (ADC).** The org blocks downloadable service-account keys, so:
   - **Local:** `gcloud auth application-default login` once; `.env.local` just needs
     `FIREBASE_PROJECT_ID` + `GOOGLE_CLOUD_PROJECT` (already set). The Admin SDK in
     `src/lib/firebase.ts` falls through to `initializeApp({ projectId })` → uses ADC.
   - **App Hosting (prod):** ADC is automatic from the runtime service account — nothing to set.
   - (The `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` path in the code still works if
     keys are ever allowed, but is unused here.)
7. **Test:** submit the form locally → a `leads` doc appears in Firestore and an email
   arrives at `admin@lilisolutions.ai`.

## Deploy (Firebase App Hosting)
- Connect the GitHub repo to **Firebase App Hosting** (auto-builds on push to `main`).
- On App Hosting, Application Default Credentials are present, so only `FIREBASE_PROJECT_ID`
  (and the `NOTIFY_EMAIL` / `MAIL_COLLECTION` vars) need to be set as backend env vars.
- Point the custom domain (provided by Nirali) at the App Hosting backend.

---

## Conventions
- Mobile-first, responsive. Desktop multi-column layouts reflow to single column on phones.
- Animations via the dependency-free `<Reveal/>` (IntersectionObserver + CSS). Respects `prefers-reduced-motion`.
- Decorative shapes (thin lines, simple diamonds/dots) are drawn in code; only detailed ornaments come in as SVG.
- Server-only code (`firebase.ts`, the API route) must never be imported into client components.

## Commands
- `npm run dev` — local dev (http://localhost:3000)
- `npm run build` — production build (also typechecks)
- `npm run lint` — eslint
- `npm run screenshot [url] [viewport...] [--section=#id] [--code=XXXX]` — Playwright self-verification; outputs to `scripts/screenshots/` (gitignored). Default URL `http://localhost:3000`; viewports default to all 5 presets. Use `--section=#tiers` to clip one section.
- `npm run smoke-test` — mint a fresh 30-day "smoke test" invite code so you can poke around the gated production site. Requires local ADC (`gcloud auth application-default login`) since it writes to Firestore. Prints the plaintext code once — copy it from the terminal output.
