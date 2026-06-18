# Access Gate — invitation-only entry

Per-person access codes that gate the site. **Currently OFF** — the site is
public until `ACCESS_GATE_ENABLED="true"` is set. Built so it's secure enough
to keep the average person out while staying frictionless (it gates a marketing
page; nothing sensitive is behind it).

## How it works
- Each invited doctor gets a unique code (e.g. `ABCD-EFGH`), stored **hashed** in
  Firestore `invites` (never plaintext), with an optional expiry, revocable,
  and with every access counted for tracking.
- Mel sends it one of two ways — both use the same code:
  - **Typed:** "site → lilimd.ai, code → ABCD-EFGH" → enter on the lock page.
  - **One-click:** `https://lilimd.ai/?c=ABCDEFGH` → straight in, no typing.
- On success a signed, HttpOnly cookie keeps them in for ~7 days (per device),
  so revisits don't re-prompt. Verifying the code is rate-limited.

## Backend (done — this PR)
| File | Role |
|------|------|
| `src/lib/session.ts` | Sign/verify the stateless session cookie (HMAC). |
| `src/lib/invites.ts` | Firestore invite model: generate / hash / verify / revoke. |
| `src/app/api/access/route.ts` | `POST {code}` (form) and `GET ?c=CODE` (link) → set cookie. |
| `src/proxy.ts` | The gate. OFF unless `ACCESS_GATE_ENABLED="true"`. |
| `scripts/invite.mjs` | CLI to mint/list/revoke codes. |

## UI to build (the other half) → `src/app/locked/page.tsx`
A lock screen with **one code input + a submit button**. Behavior:
1. On submit, `POST` JSON `{ code }` to `/api/access`.
2. If the response is `{ ok: true }` → `window.location.reload()` (the gate now
   sees the cookie and renders the real site).
3. If not ok → show the returned `error` message.
4. If the URL has `?e=1`, show "that link/code wasn't valid" (a one-click link failed).

That's the whole contract — the backend handles codes, sessions, and tracking.

## Minting codes
```bash
node scripts/invite.mjs create "Dr. Jane Smith"     # no expiry
node scripts/invite.mjs create "Dr. Jane Smith" 30  # expires in 30 days
node scripts/invite.mjs list
node scripts/invite.mjs revoke <id>
```

## Turning the gate ON (later, once the lock page exists)
1. Create a Secret Manager secret `ACCESS_SESSION_SECRET` (32+ random bytes).
2. In `apphosting.yaml`, uncomment the two access-gate env entries and set
   `ACCESS_GATE_ENABLED="true"`.
3. Redeploy. Verify: a logged-out visit shows the lock page; a valid code lets you in.
