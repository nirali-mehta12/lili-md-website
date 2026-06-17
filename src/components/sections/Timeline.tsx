import { Section, SectionHeading } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { timeline } from "@/lib/content";

export function Timeline() {
  return (
    <Section className="bg-maroon-950/40">
      <SectionHeading>{timeline.heading}</SectionHeading>
      <Reveal>
        <p className="mx-auto mt-6 max-w-2xl text-center text-cream-muted">
          {timeline.body}
        </p>
      </Reveal>

      <Reveal className="mt-16">
        <div className="relative flex flex-col items-center justify-between gap-12 sm:flex-row sm:gap-4">
          {/* Connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-gold/10 via-gold/50 to-gold/10 sm:block" />

          {timeline.steps.map((step) => (
            <div
              key={step.count}
              className="relative z-10 flex flex-1 flex-col items-center text-center"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gold/50 bg-maroon-900 font-serif text-2xl text-gold shadow-lg shadow-black/30">
                {step.count}
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-widest text-cream">
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
