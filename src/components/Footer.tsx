import Link from "next/link";
import { Logo } from "./ui/Logo";
import { Placeholder } from "./ui/Placeholder";
import { nav, footer } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-maroon-950 px-6 py-16 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-3">
        {/* Brand + blurb */}
        <div className="md:col-span-2">
          <Logo />
          <h3 className="mt-6 font-serif text-xl text-cream">
            {footer.blurbHeading}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream-muted">
            {footer.blurb}
          </p>
          <p className="mt-6 text-sm italic text-gold/80">
            {footer.privateClub}
          </p>
        </div>

        {/* Navigate + socials */}
        <div>
          <h4 className="text-xs font-medium uppercase tracking-widest text-gold">
            {footer.navHeading}
          </h4>
          <ul className="mt-4 space-y-2">
            {nav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-cream-muted transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex gap-3">
            {footer.socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="transition-opacity hover:opacity-80"
              >
                {/* Replace with the real social icon SVGs from the designer */}
                <Placeholder label={s.label.slice(0, 2)} className="h-10 w-10" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-6xl border-t border-white/5 pt-6 text-center text-xs text-cream-muted/60">
        © {new Date().getFullYear()} {footer.privateClub.split(" — ")[0]}. All
        rights reserved.
      </div>
    </footer>
  );
}
