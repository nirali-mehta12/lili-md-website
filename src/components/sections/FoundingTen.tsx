import { Section, SectionHeading } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { foundingTen } from "@/lib/content";

export function FoundingTen() {
  return (
    <Section>
      <SectionHeading>{foundingTen.heading}</SectionHeading>
      <Reveal>
        <p className="mx-auto mt-6 max-w-2xl text-center text-cream-muted">
          {foundingTen.body}
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {foundingTen.slots.map((slot, i) => {
          const claimed = slot.status === "claimed";
          return (
            <Reveal key={slot.number} delay={i * 60}>
              <div
                className={`flex aspect-[3/4] flex-col items-center justify-center rounded-2xl border text-center transition-all duration-300 ${
                  claimed
                    ? "border-white/10 bg-maroon-800/30 opacity-60"
                    : "border-gold/40 bg-maroon-800/60 hover:-translate-y-1 hover:border-gold hover:shadow-lg hover:shadow-gold/10"
                }`}
              >
                <span className="font-serif text-4xl text-gold">
                  {slot.number}
                </span>
                <span className="mt-3 text-[10px] font-medium uppercase tracking-widest text-cream-muted">
                  {claimed ? "Claimed" : "Available"}
                </span>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
