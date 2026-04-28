"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/src/shared/components/ui/button";
import { Container } from "@/src/shared/components/ui/container";
import { Section } from "@/src/shared/components/ui/section";
import { Heading } from "@/src/shared/components/ui/heading";

export function CTASection() {
  return (
    <Section className="py-14 bg-white">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 shadow-xl">

          {/* Subtle Background inside card only */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-yellow-50 opacity-70" />

          <div className="relative grid md:grid-cols-2 items-center gap-10 px-8 py-12 md:px-16 md:py-16">

            {/* LEFT CONTENT */}
            <div className="text-center md:text-left">

              <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4">
                Learn. Practice. Succeed.
              </p>

              <Heading
                title="Build Your Career with Industry-Ready Skills"
                subtitle="Join MCJ Institute to access expert-led courses, live classes, downloadable notes, and real-world training that helps you crack interviews with confidence."
              />

              <div className="mt-8 flex flex-col sm:flex-row items-center md:items-start gap-4">

                <Link href="/courses">
                  <Button className="px-4 py-3 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 transition-all shadow-lg">
                    Explore Courses 📚
                  </Button>
                </Link>

                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="px-4 py-3 text-lg rounded-xl border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                  >
                    Talk to Counselor
                  </Button>
                </Link>

              </div>

              <p className="mt-6 text-sm text-gray-500">
                10,000+ students trained • Placement-focused learning • Expert mentors
              </p>
            </div>

            {/* RIGHT IMAGE (FIXED FOR PNG LOOK) */}
            <div className="flex justify-center md:justify-end">
              <Image
                src="/images/student-learning.png"
                alt="Student learning"
                width={420}
                height={420}
                priority
                className="
                  w-full 
                  max-w-[380px] 
                  h-auto 
                  object-contain 
                  drop-shadow-2xl
                  mix-blend-multiply
                "
              />
            </div>

          </div>
        </div>
      </Container>
    </Section>
  );
}