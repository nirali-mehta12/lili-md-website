/*
  Shared format + validation helpers for both forms.

  Two rules of thumb:
    - Auto-formatting runs on the CLIENT as the user types (so they see
      "(555) 123-4567" without hitting a submit button first).
    - Validation runs on BOTH client and server — client for fast UX,
      server for defense against bad payloads.
*/

/**
 * Extract just the digit characters from a phone-like string.
 *
 * @param input  Anything — the user's raw input.
 * @returns      Only digits, no other characters.
 */
export function phoneDigits(input: string): string {
  return (input || "").replace(/\D/g, "").slice(0, 10);
}

/**
 * Format a raw phone input as US style: `(XXX) XXX-XXXX`.
 * Progressively formats as digits are added; doesn't over-format short
 * inputs (so backspace behaves naturally).
 *
 * @param input  Raw or partially-formatted phone string.
 * @returns      Formatted string; empty when no digits given.
 */
export function formatPhoneUS(input: string): string {
  const d = phoneDigits(input);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/**
 * @returns `true` when the input contains exactly 10 US-style digits.
 */
export function isValidPhoneUS(input: string): boolean {
  return phoneDigits(input).length === 10;
}

/**
 * Practical email validator — stricter than the trivial `x@y.z` regex.
 * Requires: local part + `@` + domain with a TLD of 2+ letters.
 * Not full RFC 5322 (that's a rabbit hole); good enough to catch typos.
 *
 * @param input  Raw email string.
 * @returns      `true` when the format looks like a real email.
 */
export function isValidEmail(input: string): boolean {
  const s = (input || "").trim();
  if (!s || s.length > 254) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(s);
}
