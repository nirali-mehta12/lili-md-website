<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single Next.js 16 app (App Router, npm — `package-lock.json`). Standard commands live in `README.md` / `package.json` scripts (`dev`, `build`, `lint`, `screenshot`, `smoke-test`); the update script already ran `npm install`. Notes below are the non-obvious gotchas.

- **Graceful degradation is uneven.** With no Firebase or SMTP configured, `getDb()` returns `null` and `/api/submit` runs in "placeholder mode" (logs the lead, returns `ok:true`). But `/api/apply` **hard-requires Firestore** — it mints an invite first and returns `503` when `getDb()` is `null`. So the landing page and the legacy lead form work with zero setup, but the invite-gate/apply flow does not.
- **Access gate is OFF locally by default.** Without `ACCESS_GATE_ENABLED=true`, `/` renders the landing page directly. Set `ACCESS_GATE_ENABLED=true` (and `ACCESS_SESSION_SECRET=<anything>` for session signing) to exercise the gate: an unauthenticated `/` then rewrites to `/apply`.
- **To test the full apply → gated-landing flow without real GCP creds, use the Firestore emulator.** Requires `firebase-tools` (install once: `npm i -g firebase-tools`; not an app dependency) and Java (present). Run `firebase emulators:start --only firestore --project demo-lili`, then start dev with `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_PROJECT_ID=demo-lili GOOGLE_CLOUD_PROJECT=demo-lili ACCESS_GATE_ENABLED=true ACCESS_SESSION_SECRET=local-test-secret npm run dev`. The Admin SDK auto-connects to the emulator; no credentials needed.
- **Inspecting emulator data:** `firestore.rules` is deny-all, which the emulator enforces for its REST API — pass `Authorization: Bearer owner` to read documents (e.g. `curl -H "Authorization: Bearer owner" "http://127.0.0.1:8080/v1/projects/demo-lili/databases/(default)/documents/doctor-applications"`). The app's Admin SDK writes bypass rules regardless.
- **SMTP is optional.** Email sends are best-effort; without `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` the notification is skipped and the request still succeeds.
- **`npm run lint` currently reports 2 pre-existing `react-hooks/set-state-in-effect` errors** (`src/app/admin/page.tsx`, `src/app/locked/use-unlock.ts`) — these are in existing code, not a setup problem.
