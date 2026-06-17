import { Section } from "../ui/Section";
import { Placeholder } from "../ui/Placeholder";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";
import { whatWeHandle } from "@/lib/content";

export function WhatWeHandle() {
  return (
    <Section>
      <div className="grid items-center gap-12 md:grid-cols-2">
        {/* 3D isometric cube / server illustration */}
        <Reveal className="order-2 md:order-1">
          <Placeholder
            label="3D cube illustration"
            className="aspect-square w-full max-w-md"
          />
        </Reveal>

        <Reveal className="order-1 md:order-2" delay={100}>
          <h2 className="font-serif text-3xl tracking-tight text-cream sm:text-4xl">
            {whatWeHandle.heading}
          </h2>
          <div className="rule-gold mt-6 w-24" />
          <p className="mt-6 leading-relaxed text-cream-muted">
            {whatWeHandle.body}
          </p>
          <div className="mt-8">
            <Button href="#submit" variant="outline">
              {whatWeHandle.cta}
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
