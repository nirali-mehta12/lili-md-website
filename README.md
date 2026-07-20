# LiLi M.D. — Marketing Website (lilimd.ai)

Invitation-only marketing + application site for **The Private Club at LiLi M.D.**

This is a **standalone** Next.js app (not the main LiLi product). Design rebuilt from Ronnie’s Canva / HTML references into Next.js 16 + Tailwind v4 + Firebase App Hosting.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill FIREBASE_PROJECT_ID, SMTP, ACCESS_SESSION_SECRET, …
gcloud auth application-default login   # local Firestore (keyless ADC)
npm run dev
```

Open http://localhost:3000 — with the gate off locally you see the landing page; enable `ACCESS_GATE_ENABLED=true` to exercise `/apply`.

## Docs (source of truth)

| Doc | Purpose |
|-----|---------|
| [CLAUDE.md](./CLAUDE.md) | Repo status, file map, conventions |
| [docs/PRD.md](./docs/PRD.md) | Product requirements |
| [docs/SRS.md](./docs/SRS.md) | Software requirements |
| [ACCESS_GATE.md](./ACCESS_GATE.md) | Gate, invites, team `?c=` link |
| [docs/WEBSITE-PLAYBOOK.md](./docs/WEBSITE-PLAYBOOK.md) | Recipe for future marketing sites |

## Production

- **URL:** https://lilimd.ai  
- **Deploy:** push to `main` → Firebase App Hosting auto-rollout (~5–10 min)  
- **Never push to `main` without explicit approval**

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run screenshot` | Playwright viewport screenshots |
| `npm run smoke-test` | Mint a short-lived invite code |
