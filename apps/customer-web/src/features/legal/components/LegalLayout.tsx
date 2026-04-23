"use client";

import { Container } from "@/src/shared/components/ui/container";
import { Section } from "@/src/shared/components/ui/section";

interface Props {
  title: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, children }: Props) {
  return (
    <main>

      {/* HEADER */}
      <Section className="bg-white pt-20 pb-10">
        <Container>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f2044]">
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </Container>
      </Section>

      {/* CONTENT */}
      <Section className="bg-[#fdf8ef] py-16">
        <Container>
          <div className="max-w-4xl space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
            {children}
          </div>
        </Container>
      </Section>

    </main>
  );
}