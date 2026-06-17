import { Section, SectionHeading } from "../ui/Section";
import { Placeholder } from "../ui/Placeholder";
import { Reveal } from "../ui/Reveal";
import { benefits } from "@/lib/content";

export function Benefits() {
  return (
    <Section className="bg-maroon-950/40">
      <SectionHeading>{benefits.heading}</SectionHeading>

      <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {benefits.items.map((item, i) => (
          <Reveal key={item.title} delay={i * 90}>
            <div className="flex h-full flex-col items-center text-center">
              <Placeholder
                label={`Benefit ${i + 1}`}
                className="aspect-square w-full"
              />
              <h3 className="mt-4 font-serif text-base leading-snug text-cream">
                {item.title}
              </h3>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
