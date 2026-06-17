"use client";

import { useState } from "react";
import { Section } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { submit } from "@/lib/content";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "w-full rounded-lg border border-white/15 bg-maroon-950/50 px-4 py-3 text-cream placeholder:text-cream-muted/50 transition-colors focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40";

export function SubmitForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Please try again.");
    }
  }

  return (
    <Section id="submit">
      <div className="mx-auto max-w-2xl">
        <Reveal className="text-center">
          <h2 className="font-serif text-3xl tracking-tight text-cream sm:text-4xl">
            {submit.heading}
          </h2>
          <div className="rule-gold mx-auto mt-6 w-24" />
          <p className="mt-6 text-cream-muted">{submit.body}</p>
        </Reveal>

        {status === "success" ? (
          <Reveal className="mt-10">
            <div className="rounded-2xl border border-gold/40 bg-maroon-800 p-10 text-center">
              <p className="font-serif text-2xl text-gold">Thank you.</p>
              <p className="mt-3 text-cream-muted">
                Your profile has reached the founders. We&apos;ll be in touch.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Honeypot — hidden from humans; bots fill it and get rejected. */}
              <div
                className="absolute left-[-9999px] top-[-9999px]"
                aria-hidden="true"
              >
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="name" className="mb-2 block text-sm text-cream">
                  {submit.fields.name}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-cream">
                  {submit.fields.email}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label
                  htmlFor="socials"
                  className="mb-2 block text-sm text-cream"
                >
                  {submit.fields.socials}
                </label>
                <input
                  id="socials"
                  name="socials"
                  type="text"
                  className={inputClasses}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm text-cream"
                >
                  {submit.fields.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className={`${inputClasses} resize-y`}
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-300">{error}</p>
              )}

              <div className="flex flex-col items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="gradient-gold inline-flex w-full items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium uppercase tracking-wider text-maroon-950 transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-gold/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {status === "submitting" ? "Sending…" : submit.cta}
                </button>
                <p className="text-center text-xs text-cream-muted/70">
                  {submit.privacyNote}
                </p>
              </div>
            </form>
          </Reveal>
        )}
      </div>
    </Section>
  );
}
