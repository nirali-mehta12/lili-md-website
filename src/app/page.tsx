import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Letter } from "@/components/sections/Letter";
import { WorkLess } from "@/components/sections/WorkLess";
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

// Gated by proxy.ts — render per-request so the access check always runs.
// A statically cached page would be served by the CDN regardless of session,
// which would bypass the gate entirely.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Letter />
        <WorkLess />
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
