import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { asset } from "@/lib/content";

export function Asset() {
  return (
    <section className="px-6 pb-6 pt-10 sm:pb-8 sm:pt-14">
      <Reveal className="relative mx-auto w-full max-w-[80rem]">
        {/* Full Section-6 card: maroon panel + tan arc + stethoscope + floating labels, all baked in */}
        <Image
          src="/asset-all.png"
          alt="Turn your practice into an autonomous, optimized, high-value AI asset"
          width={2400}
          height={1285}
          className="h-auto w-full"
          priority={false}
        />

        {/* Heading + body overlaid on the left of the card, vertically centered on the card */}
        <div className="absolute inset-y-0 left-0 flex w-1/2 flex-col justify-center pb-[5%] pl-[9%] pr-3">
          <h2 className="font-serif text-2xl leading-[1.12] tracking-tight text-gold sm:text-4xl md:text-[2.6rem]">
            <span className="block">{asset.heading.line1}</span>
            <span className="block">{asset.heading.line2}</span>
          </h2>
          <p className="mt-4 max-w-[20rem] text-[13px] leading-relaxed text-white/90 sm:text-[14px]">
            {asset.body}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
