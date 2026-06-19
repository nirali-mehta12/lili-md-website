import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { problem } from "@/lib/content";

export function Problem() {
  return (
    <section
      id="about"
      className="px-6 py-10 sm:px-8 sm:py-12"
      style={{
        background:
          "radial-gradient(65% 50% at 50% 16%, #2e142a 0%, transparent 72%), radial-gradient(94% 72% at 50% 64%, #2e142a 0%, transparent 72%), #1c0b17",
      }}
    >
      <div className="relative mx-auto w-full max-w-5xl">
        {/* Two-tone heading: "The Problem" flanked by gold lines, then line 2 */}
        <Reveal>
          <div className="flex items-center justify-center gap-3 sm:gap-8">
            <span className="h-px flex-1 bg-gold/55" />
            <h2 className="whitespace-nowrap font-serif text-3xl leading-none tracking-tight text-white sm:text-4xl md:text-5xl">
              {problem.heading.line1}
            </h2>
            <span className="h-px flex-1 bg-gold/55" />
          </div>
          <h2 className="mt-1 text-center font-serif text-3xl leading-tight tracking-tight text-gold sm:text-4xl md:text-5xl">
            {problem.heading.line2}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-center text-white">
            {problem.intro}
          </p>
        </Reveal>

        {/* 3 cards — square sides; center (AI-Native) is a taller portrait card */}
        <div className="mt-12 grid items-center gap-5 sm:mt-16 sm:gap-7 md:grid-cols-3">
          {problem.options.map((opt, i) => (
            <Reveal key={opt.title} delay={i * 110}>
              <div
                className={`flex h-full flex-col items-center justify-center bg-cover bg-center px-6 py-8 text-center sm:px-7 md:py-0 ${
                  opt.highlight ? "md:aspect-[4/5]" : "md:aspect-square"
                }`}
                style={{
                  backgroundImage: `url(${
                    opt.highlight
                      ? "/problem-card-highlight.png"
                      : "/problem-card.png"
                  })`,
                }}
              >
                <Image
                  src={opt.icon}
                  alt=""
                  aria-hidden="true"
                  width={220}
                  height={220}
                  className={`mb-4 object-contain ${opt.highlight ? "h-14 w-14" : "h-12 w-12"}`}
                />
                {opt.highlight ? (
                  <h3 className="font-serif text-xl leading-snug text-gold sm:text-2xl">
                    {opt.title.split(" — ").map((part, j) => (
                      <span key={j} className="block">
                        {part}
                      </span>
                    ))}
                  </h3>
                ) : (
                  <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-white">
                    {opt.title}
                  </h3>
                )}
                <p
                  className={`mt-3 text-sm leading-relaxed ${opt.highlight ? "text-gold" : "text-white"}`}
                >
                  {opt.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
