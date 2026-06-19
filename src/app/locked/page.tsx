"use client";

import { useState } from "react";
import { useUnlock } from "./use-unlock";

/*
  ============================================================
  PLACEHOLDER lock page — functional but intentionally unstyled.
  ------------------------------------------------------------
  >>> UI WINDOW: restyle this markup. <<<
  Keep the wiring to useUnlock() (submitCode / pending / error / linkError);
  everything else (codes, sessions, tracking, one-click links) is handled
  by the backend. You only own what's rendered below.
  ============================================================
*/

export default function LockedPage() {
  const [code, setCode] = useState("");
  const { submitCode, pending, error, linkError } = useUnlock();

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitCode(code);
        }}
        style={{ display: "grid", gap: "0.75rem", width: "100%", maxWidth: 360 }}
      >
        <h1>By invitation only</h1>
        <p>Enter your access code to continue.</p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Access code"
          autoComplete="off"
          autoFocus
          aria-label="Access code"
        />
        <button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Enter"}
        </button>

        {linkError && (
          <p role="alert">That invitation link wasn’t valid — enter your code instead.</p>
        )}
        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  );
}
