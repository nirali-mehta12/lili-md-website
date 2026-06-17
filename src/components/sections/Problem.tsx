import { Section, SectionHeading } from "../ui/Section";
import { Placeholder } from "../ui/Placeholder";
import { Reveal } from "../ui/Reveal";
import { problem } from "@/lib/content";

export function Problem() {
  return (
    <Section id="about">
      <SectionHeading>{problem.heading}</SectionHeading>
      <Reveal>
        <p className="mx-auto mt-6 max-w-2xl text-center text-cream-muted">
          {problem.intro}
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {problem.options.map((opt, i) => (
          <Reveal key={opt.title} delay={i * 120}>
            <div
              className={`flex h-full flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                opt.highlight
                  ? "border-gold/60 bg-maroon-800 shadow-lg shadow-gold/10"
                  : "border-white/10 bg-maroon-800/40 hover:border-white/20"
              }`}
            >
              <Placeholder
                label={`Icon ${i + 1}`}
                className="mb-6 h-14 w-14 shrink-0"
              />
              <h3
                className={`font-serif text-xl ${opt.highlight ? "text-gold" : "text-cream"}`}
              >
                {opt.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-muted">
                {opt.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
