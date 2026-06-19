import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { asset } from "@/lib/content";

export function Asset() {
  return (
    <section className="px-6 py-10 sm:px-8 sm:py-12">
      <Reveal className="relative mx-auto w-full max-w-5xl">
        {/* Text overlaid inside the card's left half at every screen size
            (matches the composite/PDF). Fluid sizing keeps it fitting the card,
            which scales with the viewport. */}
        <div className="absolute inset-y-0 left-0 z-10 flex w-1/2 flex-col justify-center pl-[7%] pr-2 text-left sm:pr-3 md:pb-[5%] md:pl-[9%]">
          <h2 className="font-serif leading-[1.12] tracking-tight text-gold text-[clamp(0.8rem,3.6vw,2.6rem)]">
            <span className="block">{asset.heading.line1}</span>
            <span className="block">{asset.heading.line2}</span>
          </h2>
          <p className="mt-1 leading-snug text-white/90 text-[clamp(0.56rem,1.5vw,0.875rem)] md:mt-4 md:max-w-[20rem] md:leading-relaxed">
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
