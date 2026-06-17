import { Section, SectionHeading } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { phases } from "@/lib/content";

export function Phases() {
  return (
    <Section>
      <SectionHeading>{phases.heading}</SectionHeading>
      <Reveal>
        <p className="mx-auto mt-6 max-w-2xl text-center text-cream-muted">
          {phases.subheading}
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {phases.items.map((phase, i) => (
          <Reveal key={phase.number} delay={i * 120}>
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-maroon-800/40 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
              <span className="font-serif text-5xl text-gold/60">
                {phase.number}
              </span>
              <p className="mt-4 text-xs font-medium uppercase tracking-widest text-gold">
                {phase.label}
              </p>
              <p className="mt-1 font-serif text-xl text-cream">{phase.rate}</p>
              <p className="mt-4 text-sm leading-relaxed text-cream-muted">
                {phase.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
