"use client";

import { useEffect, useState } from "react";

/*
  ============================================================
  Lock-page logic (everything EXCEPT the markup)
  ------------------------------------------------------------
  Your UI page calls this hook and wires its own input + button to it:

    const { submitCode, pending, error, linkError } = useUnlock();
    <form onSubmit={(e) => { e.preventDefault(); submitCode(code); }}>
      <input value={code} onChange={(e) => setCode(e.target.value)} />
      <button disabled={pending}>{pending ? "Checking…" : "Enter"}</button>
      {error && <p>{error}</p>}
    </form>

  On success it reloads the page; the proxy gate then sees the session
  cookie and renders the real site. No other wiring is needed.
  ============================================================
*/

export function useUnlock() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState(false);

  useEffect(() => {
    // A one-click invite link (?c=CODE) that failed redirects here with ?e=1.
    if (new URLSearchParams(window.location.search).has("e")) {
      setLinkError(true);
    }
  }, []);

  async function submitCode(code: string): Promise<void> {
    setError(null);
    if (!code.trim()) {
      setError("Please enter your access code.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        // Reload the URL they came to — the gate now sees the session cookie.
        window.location.reload();
        return;
      }
      setError(data.error || "That access code isn't valid.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return { submitCode, pending, error, linkError };
}
