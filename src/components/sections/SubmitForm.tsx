"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { submit } from "@/lib/content";

/*
  Landing-page contact section — "Be Considered" call-to-action.

  Per Ronnie/Mel's 2026-07-07 design update, the old form (name + email +
  practice + …) was replaced with a single centered CTA button. All
  doctor info is captured at the /apply gate already, so this section
  just needs to give the doctor a way to raise their hand — one click.

  Clicking the button POSTs to /api/consider, which:
    - looks up the doctor by their session cookie (they got here through /apply)
    - fires the admin notification email
    - returns 200

  The old form JSX + copy is preserved via `content.ts` legacy fields so
  it can be restored if the pattern is ever needed again.
*/

type Status = "idle" | "loading" | "success" | "error";

export function SubmitForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleClick() {
    if (status === "loading" || status === "success") return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/consider", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setStatus("success");
        return;
      }
      setError(data.error || submit.errorGeneric);
      setStatus("error");
    } catch {
      setError(submit.errorNetwork);
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-5xl">
        {/* Top divider with center emblem */}
        <Reveal>
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <span className="h-px flex-1 bg-gold/45" />
            <Image
              src="/footer-emblem.png"
              alt=""
              aria-hidden="true"
              width={1273}
              height={1252}
              className="h-10 w-auto shrink-0 sm:h-12"
            />
            <span className="h-px flex-1 bg-gold/45" />
          </div>
        </Reveal>

        <Reveal className="mt-14 text-center sm:mt-20">
          <p className="text-xs uppercase tracking-[0.28em] text-gold sm:text-[13px]">
            {submit.eyebrow}
          </p>

          <h2 className="mt-8 font-serif text-4xl leading-[1.05] tracking-tight text-gold sm:text-6xl md:text-[5.25rem]">
            <em className="italic">{submit.headingItalic}</em>{" "}
            <span className="not-italic">{submit.heading}</span>
          </h2>

          <span className="mx-auto mt-8 block h-px w-24 bg-gold/70 sm:mt-10 sm:w-32" />

          <p className="mx-auto mt-8 max-w-lg font-sans text-sm leading-relaxed text-gold sm:mt-10 sm:text-[15px]">
            {submit.body}
          </p>

          {/*
            Button + success message share the same rectangle. Both are
            mounted; opacity cross-fades between them on success — button
            fades OUT, message fades IN — so the layout doesn't jump and
            the message lands where the button was.

            Button hover: lifts up 4px + soft rose-copper glow beneath, so
            it feels like the plaque is hovering off the wall. Active/click:
            settles back down, mimicking a physical press. motion-reduce
            respects the user's OS setting (no motion for a11y).
          */}
          <div className="relative mx-auto mt-10 w-full max-w-md sm:mt-12 sm:max-w-lg">
            <button
              type="button"
              onClick={handleClick}
              disabled={status === "loading" || status === "success"}
              aria-label={submit.cta}
              aria-hidden={status === "success"}
              className={`group block w-full cursor-pointer
                transition-[transform,filter,box-shadow,opacity] duration-500 ease-out
                hover:-translate-y-1 hover:brightness-105
                hover:drop-shadow-[0_16px_30px_rgba(198,153,134,0.28)]
                active:translate-y-0 active:duration-100
                motion-reduce:transition-none motion-reduce:hover:translate-y-0
                focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-wine-900
                disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:drop-shadow-none
                ${
                  status === "success"
                    ? "pointer-events-none opacity-0"
                    : "opacity-100"
                }`}
            >
              <Image
                src="/contact-button.png"
                alt={submit.ctaAlt}
                width={1726}
                height={412}
                loading="eager"
                className="block h-auto w-full"
              />
            </button>

            {/* Success confirmation — overlaps the button's rectangle and
                fades in on click. delay-200 lets the button visibly fade
                out first before the message reveals, so it reads as one
                smooth handoff. */}
            <div
              role="status"
              aria-live="polite"
              className={`pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center transition-opacity duration-500 delay-200 motion-reduce:transition-none motion-reduce:delay-0 ${
                status === "success" ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="font-sans text-sm leading-relaxed text-gold sm:text-[15px]">
                {submit.successMessage}
              </p>
            </div>
          </div>

          {/* Loading / error text below — cleared once success handoff completes. */}
          <p
            className="mt-6 min-h-[1.25rem] text-xs uppercase tracking-[0.2em] text-gold sm:text-[13px]"
            role="status"
            aria-live="polite"
          >
            {status === "loading" && submit.ctaPending}
            {status === "error" && (
              <span className="normal-case tracking-normal text-red-300">
                {error}
              </span>
            )}
          </p>

          {/* Invitation-only note with small lock glyph */}
          <div className="mt-6 flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-[0.18em] text-gold sm:text-[12px]">
            <LockGlyph />
            {submit.note}
          </div>
        </Reveal>

        {/* No bottom divider here — <Footer/> renders its own top divider,
            so this section ends with padding and the Footer's line takes
            over as the natural separator. */}
      </div>
    </section>
  );
}

/** Small inline padlock — matches the design's minimal glyph next to the note. */
function LockGlyph() {
  return (
    <svg
      viewBox="0 0 12 14"
      width="10"
      height="12"
      aria-hidden="true"
      className="opacity-70"
    >
      <path
        d="M2.5 6V4a3.5 3.5 0 0 1 7 0v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x="1"
        y="6"
        width="10"
        height="7.5"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
