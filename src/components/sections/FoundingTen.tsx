import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { foundingTen } from "@/lib/content";

export function FoundingTen() {
  return (
    <section
      id="founding"
      className="px-6 py-12 sm:px-8 sm:py-16"
      style={{
        background: "radial-gradient(95% 75% at 50% 32%, #2e142a 0%, #1c0b17 68%)",
      }}
    >
      <div className="relative mx-auto w-full max-w-5xl">
        {/* Heading: "Claim Your Place in" (white, flanked) + "the Founding 10" (gold) */}
        <Reveal>
          <div className="flex items-center justify-center gap-5 sm:gap-8">
            <span className="hidden h-px flex-1 bg-gold/55 sm:block" />
            <h2 className="whitespace-nowrap font-serif text-3xl leading-none tracking-tight text-white sm:text-4xl md:text-5xl">
              {foundingTen.heading.line1}
            </h2>
            <span className="hidden h-px flex-1 bg-gold/55 sm:block" />
          </div>
          <h2 className="mt-1 text-center font-serif text-3xl leading-tight tracking-tight text-gold sm:text-4xl md:text-5xl">
            {foundingTen.heading.line2}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-white/85">
            {foundingTen.body}
          </p>
        </Reveal>

        {/* 2×5 grid of founding-member slates (all 10 composited in one asset) */}
        <Reveal delay={120}>
          <Image
            src="/founding-slates.png"
            alt="Ten founding-member position slates, awaiting selection"
            width={1870}
            height={1128}
            className="mx-auto mt-10 h-auto w-full sm:mt-12"
          />
        </Reveal>
      </div>
    </section>
  );
}
