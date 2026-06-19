import { Reveal } from "../ui/Reveal";
import { phases } from "@/lib/content";

export function Phases() {
  return (
    <section className="px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        {/* Heading: "The Three-Phase" (white, flanked by gold lines) + "Practice Journey" (gold) */}
        <Reveal>
          <div className="flex items-center justify-center gap-3 sm:gap-8">
            <span className="h-px flex-1 bg-gold/55" />
            <h2 className="whitespace-nowrap font-serif text-3xl leading-none tracking-tight text-white sm:text-4xl md:text-5xl">
              {phases.heading.line1}
            </h2>
            <span className="h-px flex-1 bg-gold/55" />
          </div>
          <h2 className="mt-1 text-center font-serif text-3xl leading-tight tracking-tight text-gold sm:text-4xl md:text-5xl">
            {phases.heading.line2}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-center text-sm leading-relaxed text-gold">
            {phases.subheading}
          </p>
        </Reveal>

        {/* 3 columns + a top rule. Vertical dividers are centered and inset,
            so they float in the middle without touching the horizontal rule. */}
        <div className="mt-12 grid border-t border-gold/45 sm:mt-14 md:grid-cols-3">
          {phases.items.map((item, i) => (
            <Reveal key={item.number} delay={i * 110} className="relative">
              {i > 0 && (
                <span className="absolute inset-y-7 left-0 hidden w-px bg-gold/45 md:block" />
              )}
              <div
                className={`h-full px-1 pt-8 md:px-8 ${
                  i > 0
                    ? "mt-6 border-t border-gold/30 md:mt-0 md:border-t-0"
                    : ""
                }`}
              >
                <div className="flex items-baseline justify-center gap-3 md:justify-start">
                  <span className="font-serif text-4xl leading-none text-white sm:text-5xl">
                    {item.number}
                  </span>
                  <span className="font-serif text-base text-white sm:text-lg">
                    {item.rate}
                  </span>
                </div>
                <p className="mt-5 text-center text-sm leading-relaxed text-gold md:text-left">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
