import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { workLess } from "@/lib/content";

export function WorkLess() {
  return (
    <section className="px-6 py-10 sm:px-8 sm:py-12">
      <Reveal className="mx-auto w-[92%] max-w-[58rem]">
        <div
          className="flex items-center justify-center rounded-2xl bg-cover bg-center px-6 py-8 text-center shadow-2xl shadow-black/30 sm:px-10 sm:py-12"
          style={{ backgroundImage: "url(/gold-card-bg.png)" }}
        >
          <div>
            <h2 className="font-serif text-2xl text-ink-gold sm:text-[36px]">
              {workLess.heading}
            </h2>
            <Image
              src="/workless-accent.png"
              alt=""
              aria-hidden="true"
              width={476}
              height={22}
              className="mx-auto mt-4 h-auto w-40 sm:w-48"
            />
            <p className="mx-auto mt-4 max-w-[40rem] text-sm leading-relaxed text-ink-gold sm:text-[15px]">
              {workLess.body}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
