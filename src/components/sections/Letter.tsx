import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { letter } from "@/lib/content";

export function Letter() {
  return (
    <section className="px-6 py-10 sm:px-8 sm:py-12">
      <Reveal className="mx-auto w-full max-w-5xl">
        <div
          className="relative px-4 py-2 text-center sm:px-5 sm:py-3"
          style={{
            borderStyle: "solid",
            borderColor: "transparent",
            borderWidth: "clamp(16px, 2vw, 28px)",
            borderImage: "url(/letter-frame.png) 90 / 1 / 0 stretch",
          }}
        >
          {/* top diamond accent */}
          <Image
            src="/accent-2.png"
            alt=""
            aria-hidden="true"
            width={476}
            height={22}
            className="mx-auto mb-4 h-auto w-28 sm:w-36"
          />

          <h2 className="font-sans text-2xl italic text-white sm:text-[27px]">
            {letter.heading}
          </h2>

          <div className="mx-auto mt-4 max-w-[63rem] space-y-3 text-base leading-[1.45] text-white sm:text-[16px]">
            {letter.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* plain divider line */}
          <Image
            src="/letter-line.png"
            alt=""
            aria-hidden="true"
            width={746}
            height={2}
            className="mx-auto mt-5 h-px w-[86%] max-w-[44rem]"
          />

          <p className="mt-4 font-sans text-lg italic text-gold sm:text-[20px]">
            {letter.closing}
          </p>

          <div className="mt-2 space-y-1">
            {letter.cofounders.map((c) => (
              <p
                key={c.name}
                className="whitespace-nowrap font-sans text-sm italic text-white sm:whitespace-normal sm:text-[20px]"
              >
                <span className="font-bold">{c.name}</span>{" "}
                <span className="text-white/85">· {c.title}</span>
              </p>
            ))}
          </div>

          <p className="mt-2 font-sans text-base italic text-white/80 sm:text-[18px]">
            {letter.cofoundersNote}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
