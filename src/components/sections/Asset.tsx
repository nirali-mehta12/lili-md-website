import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { asset } from "@/lib/content";

export function Asset() {
  return (
    <section className="px-6 py-10 sm:px-8 sm:py-12">
      <Reveal className="relative mx-auto w-full max-w-5xl">
        {/* Text — stacked above the graphic on phones, overlaid on the card's
            left half on md+ (where the composite has room for it). */}
        <div className="mb-6 px-2 text-center md:absolute md:inset-y-0 md:left-0 md:z-10 md:mb-0 md:flex md:w-1/2 md:flex-col md:justify-center md:px-0 md:pb-[5%] md:pl-[9%] md:pr-3 md:text-left">
          <h2 className="font-serif text-2xl leading-[1.12] tracking-tight text-gold sm:text-4xl md:text-[2.6rem]">
            <span className="block">{asset.heading.line1}</span>
            <span className="block">{asset.heading.line2}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[22rem] text-[13px] leading-relaxed text-white/90 sm:text-[14px] md:mx-0 md:max-w-[20rem]">
            {asset.body}
          </p>
        </div>

        {/* Full Section-6 card: maroon panel + tan arc + stethoscope + floating labels, all baked in */}
        <Image
          src="/asset-all.png"
          alt="Turn your practice into an autonomous, optimized, high-value AI asset"
          width={2400}
          height={1285}
          className="h-auto w-full"
          priority={false}
        />
      </Reveal>
    </section>
  );
}
