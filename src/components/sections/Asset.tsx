import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { asset } from "@/lib/content";

export function Asset() {
  return (
    <section className="px-0 py-0 sm:px-8 sm:py-12">
      <Reveal className="relative mx-auto w-full max-w-5xl">
        {/* Text overlaid inside the card's left half — desktop only. On mobile
            the portrait composite has the heading + body baked into the asset,
            so this overlay is hidden to avoid duplicate text. */}
        <div className="absolute inset-y-0 left-0 z-10 hidden w-1/2 flex-col justify-center pl-[7%] pr-2 text-left sm:flex sm:pr-3 md:pb-[5%] md:pl-[9%]">
          <h2 className="font-serif leading-[1.12] tracking-tight text-gold text-[clamp(0.8rem,3.6vw,2.6rem)]">
            <span className="block">{asset.heading.line1}</span>
            <span className="block">{asset.heading.line2}</span>
          </h2>
          <p className="mt-1 leading-snug text-white/90 text-[clamp(0.56rem,1.5vw,0.875rem)] md:mt-4 md:max-w-[20rem] md:leading-relaxed">
            {asset.body}
          </p>
        </div>

        {/* Mobile: portrait composite with heading + body baked in */}
        <Image
          src="/asset-all-mobile.png"
          alt="Turn your practice into an autonomous, optimized, high-value AI asset"
          width={624}
          height={834}
          className="block h-auto w-full sm:hidden"
          priority={false}
        />

        {/* sm+: landscape composite — maroon panel + tan arc + stethoscope, text overlaid above */}
        <Image
          src="/asset-all.png"
          alt="Turn your practice into an autonomous, optimized, high-value AI asset"
          width={2400}
          height={1285}
          className="hidden h-auto w-full sm:block"
          priority={false}
        />
      </Reveal>
    </section>
  );
}
