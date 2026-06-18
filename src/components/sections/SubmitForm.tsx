"use client";

import { useState } from "react";
// import Image from "next/image"; // re-enable with the socials block below
import { Reveal } from "../ui/Reveal";
import { submit } from "@/lib/content";
// import { socials } from "@/lib/content"; // re-enable when socials exist

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full rounded-sm border border-transparent bg-[#fad4bc] px-4 py-3 text-sm text-wine-950 placeholder:uppercase placeholder:tracking-wider placeholder:text-[#9a7257] focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";

export function SubmitForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          message: fd.get("message"),
          company: fd.get("company"), // honeypot
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        {/* top divider */}
        <div className="mb-12 h-px w-full bg-gold/45 sm:mb-16" />

        <div className="grid gap-12 md:grid-cols-2 md:gap-0">
          {/* Left — heading, body, socials */}
          <Reveal className="md:pr-12 lg:pr-16">
            <h2 className="font-serif text-3xl leading-[1.12] tracking-tight text-gold sm:text-4xl md:text-[2.6rem]">
              <span className="block">{submit.heading.line1}</span>
              <span className="block">{submit.heading.line2}</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/90">
              {submit.body}
            </p>

            {/* Socials hidden for now — no accounts yet. Re-enable this block
                (and the Image / socials imports above) when they exist.
            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              {submit.socialsLabel}
            </p>
            <div className="mt-5 flex items-center gap-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="transition-opacity hover:opacity-75"
                >
                  <Image
                    src={s.icon}
                    alt={s.label}
                    width={100}
                    height={100}
                    className="h-9 w-9 object-contain"
                  />
                </a>
              ))}
            </div>
            */}
          </Reveal>

          {/* Right — form (vertical divider on md+) */}
          <Reveal delay={120} className="md:border-l md:border-gold/45 md:pl-12 lg:pl-16">
            <p className="mb-6 text-sm leading-relaxed text-white/90">
              {submit.formIntro}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* honeypot — hidden from users */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />
              <input
                type="text"
                name="name"
                required
                placeholder={submit.fields.name}
                className={inputClass}
              />
              <input
                type="email"
                name="email"
                required
                placeholder={submit.fields.email}
                className={inputClass}
              />
              <textarea
                name="message"
                rows={5}
                placeholder={submit.fields.message}
                className={`${inputClass} resize-none`}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="gradient-gold w-full rounded-sm py-3 text-xs font-semibold uppercase tracking-[0.2em] text-wine-950 transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {status === "loading" ? "Submitting…" : submit.cta}
              </button>

              {status === "success" && (
                <p className="text-sm text-gold">
                  Thank you — your practice has been submitted. The founders will
                  be in touch.
                </p>
              )}
              {status === "error" && (
                <p className="text-sm text-red-300">{error}</p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
