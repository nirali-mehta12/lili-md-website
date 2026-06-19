import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { timeline } from "@/lib/content";

const LABEL_X = ["18.5%", "50%", "81.5%"];

export function Timeline() {
  return (
    <section className="px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        {/* Heading: "The 3-Tier" (white, flanked) + "Growth Timeline" (gold) */}
        <Reveal>
          <div className="flex items-center justify-center gap-3 sm:gap-8">
            <span className="h-px flex-1 bg-gold/55" />
            <h2 className="whitespace-nowrap font-serif text-3xl leading-none tracking-tight text-white sm:text-4xl md:text-5xl">
              {timeline.heading.line1}
            </h2>
            <span className="h-px flex-1 bg-gold/55" />
          </div>
          <h2 className="mt-1 text-center font-serif text-3xl leading-tight tracking-tight text-gold sm:text-4xl md:text-5xl">
            {timeline.heading.line2}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-white/85">
            {timeline.body}
          </p>
        </Reveal>

        {/* Meter graphic + aligned labels */}
        <Reveal delay={120}>
          <div className="relative mx-auto mt-12 w-full max-w-lg sm:mt-14">
            <Image
              src="/timeline-meter.png"
              alt="Growth timeline: The Architects, The Laureates, The Luminaries"
              width={2250}
              height={648}
              className="h-auto w-full"
            />
            <div className="relative mt-4 h-8">
              {timeline.steps.map((s, i) => (
                <span
                  key={s.count}
                  style={{ left: LABEL_X[i] }}
                  className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-label text-[10px] font-bold uppercase tracking-wide text-gold sm:text-[11px]"
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
