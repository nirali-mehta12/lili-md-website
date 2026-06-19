import { Reveal } from "../ui/Reveal";
import { tiers } from "@/lib/content";

export function Tiers() {
  return (
    <section id="tiers" className="px-6 py-10 sm:px-8 sm:py-12">
      {/* Narrower than the Trust box above (max-w-4xl < 5xl), so it sits under it, not edge-aligned */}
      <div className="mx-auto w-full max-w-4xl">
        <Reveal>
          <h2 className="text-center font-serif text-3xl leading-tight tracking-tight text-white sm:text-4xl md:text-[2.5rem]">
            {tiers.heading}
          </h2>
        </Reveal>

        <div className="mt-9 grid items-stretch gap-5 sm:mt-10 md:grid-cols-3">
          {tiers.items.map((item, i) => (
            <Reveal key={item.tier} delay={i * 110}>
              <div className="flex h-full flex-col rounded-md bg-[#471a2e] px-6 py-6 sm:px-6 sm:py-7">
                <p className="font-serif text-base font-semibold tracking-wide text-gold">
                  {item.tier}
                </p>
                <h3
                  className={`mt-1 font-serif text-xl leading-snug sm:text-2xl ${
                    item.highlight ? "text-gold" : "text-white"
                  }`}
                >
                  {item.name}
                </h3>
                <ul className="mt-5 space-y-2.5">
                  {item.bullets.map((b, j) => (
                    <li
                      key={j}
                      className={`flex gap-2.5 text-[13px] leading-relaxed ${
                        item.highlight ? "text-gold" : "text-white/90"
                      }`}
                    >
                      <span
                        className={`mt-[0.45rem] inline-block h-1 w-1 shrink-0 rounded-full ${
                          item.highlight ? "bg-gold" : "bg-white/70"
                        }`}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
