import { Section, SectionHeading } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { tiers } from "@/lib/content";

export function Tiers() {
  return (
    <Section>
      <SectionHeading>{tiers.heading}</SectionHeading>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {tiers.items.map((tier, i) => (
          <Reveal key={tier.name} delay={i * 120}>
            <div
              className={`flex h-full flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                tier.highlight
                  ? "border-gold/60 bg-maroon-800 shadow-lg shadow-gold/10"
                  : "border-white/10 bg-maroon-800/40 hover:border-white/20"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-widest text-gold">
                {tier.tier}
              </p>
              <h3
                className={`mt-2 font-serif text-2xl ${tier.highlight ? "text-gold" : "text-cream"}`}
              >
                {tier.name}
              </h3>
              <div className="rule-gold mt-5 w-16" />
              <p className="mt-5 text-sm leading-relaxed text-cream-muted">
                {tier.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
