"use client";

import { useState } from "react";
import Image from "next/image";
import { useUnlock } from "./use-unlock";

/*
  Private Access lock screen.
  UI only — all wiring stays on useUnlock() (submitCode / pending / error / linkError).
*/

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#c69986"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LockedPage() {
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const { submitCode, pending, error, linkError } = useUnlock();

  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#1c0b17]">
      <div className="flex flex-1 px-4 pt-5 sm:px-6 sm:pt-7">
        {/* Left — marina/office window photo (desktop) */}
        <div className="relative hidden w-[42%] shrink-0 lg:block">
          <Image
            src="/lock-view.png"
            alt="The bay at dusk from a private office at LiLi M.D."
            fill
            priority
            sizes="42vw"
            className="object-cover object-center"
          />
        </div>

        {/* Right — access panel */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center sm:px-10">
          <Image
            src="/footer-emblem.png"
            alt="LiLi M.D."
            width={1273}
            height={1252}
            priority
            className="h-16 w-auto sm:h-[4.75rem]"
          />

          <h1 className="mt-7 font-serif text-4xl leading-none tracking-tight text-gold sm:text-5xl">
            Private Access
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
            This area is reserved for authorized users.
            <br className="hidden sm:block" /> Please enter your password to
            continue.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitCode(code);
            }}
            className="mt-9 w-full max-w-md"
          >
            <div className="relative">
              <Image
                src="/lock-icon.png"
                alt=""
                aria-hidden="true"
                width={208}
                height={280}
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-auto -translate-y-1/2 opacity-80"
              />
              <input
                type={show ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your password"
                autoComplete="off"
                autoFocus
                aria-label="Password"
                className="w-full rounded-md border border-gold/30 bg-white/[0.03] py-4 pl-12 pr-12 text-[15px] text-white placeholder:tracking-wide placeholder:text-white/45 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-80 transition-opacity hover:opacity-100"
              >
                {show ? (
                  <EyeIcon />
                ) : (
                  <Image
                    src="/lock-eye.png"
                    alt=""
                    aria-hidden="true"
                    width={252}
                    height={253}
                    className="h-5 w-5"
                  />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="gradient-gold mt-5 w-full rounded-md py-4 text-sm font-semibold uppercase tracking-[0.28em] text-wine-950 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Unlocking…" : "Unlock"}
            </button>

            {linkError && (
              <p role="alert" className="mt-4 text-sm text-red-300">
                That invitation link wasn’t valid — enter your password instead.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-4 text-sm text-red-300">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Bottom — divider + club name */}
      <div className="px-6 pb-7 sm:px-10">
        <div className="h-px w-full bg-gold/20" />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
          The Private Club at LiLi M.D.
        </p>
      </div>
    </main>
  );
}
