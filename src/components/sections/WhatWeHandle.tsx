import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { whatWeHandle } from "@/lib/content";

export function WhatWeHandle() {
  return (
    <section className="px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-2 lg:gap-16">
        {/* Left — AI graphic on its own warm rounded panel (baked into the asset) */}
        <Reveal>
          <Image
            src="/ai-graphic.png"
            alt="LiLi M.D. AI intelligence layer over your practice's data foundation"
            width={1372}
            height={1208}
            className="h-auto w-full rounded-[28px] shadow-2xl shadow-black/40"
            priority={false}
          />
        </Reveal>

        {/* Right — heading, body, CTA */}
        <Reveal delay={120}>
          <div className="text-center md:text-left">
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-gold sm:text-4xl">
              {whatWeHandle.heading}
            </h2>
            <p className="mx-auto mt-6 max-w-[25rem] text-[15px] leading-relaxed text-white/90 md:mx-0">
              {whatWeHandle.body}
            </p>
            <a
              href="#contact"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-gold px-7 py-2.5 text-xs font-semibold uppercase tracking-widest text-wine-950 transition-colors hover:bg-gold-light"
            >
              {whatWeHandle.cta}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
