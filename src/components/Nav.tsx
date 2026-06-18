"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { nav } from "@/lib/content";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-wine-900">
      <nav className="flex h-20 w-full items-center justify-between px-6 sm:px-10 lg:px-14">
        <Link href="#home" aria-label="LiLi M.D. home" className="flex items-center">
          <Image
            src="/logo-lockup.png"
            alt="LiLi MD"
            width={1567}
            height={532}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-10 md:flex">
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="text-base tracking-wide text-white transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center text-white md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 block h-0.5 w-6 bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-6 bg-current transition-all ${open ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-6 bg-current transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <ul className="flex flex-col gap-1 border-t border-white/5 bg-wine-900 px-6 py-4 md:hidden">
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-base tracking-wide text-white transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
