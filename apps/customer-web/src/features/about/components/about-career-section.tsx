"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

export function AboutCareerSection() {
  return (
    <section className="relative overflow-hidden bg-white py-14 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF]" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#BFDBFE]/35 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-[0_16px_40px_rgba(11,31,58,0.06)] sm:px-10 sm:py-12 lg:px-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
            Career outcomes
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-[#0B1F3A] sm:text-4xl">
            Build Skills.
            <br />
            Build Confidence.
            <br />
            Build Your Career.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            With expert trainers, live projects, and placement support, MCJ helps
            students become job-ready and build successful careers in accounting
            and taxation.
          </p>
          <div className="mt-7">
            <Link href="/courses">
              <Button className="h-11 rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-5 text-white hover:from-[#2860D4] hover:to-[#1A3F96]">
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
