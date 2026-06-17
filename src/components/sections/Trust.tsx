import { Section } from "../ui/Section";
import { Placeholder } from "../ui/Placeholder";
import { Reveal } from "../ui/Reveal";
import { trust } from "@/lib/content";

export function Trust() {
  return (
    <Section className="bg-maroon-950/40">
      <Reveal className="text-center">
        <h2 className="font-serif text-2xl tracking-tight text-cream sm:text-3xl">
          {trust.heading}
        </h2>
        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-gold">
          {trust.subheading}
        </p>
      </Reveal>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
        {trust.badges.map((badge, i) => (
          <Reveal key={badge} delay={i * 100}>
            <Placeholder label={badge} className="h-20 w-40" />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
