# Access Gate — invitation-only entry

**Status (verified 2026-07-20):** Gate is **ON in production**
(`ACCESS_GATE_ENABLED="true"` in `apphosting.yaml`). Unauthenticated
visitors are rewritten to **`/apply`**. The old `/locked` password UI is
**paused** (code preserved). Internal team uses a shared **`?c=`** link.

Built so it's secure enough to keep casual visitors out while staying
frictionless (marketing page; nothing sensitive behind the gate).

## Visitor journeys

| Who | How they get in |
|-----|-----------------|
| Outreach / invited physicians | Fill `/apply` (Instant → 7-day session cookie) |
| Team / investors (internal) | Shared `https://lilimd.ai/?c=<CODE>` one-click |
| Password typed on `/locked` | **Paused** — not in the visitor flow |

On success a signed, HttpOnly cookie (`lili_access`) keeps them in for ~7
days per device. Codes are stored **hashed** in Firestore `invites`.

## Backend files

| File | Role |
|------|------|
| `src/lib/session.ts` | Sign/verify session cookie (HMAC). Secure cookies in production only. |
| `src/lib/invites.ts` | Firestore invite model: generate / hash / verify / revoke / list. |
| `src/lib/request.ts` | `publicOrigin()` for safe redirects (avoids Cloud Run `0.0.0.0`). |
| `src/app/api/access/route.ts` | `POST {code}` and `GET ?c=CODE` → set cookie + redirect. |
| `src/app/api/apply/route.ts` | Doctor info form → invite + session. |
| `src/proxy.ts` | Gate rewrite to `/apply`; **`?c=` always handled**. |
| `scripts/invite.mjs` | CLI to mint/list/revoke codes (prints prod + localhost one-click URLs). |

## `/locked` (paused)

UI + `useUnlock()` remain in `src/app/locked/*` for possible restore.
Restoring password-as-primary-gate means re-wiring exemptions / rewrite
target in `src/proxy.ts` (see block comment there). Team `?c=` can stay
even while `/locked` stays paused.

## Minting codes — `/admin`

Password-protected (`ADMIN_SECRET`). Create / list / revoke. Secrets are
already wired in `apphosting.yaml` for production.

## Minting codes — CLI

```bash
node scripts/invite.mjs create "Dr. Jane Smith"     # no expiry
node scripts/invite.mjs create "Team" 365           # shared team link
node scripts/invite.mjs list
node scripts/invite.mjs revoke <id>
npm run smoke-test                                  # 30-day "smoke test" code
```

Requires local ADC: `gcloud auth application-default login`.

## Turning the gate OFF (make site public)

1. Set `ACCESS_GATE_ENABLED` to `"false"` in `apphosting.yaml` (or remove it).
2. Redeploy. `?c=` one-click still works (handler runs even when gate is off).
