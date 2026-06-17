import { Placeholder } from "../ui/Placeholder";
import { Reveal } from "../ui/Reveal";
import { hero } from "@/lib/content";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-maroon-950 to-maroon-900 px-6 pb-20 pt-28 sm:px-8 md:pb-28 md:pt-36"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Hero image (doctor / office with bay view) */}
        <Reveal>
          <Placeholder
            label="Hero image — doctor / office"
            className="aspect-[16/9] w-full md:aspect-[21/9]"
          />
        </Reveal>

        {/* Club title */}
        <Reveal className="mt-12 text-center" delay={100}>
          <h1 className="font-serif text-4xl leading-tight tracking-tight text-cream sm:text-5xl md:text-6xl">
            {hero.club}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-cream-muted sm:text-lg">
            {hero.subtitle}
          </p>
        </Reveal>

        {/* Gold "Work Less. Earn More." card */}
        <Reveal className="mt-14" delay={200}>
          <div className="gradient-gold mx-auto max-w-3xl rounded-2xl p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
            <h2 className="font-serif text-3xl text-maroon-950 sm:text-4xl">
              {hero.cardHeading}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-maroon-950/80 sm:text-base">
              {hero.cardBody}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
