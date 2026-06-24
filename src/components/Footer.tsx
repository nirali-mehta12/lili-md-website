import Image from "next/image";
import { Reveal } from "./ui/Reveal";
import { nav, footer } from "@/lib/content";

export function Footer() {
  return (
    <footer className="px-6 pb-24 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* top divider */}
        <div className="h-px w-full bg-gold/45" />

        <Reveal className="mt-14 flex flex-col items-center gap-12 sm:mt-16 sm:flex-row sm:items-start sm:justify-between">
          {/* Emblem */}
          <Image
            src="/footer-emblem.png"
            alt="LiLi M.D."
            width={1273}
            height={1252}
            className="h-20 w-auto object-contain sm:h-24"
          />

          {/* Navigate — centered under emblem on mobile, right-aligned on sm+ */}
          <div className="text-center sm:text-right">
            <h2 className="font-serif text-4xl leading-none text-gold sm:text-5xl">
              {footer.navHeading}
            </h2>
            <div className="mx-auto mt-3 h-px w-44 bg-gold/60 sm:mr-0" />
            <nav className="mx-auto mt-5 flex max-w-[15rem] flex-col gap-y-2 text-center sm:max-w-none sm:flex-row sm:justify-end sm:gap-5 sm:text-left sm:mr-0">
              {nav.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-gold transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </Reveal>

        <p className="mt-20 text-center text-xs tracking-wide text-white/35">
          {footer.legal}
        </p>
      </div>
    </footer>
  );
}
