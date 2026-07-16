"use client";

import { useEffect, useRef, useState } from "react";
import { apply } from "@/lib/content";
import { isValidEmail, isValidPhoneUS } from "@/lib/format";

/**
 * Payload the /apply page collects and posts to /api/apply.
 * The server ignores any additional fields.
 */
export type ApplyPayload = {
  firstName: string;
  lastName: string;
  practiceName: string;
  website: string;
  phone: string;
  email: string;
  licenseNo: string;
  ehr: string;
  referredBy: string;
  consent: boolean;
};

/*
  Submits the doctor-info form to /api/apply.

  Instant-access flow (current default):
    server validates -> creates invite -> stores application -> emails admin
    -> sets session cookie -> we redirect so the gate lets them in.

  If we later switch to manual review, only the server route changes
  (skip cookie set, return { ok: true, pending: true }) and the client's
  "Access Granted" screen swaps text — this hook's shape stays the same.
*/

type ApplyResponse = {
  ok?: boolean;
  error?: string;
  alreadyAuthenticated?: boolean;
  pending?: boolean;
};

/**
 * React hook that owns the /apply form's async submit lifecycle.
 *
 * @returns `submit`  Call with a fully-populated payload to fire the request.
 * @returns `pending` `true` while an in-flight POST is running.
 * @returns `error`   Localized error string when the last submit failed.
 * @returns `done`    `true` after a successful submit — show the success screen.
 */
export function useRequestAccess() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending redirect timer if the component unmounts before it fires.
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  async function submit(payload: ApplyPayload): Promise<void> {
    setError(null);
    if (!payload.firstName.trim() || !payload.lastName.trim()) {
      setError(apply.errors.missingName);
      return;
    }
    if (!payload.email.trim() || !payload.phone.trim()) {
      setError(apply.errors.missingContact);
      return;
    }
    if (!isValidEmail(payload.email)) {
      setError(apply.errors.invalidEmail);
      return;
    }
    if (!isValidPhoneUS(payload.phone)) {
      setError(apply.errors.invalidPhone);
      return;
    }
    // Practice / website / license / EHR / referred-by are optional.
    // Consent remains required (TCPA).
    if (!payload.consent) {
      setError(apply.errors.missingConsent);
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as ApplyResponse;
      if (res.ok && data.ok) {
        setDone(true);
        // Brief pause so "Access Granted" is visible, then reload the gate
        // — proxy.ts now sees the session cookie and lets us through to /.
        // If the user navigates away in that 1.5s, the cleanup effect above
        // clears the timer so we don't hijack their destination.
        redirectTimer.current = setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return;
      }
      setError(data.error || apply.errors.generic);
    } catch {
      setError(apply.errors.network);
    } finally {
      setPending(false);
    }
  }

  return { submit, pending, error, done };
}
