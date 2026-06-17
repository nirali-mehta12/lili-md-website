import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { WhatWeHandle } from "@/components/sections/WhatWeHandle";
import { Asset } from "@/components/sections/Asset";
import { Benefits } from "@/components/sections/Benefits";
import { Phases } from "@/components/sections/Phases";
import { Trust } from "@/components/sections/Trust";
import { Tiers } from "@/components/sections/Tiers";
import { Timeline } from "@/components/sections/Timeline";
import { FoundingTen } from "@/components/sections/FoundingTen";
import { SubmitForm } from "@/components/sections/SubmitForm";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Problem />
        <WhatWeHandle />
        <Asset />
        <Benefits />
        <Phases />
        <Trust />
        <Tiers />
        <Timeline />
        <FoundingTen />
        <SubmitForm />
      </main>
      <Footer />
    </>
  );
}
