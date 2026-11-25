"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

import { useHomeStats } from "@/src/features/home/hooks/use-home-stats";
import {
  MCJ_CONTACT,
  MCJ_WHY_FEATURES,
} from "@/src/shared/constants/site.constants";
import { Button } from "@/src/shared/components/ui/button";

export function HomeStatsSection() {
  const { stats, isLoading } = useHomeStats();

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(isLoading
            ? Array.from({ length: 4 }, () => ({ label: "Loading", value: "—" }))
            : stats
          ).map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-100 bg-[#F8FBFF] px-4 py-5 text-center"
            >
              <p className="text-2xl font-bold text-[#0B1F3A] sm:text-3xl">
                {item.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 sm:text-sm">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeWhyMcjSection() {
  return (
    <section className="bg-[#0B1F3A] py-14 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7DA2FF]">
            Why MCJ Academy
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            Why Choose MCJ Accounting Training Institute{" "}
            <span className="bg-gradient-to-r from-[#60A5FA] to-[#A78BFA] bg-clip-text text-transparent">
              in Bangalore?
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
            We provide practical, career-focused accounting and taxation
            training to help learners develop the skills needed for
            professional opportunities.
          </p>
          <Link href="/about" className="mt-6 inline-flex">
            <Button className="rounded-xl bg-white text-[#0B1F3A] hover:bg-slate-100">
              Know More About Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {MCJ_WHY_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="text-sm font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


export function HomeFinalCtaSection() {
  const whatsappNumber = "918880007484";

  return (
    <section className="bg-[#0B1F3A] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#102A56] to-[#0B1F3A] px-6 py-10 text-center sm:px-10">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Start Your Accounting Career with MCJ Academy
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Looking to build a career in accounting, taxation or finance? Choose
          the right accounting training programme and develop practical skills
          with MCJ Accounting Training Institute. Contact us to learn about
          courses, upcoming batches and free demo classes.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/contact">
            <Button className="rounded-xl bg-white px-6 text-[#0B1F3A] hover:bg-slate-100">
              Enquire Now
            </Button>
          </Link>

          <Link href="/contact">
            <Button
              variant="outline"
              className="rounded-xl border-white/30 bg-transparent px-6 text-white hover:bg-white/10"
            >
              Book a Free Demo
            </Button>
          </Link>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="rounded-xl bg-[#25D366] px-6 text-white hover:bg-[#1DA851]">
              WhatsApp Us
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

