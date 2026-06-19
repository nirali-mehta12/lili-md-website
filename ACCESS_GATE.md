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

## UI to build (the ONLY remaining piece) → restyle `src/app/locked/page.tsx`
The lock page is already **functional** — logic lives in `src/app/locked/use-unlock.ts`
and a working (unstyled) placeholder is in `src/app/locked/page.tsx`. The UI window
only restyles the markup; keep the `useUnlock()` wiring:

```tsx
const { submitCode, pending, error, linkError } = useUnlock();
// render an input + button; on submit call submitCode(code).
// `error` = bad code msg, `linkError` = a one-click link failed, `pending` = in-flight.
```

On success the hook reloads the page; the gate then sees the session cookie and
serves the real site. The backend handles codes, sessions, one-click links, and tracking.

## Minting codes — option 1: the admin web tool (no terminal) → `/admin`
A password-protected page where the admin types a name and gets a code + one-click
link, and can list/revoke existing codes. Protected by `ADMIN_SECRET` (separate from
the visitor gate). To enable:
1. `firebase apphosting:secrets:set ADMIN_SECRET` (choose a strong password — this is what the admin types)
2. `firebase apphosting:secrets:grantaccess ADMIN_SECRET --backend lili-md-website`
3. Uncomment the `ADMIN_SECRET` entry in `apphosting.yaml`, then redeploy.
Then visit `/admin`, log in, and create codes. Until the secret is set, `/admin` shows
a login that rejects everything (fail-safe).

## Minting codes — option 2: the CLI
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
