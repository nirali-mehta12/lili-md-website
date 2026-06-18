import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { benefits } from "@/lib/content";

export function Benefits() {
  return (
    <section className="px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        {/* Heading: "Founding Member" (white, flanked by gold lines) + "Benefits" (gold) */}
        <Reveal>
          <div className="flex items-center justify-center gap-5 sm:gap-8">
            <span className="hidden h-px flex-1 bg-gold/55 sm:block" />
            <h2 className="whitespace-nowrap font-serif text-3xl leading-none tracking-tight text-white sm:text-4xl md:text-5xl">
              {benefits.heading.line1}
            </h2>
            <span className="hidden h-px flex-1 bg-gold/55 sm:block" />
          </div>
          <h2 className="mt-1 text-center font-serif text-3xl leading-tight tracking-tight text-gold sm:text-4xl md:text-5xl">
            {benefits.heading.line2}
          </h2>
        </Reveal>

        {/* 5 square tiles, each with a 2-line gold caption */}
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-9 sm:mt-16 sm:grid-cols-3 md:grid-cols-5 md:gap-x-3.5">
          {benefits.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 90}>
              <figure className="flex flex-col items-center text-center">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={1000}
                  height={1000}
                  className="w-full rounded-md"
                />
                <figcaption className="mt-4 w-[62%] text-sm font-medium leading-snug text-gold">
                  {item.title}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
