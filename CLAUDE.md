@AGENTS.md

# LiLi M.D. — Marketing Website

A standalone marketing/lead-capture site for **LiLi M.D.** ("The Private Club") —
an invitation-only page shown to prospective founding-member physicians and
investors. Built faithfully from a fixed Canva design; only content is expected
to change. Not connected to the main LiLi product app.

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — theme tokens live in `src/app/globals.css` (`@theme` block), NOT a `tailwind.config.js`
- **Firebase Admin** (Firestore) for storing form submissions
- Target host: **Firebase App Hosting**

## Architecture
- `src/app/page.tsx` — composes all sections in order.
- `src/components/sections/*` — one component per page section (Hero, Problem, etc.).
- `src/components/ui/*` — shared pieces: `Section`, `Button`, `Reveal` (scroll animation), `Placeholder`, `Logo`.
- `src/lib/content.ts` — **ALL site copy.** Edit text here, not in JSX.
- `src/lib/firebase.ts` — lazy Firebase Admin init. Returns `null` ("placeholder mode") when no credentials, so the form works locally without setup.
- `src/app/api/submit/route.ts` — form handler: honeypot + rate limit + validation → writes to Firestore `leads` and queues email via the `mail` collection (Firebase "Trigger Email" extension) to `admin@lilisolutions.ai`.

## Design tokens (PLACEHOLDERS — awaiting designer)
All colors/fonts/gradient in `globals.css` and the fonts in `layout.tsx` are
placeholders. Swapping them re-skins the whole site:
- Colors: `--color-maroon-*`, `--color-gold*`, `--color-cream*`
- Fonts: heading = Playfair Display, body = Inter (swap in `layout.tsx`)
- Images: every `<Placeholder/>` marks a spot for a real asset dropped in `/public`.

## Conventions
- Mobile-first, responsive. Desktop layouts reflow to single-column on small screens.
- Animations via the dependency-free `<Reveal/>` (IntersectionObserver + CSS).
- Keep server/client split: `firebase.ts` and the API route are server-only.

## Env
Copy `.env.example` → `.env.local`. Without it, the form runs in placeholder
mode (logs the lead, returns success). See `.env.example` for variables.

## Commands
- `npm run dev` — local dev (http://localhost:3000)
- `npm run build` — production build (also typechecks)
- `npm run lint` — eslint
