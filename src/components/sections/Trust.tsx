import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { trust } from "@/lib/content";

export function Trust() {
  return (
    <section className="px-6 py-8 sm:py-10">
      <Reveal className="mx-auto w-full max-w-5xl">
        {/* Equal thirds: dividers sit at 1/3 and 2/3, so the badges float in the
            middle third with clear space between them and the divider lines. */}
        <div className="grid grid-cols-1 gap-7 rounded-[28px] bg-[#391424] px-6 py-8 text-center sm:grid-cols-3 sm:gap-0 sm:px-8">
          {/* Left */}
          <div className="flex items-center justify-center px-4">
            <p className="font-serif text-lg leading-snug text-gold sm:text-xl">
              {trust.heading.line1}
              <br />
              {trust.heading.line2}
            </p>
          </div>

          {/* Center — two badges centered in the middle third; dividers flank it */}
          <div className="flex items-center justify-center gap-8 border-y border-gold/45 py-6 sm:gap-12 sm:border-x sm:border-y-0 sm:py-0">
            {trust.badges.map((b) => (
              <Image
                key={b.label}
                src={b.image}
                alt={b.label}
                width={400}
                height={400}
                className="h-[5.5rem] w-auto object-contain sm:h-24"
              />
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center justify-center px-4">
            <p className="font-serif text-lg leading-snug text-gold sm:text-xl">
              Secure. Compliant.
              <br />
              Reliable.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
