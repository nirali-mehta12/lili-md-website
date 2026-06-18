import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { hero } from "@/lib/content";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-wine-900 pt-20">
      {/* Full-bleed hero photo (natural aspect) with a gentle gold arc + medallion */}
      <div className="relative w-full">
        <Image
          src="/hero.png"
          alt="A LiLi M.D. founding physician in a private practice overlooking the bay"
          width={2366}
          height={1350}
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />

        {/* Curved divider: wine DOME arching up into the photo + gold arc on top */}
        <svg
          className="absolute inset-x-0 bottom-[-1px] h-36 w-full sm:h-48"
          viewBox="0 0 1440 170"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,170 Q720,-26 1440,170 L1440,170 Z" fill="#1c0b17" />
          <path
            d="M0,170 Q720,-26 1440,170"
            fill="none"
            stroke="#c69986"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: "clamp(6px, 0.55vw, 14px)" }}
          />
        </svg>

        {/* Club medallion at the dome's peak (center) */}
        <Image
          src="/badge.png"
          alt=""
          aria-hidden="true"
          width={1178}
          height={1178}
          className="absolute bottom-[52px] left-1/2 h-16 w-16 -translate-x-1/2 drop-shadow-lg sm:bottom-[74px] sm:h-20 sm:w-20"
        />
      </div>

      {/* Eyebrow + diamond accent + two-tone title */}
      <div className="relative mx-auto max-w-5xl px-6 pb-10 pt-12 text-center sm:pb-12 sm:pt-14">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-gold sm:text-[15px]">
            {hero.eyebrow}
          </p>
          <div className="mx-auto mt-5 flex w-48 items-center justify-center gap-2">
            <span className="h-px flex-1 bg-gold/60" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px flex-1 bg-gold/60" />
          </div>
          <h1 className="mt-6 font-serif text-[2rem] uppercase leading-[1.12] tracking-tight sm:text-5xl md:text-[3.85rem]">
            <span className="text-white">{hero.heading.line1}</span>
            <br />
            <span className="text-gold">{hero.heading.line2}</span>
          </h1>
        </Reveal>
      </div>
    </section>
  );
}
