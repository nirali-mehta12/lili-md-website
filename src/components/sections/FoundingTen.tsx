import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { foundingTen } from "@/lib/content";

export function FoundingTen() {
  return (
    <section
      id="founding"
      className="px-6 py-10 sm:px-8 sm:py-12"
      style={{
        // Vertical dark→plum→dark band (matches the PDF's actual profile). A linear
        // gradient blends to #1c0b17 at top & bottom (= neighboring sections, no seam)
        // and renders identically on every screen, unlike the old radial "sphere".
        background:
          "linear-gradient(180deg, #1c0b17 0%, #2e142a 50%, #1c0b17 100%)",
      }}
    >
      <div className="relative mx-auto w-full max-w-5xl">
        {/* Heading: "Claim Your Place in" (white, flanked) + "the Founding 10" (gold) */}
        <Reveal>
          <div className="flex items-center justify-center gap-3 sm:gap-8">
            <span className="h-px flex-1 bg-gold/55" />
            <h2 className="whitespace-nowrap font-serif text-3xl leading-none tracking-tight text-white sm:text-4xl md:text-5xl">
              {foundingTen.heading.line1}
            </h2>
            <span className="h-px flex-1 bg-gold/55" />
          </div>
          <h2 className="mt-1 text-center font-serif text-3xl leading-tight tracking-tight text-gold sm:text-4xl md:text-5xl">
            {foundingTen.heading.line2}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-white/85">
            {foundingTen.body}
          </p>
        </Reveal>

        {/* Founding-member slates — individual images in a responsive grid
            (2 columns on phones, 5 on desktop) so they stay large + legible. */}
        <Reveal delay={120}>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-5 sm:gap-4">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <Image
                key={n}
                src={`/slate-${n}.png`}
                alt={`Founding member position ${n}, awaiting selection`}
                width={347}
                height={538}
                className="h-auto w-full"
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
