import { Section } from "../ui/Section";
import { Placeholder } from "../ui/Placeholder";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";
import { asset } from "@/lib/content";

export function Asset() {
  return (
    <Section>
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-maroon-800 p-8 sm:p-12 md:p-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl tracking-tight text-cream sm:text-4xl">
                {asset.heading}
              </h2>
              <div className="rule-gold mt-6 w-24" />
              <p className="mt-6 leading-relaxed text-cream-muted">
                {asset.body}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="#submit" variant="gold">
                  {asset.primaryCta}
                </Button>
                <Button href="#about" variant="outline">
                  {asset.secondaryCta}
                </Button>
              </div>
            </div>

            {/* Stethoscope image */}
            <Placeholder
              label="Stethoscope image"
              className="aspect-square w-full max-w-sm justify-self-center"
            />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
